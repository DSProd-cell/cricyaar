-- Fixes "infinite recursion detected in policy for relation profiles".
--
-- The admin policies on public.profiles decided "is this user an admin?" by
-- selecting from public.profiles, so evaluating a profiles policy ran a query
-- on profiles, which evaluated the policy again, forever. Every profile read
-- for every signed-in user failed with a 500.
--
-- The check now lives in a SECURITY DEFINER function, which runs as the table
-- owner and therefore does not re-enter the policies. Safe to run twice.

-- ── 1. Admin check that does not recurse ────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ── 2. Recreate the two admin policies using it ─────────────────────────────
drop policy if exists "admins_can_read_all_profiles" on public.profiles;
create policy "admins_can_read_all_profiles"
  on public.profiles for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "admins_can_update_kyc_status" on public.profiles;
create policy "admins_can_update_kyc_status"
  on public.profiles for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ── 3. Nobody can make themselves an admin ──────────────────────────────────
-- "Users can update their own profile" lets a user change any column of their
-- own row, and the admin policy above then lets an admin update every row. So
-- without this guard, anyone could set their own role to 'admin' through the
-- public API and gain control of all profiles. Changes made from the Supabase
-- dashboard / service key (no signed-in user) are still allowed.
create or replace function public.guard_admin_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and (new.role is distinct from old.role or new.roles is distinct from old.roles)
     and (new.role = 'admin' or 'admin' = any (coalesce(new.roles, '{}')))
     and not public.is_admin()
  then
    raise exception 'Only an admin can grant the admin role' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_admin_role on public.profiles;
create trigger guard_admin_role
  before update on public.profiles
  for each row execute function public.guard_admin_role();
