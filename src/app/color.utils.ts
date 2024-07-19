/**
 * Adds alpha channel to the color.
 *
 * @param color an hexadecimal color: #FAFAFA
 * @param alpha a number between 0 and 1. (0 -> transparent, 1 -> opaque)
 * @returns new color with transparency: #FAFAFA0D
 */
export function addAlphaToColor(color: string, alpha: number): string {
  const alphaInHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${alphaInHex}`;
}
