// IUPAC (CIAAW) abridged standard atomic weights, conventional values.
// TODO(verify): typed from the CIAAW 2021 abridged table; ciaaw.org was not re-checked in this environment.
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.990,
  Mg: 24.305,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
};

export interface MolarMass {
  value: number; // g/mol
  breakdown: string; // e.g. "C 12.011×6 + H 1.008×12 + O 15.999×6"
}

/** Molar mass computed from a simple formula such as "C6H12O6" (no parentheses). */
export function molarMass(formula: string): MolarMass {
  const re = /([A-Z][a-z]?)(\d*)/g;
  let total = 0;
  const parts: string[] = [];
  let consumed = 0;
  for (const m of formula.matchAll(re)) {
    if (m[0] === '') continue;
    const w = ATOMIC_WEIGHTS[m[1]];
    if (w === undefined) throw new Error(`Unknown element ${m[1]} in ${formula}`);
    const n = m[2] === '' ? 1 : Number(m[2]);
    total += w * n;
    consumed += m[0].length;
    parts.push(`${m[1]} ${w}×${n}`);
  }
  if (consumed !== formula.length) throw new Error(`Cannot parse formula ${formula}`);
  return { value: total, breakdown: parts.join(' + ') };
}
