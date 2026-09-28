/** Normalized document travel; safe for short pages, overscroll and malformed sizes. */
export function scrollProgress(top: number, height: number, viewport: number) {
  if (![top, height, viewport].every(Number.isFinite) || height <= viewport)
    return 0;
  return Math.max(0, Math.min(1, -top / (height - viewport)));
}
/** Frame-rate independent easing, capped after tab suspension. */
export function easeSculpture(
  current: number,
  target: number,
  seconds: number,
) {
  return (
    current +
    (target - current) *
      (1 - Math.exp(-Math.max(0, Math.min(seconds, 0.05)) * 6))
  );
}
