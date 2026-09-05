-- CricYaar — adds a `bio` column to `profiles`.
--
-- Run this once in the Supabase SQL Editor, same as the earlier files.
-- The "Edit Profile" sheet has always collected a short bio; there was
-- just nowhere for it to actually be saved until now.

alter table public.profiles add column bio text;
