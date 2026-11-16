import { Capacitor } from '@capacitor/core'

// True only inside the native iOS/Android app shell; false in any browser.
export const isNativeApp = () => {
  try { return Capacitor.isNativePlatform() } catch { return false }
}
