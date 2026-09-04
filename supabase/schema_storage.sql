-- CricYaar — Phase 3 schema: Storage buckets for photos.
--
-- Run this once in the Supabase SQL Editor, same as the earlier files.
--
-- Two public buckets: uploaded files are readable by anyone with the URL
-- (fine — these are public listing/profile photos, not private documents),
-- but only signed-in users can upload, and only into a folder matching
-- their own id — enforced by the path check in each INSERT policy below,
-- not just trusted client-side.
--   avatars/<user id>/<file>
--   grounds/<owner id>/<file>

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('grounds', 'grounds', true);

create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can replace their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Ground photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'grounds');

create policy "Users can upload photos under their own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'grounds' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can replace their own ground photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'grounds' and (storage.foldername(name))[1] = auth.uid()::text);
