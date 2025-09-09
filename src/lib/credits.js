export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/** Convert £/hr to credits per hour. Clamp to 1..10. */
export function gbpToCreditsPerHour(gbp) {
  const rate = Number(gbp || 0);
  const credits = Math.round(rate / 10); // £10 ≈ 1 credit (tweak later)
  return clamp(credits, 1, 10);
}

export const CREDIT_GUIDANCE = "Most listings sit around 3-6 credits/hour.";
