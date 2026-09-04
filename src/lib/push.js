import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from './supabase'

async function saveToken(userId, token) {
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token, platform: Capacitor.getPlatform() }, { onConflict: 'token' })
  if (error) console.error('Failed to save push token', error)
}

let listenersReady = false
function ensureListeners(userId) {
  if (listenersReady) return
  listenersReady = true
  PushNotifications.addListener('registration', (token) => saveToken(userId, token.value))
  PushNotifications.addListener('registrationError', (err) => console.error('Push registration error', err))
}

/** Requests notification permission and registers this device for push —
 * no-ops on web (Capacitor.isNativePlatform() is false there). Safe to call
 * repeatedly (on login and on every app foreground) — registering again
 * with the same token is a harmless upsert, and this is what picks up a
 * permission the user granted from system Settings mid-session instead of
 * the in-app prompt. */
export async function registerPush(userId) {
  if (!Capacitor.isNativePlatform() || !userId) return

  const { receive } = await PushNotifications.checkPermissions()
  let status = receive
  if (status === 'prompt' || status === 'prompt-with-rationale') {
    const res = await PushNotifications.requestPermissions()
    status = res.receive
  }
  if (status !== 'granted') return

  ensureListeners(userId)
  await PushNotifications.register()
}
