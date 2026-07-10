/**
 * Decide si el overlay CRT debe pintarse. Se extrae como función pura
 * (en vez de resolverlo solo en CSS) para poder testear el gate de
 * reduced-motion sin necesidad de infraestructura de testing de React.
 */
export function shouldApplyCrt(crtEnabled: boolean, prefersReducedMotion: boolean): boolean {
  return crtEnabled && !prefersReducedMotion;
}
