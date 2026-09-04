-- CricYaar — Phase 5 schema: fire a push notification when a ground's
-- status changes (approved / rejected).
--
-- Run this once in the Supabase SQL Editor, same as the earlier files —
-- but only AFTER the `send-push` Edge Function has been deployed (see
-- supabase/functions/send-push/README.md for the two steps that need your
-- Firebase/Supabase login, which nothing here can do for you).
--
-- How it works: a trigger on `grounds` fires on every UPDATE, calls the
-- `send-push` function via pg_net (a fire-and-forget async HTTP call, so it
-- never slows down or blocks the actual update), and the function itself
-- decides whether that particular change is actually notification-worthy.
--
-- The shared secret below (also set as the Edge Function's
-- PUSH_TRIGGER_SECRET) stops a stranger who finds the function's public URL
-- from sending arbitrary pushes through it — the function only accepts
-- requests carrying this exact value. It's fine that this value sits in
-- committed SQL: it only works in combination with your specific Supabase
-- project's URL and your specific Edge Function deployment.

create extension if not exists pg_net;

create or replace function public.notify_ground_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if OLD.status is distinct from NEW.status then
    perform net.http_post(
      url := 'https://okqbagfyuizvahhpimuh.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-push-trigger-secret', 'e54d03ef8b9b361bf05271154e9fff889a833b6c4818978d'
      ),
      body := jsonb_build_object(
        'type', 'UPDATE',
        'table', 'grounds',
        'record', to_jsonb(NEW),
        'old_record', to_jsonb(OLD)
      )
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_ground_status_change on public.grounds;
create trigger on_ground_status_change
  after update on public.grounds
  for each row
  execute function public.notify_ground_status_change();
