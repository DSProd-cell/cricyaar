import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

/** Android now defaults to edge-to-edge (mandatory since API 35, which this
 * app targets) — the WebView draws under the status bar unless told
 * otherwise, which is what caused app content to visibly peek through/behind
 * it. Telling the status bar not to overlay reserves it real, non-overlapping
 * space instead, so page content reliably starts below it. */
export function initStatusBar() {
  if (!Capacitor.isNativePlatform()) return
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
  StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {})
  StatusBar.setStyle({ style: Style.Light }).catch(() => {})
}
