// Shared UPI helpers — used by both the ground owner's payment-collection
// reminders (GroundOwnerDashboard) and the renter's actual booking payment
// (GroundBooking). Kept in one place so the link format never drifts.

/**
 * Builds a standard `upi://pay` deep link — the same intent GPay/PhonePe/
 * Paytm "Pay" buttons use across the web. Opening it on a phone hands off
 * straight to whichever UPI apps are installed; no bank account number or
 * IFSC is ever involved, and no payment gateway sits in the middle.
 */
export function buildUpiLink({ payeeVpa, payeeName, amount, note, refId }) {
  const params = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: String(amount),
    cu: 'INR',
  })
  if (note) params.set('tn', note)
  if (refId) params.set('tr', refId)
  return `upi://pay?${params.toString()}`
}

/** Loose validation for a UPI VPA, e.g. `name@okhdfcbank`. */
export function isValidUpiId(value) {
  return /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test((value || '').trim())
}
