import { registerPlugin, WebPlugin } from '@capacitor/core'
import { buildUpiLink } from './upi'

// Web/dev fallback — there's no native activity-result channel in a browser,
// so this can only do the old fire-and-blind redirect. Any caller needs to
// treat 'UNKNOWN' as "ask the user", exactly like before this plugin existed.
class UpiPaymentWeb extends WebPlugin {
  async pay({ vpa, payeeName, amount, note, refId }) {
    const link = buildUpiLink({ payeeVpa: vpa, payeeName, amount, note, refId })
    // '_system' tells Capacitor to hand off to the OS intent system (Android UPI app chooser)
    // and return to the app afterwards — unlike window.location.href which navigates away
    window.open(link, '_system')
    return { status: 'UNKNOWN' }
  }
}

/**
 * Native (Android): launches upi://pay via startActivityForResult and
 * resolves with whatever the UPI app reports back — status is one of
 * 'SUCCESS' | 'FAILURE' | 'SUBMITTED' | 'CANCELLED' | 'UNKNOWN'.
 * Only 'SUCCESS' should ever be treated as a confirmed payment; everything
 * else is unverified and the caller should fall back to asking the user.
 * Web: always resolves 'UNKNOWN' after a best-effort redirect.
 */
const UpiPayment = registerPlugin('UpiPayment', {
  web: () => new UpiPaymentWeb(),
})

export default UpiPayment
