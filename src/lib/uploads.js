import { supabase } from './supabase'

function extOf(file) {
  const m = /\.[a-zA-Z0-9]+$/.exec(file.name)
  return m ? m[0] : ''
}

async function uploadToBucket(bucket, folderUserId, file) {
  const path = `${folderUserId}/${Date.now()}${extOf(file)}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/** Uploads to the `avatars` bucket under the signed-in user's own folder,
 * as required by its storage policy. Returns the public URL. */
export function uploadAvatar(userId, file) {
  return uploadToBucket('avatars', userId, file)
}

/** Uploads to the `grounds` bucket, filed under the ground OWNER's id
 * (not the ground's id) — that's what the storage policy checks against. */
export function uploadGroundPhoto(ownerId, file) {
  return uploadToBucket('grounds', ownerId, file)
}
