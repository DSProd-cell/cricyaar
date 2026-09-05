import { Geolocation } from '@capacitor/geolocation'

/** Current device position as { lat, lng }, or null if permission is
 * denied/unavailable — callers should treat null as "couldn't get it,
 * carry on without it" rather than an error to surface loudly. Works on
 * both native (real GPS permission prompt) and web (browser geolocation). */
export async function getCurrentCoords() {
  try {
    const perm = await Geolocation.checkPermissions()
    if (perm.location !== 'granted') {
      const req = await Geolocation.requestPermissions()
      if (req.location !== 'granted') return null
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  } catch {
    return null
  }
}

/** Great-circle distance between two lat/lng points, in kilometres. */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
