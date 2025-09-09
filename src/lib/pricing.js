// src/lib/pricing.js
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/** Map £/hr to credits/hr. Default: ~£10 per credit, clamped to 1..10 */
export function gbpToCredits(gbp) {
  const g = Number(gbp) || 0;
  return clamp(Math.round(g / 10), 1, 10);
}
