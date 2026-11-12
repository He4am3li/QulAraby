/**
 * Authorize by the signed token email and an explicitly approved user profile.
 * Keep this pure and fail closed so it can be regression tested without secrets.
 */
export function isApprovedGatewayProfile(profile, tokenEmail) {
  return typeof tokenEmail === 'string' &&
    tokenEmail.length > 0 &&
    profile !== null &&
    typeof profile === 'object' &&
    profile.approved === true &&
    profile.email === tokenEmail;
}
