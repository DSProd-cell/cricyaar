-- CricYaar — UPI ground payments.
--
-- Run this once in the Supabase SQL Editor (after schema.sql and
-- schema_grounds.sql).
--
-- Design notes:
--  - Payments go straight from renter to ground owner over UPI — a
--    `upi://pay` deep link built from the owner's own VPA, opened on the
--    renter's phone. There is no payment gateway in the loop, so there is
--    no server-side callback confirming a payment actually landed. This
--    schema reflects that honestly: `payment_status` starts at
--    'claimed_paid' the moment the renter says "I've paid" (a trust-based
--    flow, same as a shopkeeper taking UPI off their own phone), and the
--    ground owner marks it 'confirmed' once they've checked their own UPI
--    app / bank statement. A booking a renter arranges to pay for at the
--    venue instead (e.g. the ground has no UPI ID on file yet) stays
--    'pending' until the owner confirms.
--  - The owner's UPI ID lives on `profiles`, not `grounds` — it's the
--    person's own collection VPA, not a property of any one ground, and
--    every signed-in user already has a `profiles` row (unlike `grounds`,
--    which the 85 seeded listings don't have an owner account for at all).

alter table public.profiles add column if not exists upi_id text;

create table public.ground_bookings (
  id uuid primary key default gen_random_uuid(),
  ground_id uuid not null references public.grounds (id) on delete cascade,
  renter_id uuid not null references public.profiles (id) on delete cascade,
  booking_date date,
  slot_start text,
  slot_end text,
  ball_type text,
  players text,
  overs integer,
  note text,
  amount numeric not null,
  booking_ref text not null unique,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'claimed_paid', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.ground_bookings enable row level security;

-- A renter creates and reads their own bookings.
create policy "Renters can insert their own bookings"
  on public.ground_bookings for insert
  to authenticated
  with check (renter_id = auth.uid());

create policy "Renters can read their own bookings"
  on public.ground_bookings for select
  to authenticated
  using (renter_id = auth.uid());

-- A ground owner can read and update (e.g. confirm payment) bookings made
-- against their own ground.
create policy "Ground owners can read bookings for their ground"
  on public.ground_bookings for select
  to authenticated
  using (exists (
    select 1 from public.grounds g
    where g.id = ground_bookings.ground_id and g.owner_id = auth.uid()
  ));

create policy "Ground owners can update bookings for their ground"
  on public.ground_bookings for update
  to authenticated
  using (exists (
    select 1 from public.grounds g
    where g.id = ground_bookings.ground_id and g.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.grounds g
    where g.id = ground_bookings.ground_id and g.owner_id = auth.uid()
  ));
