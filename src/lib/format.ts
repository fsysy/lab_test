/** Format a number with ~6 significant digits, no trailing zeros, no exponent for ordinary magnitudes. */
export function fmt(n: number, digits = 6): string {
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e-4 && abs < 1e9) {
    return String(Number(n.toPrecision(digits)));
  }
  return Number(n.toPrecision(digits)).toExponential();
}

/** Display form of a UCUM unit code. */
export function unitLabel(u: string): string {
  return u.replace(/^u/, 'μ').replace(/\/u/g, '/μ').replace(/\bmeq\b/g, 'mEq').replace(/meq\//g, 'mEq/');
}
