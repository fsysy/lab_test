import { describe, expect, it, test } from 'vitest';
import { convert } from '../src/lib/convert';
import { molarMass } from '../src/data/atomicWeights';
import { HBA1C_INTERCEPT, HBA1C_SLOPE } from '../src/lib/special';

const val = (id: string, v: number, f: string, t: string) => {
  const r = convert(id, v, f, t);
  if (!r.ok) throw new Error(r.reason);
  return r;
};

describe('molar mass from IUPAC atomic weights', () => {
  it('glucose C6H12O6 ≈ 180.156', () => expect(molarMass('C6H12O6').value).toBeCloseTo(180.156, 3));
  it('creatinine C4H7N3O ≈ 113.12', () => expect(molarMass('C4H7N3O').value).toBeCloseTo(113.118, 2));
  it('rejects unknown elements', () => expect(() => molarMass('Xx2')).toThrow());
});

describe('UCUM-based conversion', () => {
  it('glucose 100 mg/dL → 5.55 mmol/L', () => expect(val('glucose', 100, 'mg/dL', 'mmol/L').value).toBeCloseTo(5.5507, 3));
  it('is reversible', () => {
    const mmol = val('creatinine', 1, 'mg/dL', 'umol/L').value;
    expect(val('creatinine', mmol, 'umol/L', 'mg/dL').value).toBeCloseTo(1, 10);
  });
  it('mEq/L ↔ mmol/L uses charge (Na z=1, Ca z=2)', () => {
    expect(val('sodium', 140, 'mEq/L', 'mmol/L').value).toBe(140);
    expect(val('calcium', 5, 'mmol/L', 'meq/L').value).toBe(10);
  });
  it('accepts μ / µ / mEq spellings', () => {
    expect(val('creatinine', 1, 'mg/dL', 'μmol/L').value).toBeCloseTo(88.4, 0);
    expect(val('potassium', 4, 'mEq/L', 'mmol/L').value).toBe(4);
  });
  it('enzyme U/L ↔ μkat/L by UCUM definition', () => {
    expect(val('alt', 60, 'U/L', 'ukat/L').value).toBeCloseTo(1, 10);
  });
  it('g/dL ↔ g/L for protein', () => expect(val('albumin', 4, 'g/dL', 'g/L').value).toBeCloseTo(40, 10));
});

describe('refusals with reasons', () => {
  it('mg/dL → U/L is refused', () => {
    const r = convert('alt', 10, 'mg/dL', 'U/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/효소활성|근거/);
  });
  it('glucose mg/dL → U/L is refused (dimension mismatch)', () => expect(convert('glucose', 10, 'mg/dL', 'U/L').ok).toBe(false));
  it('phosphorus mEq/L is refused (no single charge)', () => {
    const r = convert('phosphorus', 3, 'mg/dL', 'meq/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/전하/);
  });
  it('albumin g/dL → mmol/L is refused (no molar mass defined)', () => expect(convert('albumin', 4, 'g/dL', 'mmol/L').ok).toBe(false));
  it('unknown unit is refused', () => expect(convert('glucose', 1, 'foo/bar', 'mmol/L').ok).toBe(false));
});

describe('special conversions', () => {
  it('HbA1c 6.5 % → 47.5 mmol/mol (master equation)', () => {
    expect(val('hba1c', 6.5, '%', 'mmol/mol').value).toBeCloseTo((6.5 - HBA1C_INTERCEPT) / HBA1C_SLOPE, 10);
    expect(val('hba1c', 6.5, '%', 'mmol/mol').value).toBeCloseTo(47.5, 1);
  });
  it('HbA1c 48 mmol/mol → 6.54 %', () => expect(val('hba1c', 48, 'mmol/mol', '%').value).toBeCloseTo(6.543, 2));
  it('HbA1c round trip', () => {
    const ifcc = val('hba1c', 7.2, '%', 'mmol/mol').value;
    expect(val('hba1c', ifcc, 'mmol/mol', '%').value).toBeCloseTo(7.2, 10);
  });
  it('uACR 30 mg/g → 3.39 mg/mmol, matching UCUM with creatinine MW', () => {
    const r = val('uacr', 30, 'mg/g', 'mg/mmol');
    expect(r.value).toBeCloseTo(3.39, 2);
    const mw = molarMass('C4H7N3O').value;
    expect(r.value).toBeCloseTo((30 * mw) / 1000, 10);
  });
  it('uPCR 15 mg/mmol → mg/g', () => expect(val('upcr', 15, 'mg/mmol', 'mg/g').value).toBeCloseTo(132.6, 0));
  it('BUN 14 mg/dL → 5.0 mmol/L urea', () => {
    expect(val('bun-urea', 14, 'BUN mg/dL', 'urea mmol/L').value).toBeCloseTo(5.0, 1);
    expect(val('bun', 14, 'mg/dL', 'mmol/L').value).toBeCloseTo(5.0, 1);
  });
  it('BUN → urea mg/dL ≈ ×2.14', () => expect(val('bun-urea', 10, 'BUN mg/dL', 'urea mg/dL').value).toBeCloseTo(21.43, 1));
  it('special analytes refuse unsupported unit pairs', () => expect(convert('hba1c', 6, '%', 'mg/dL').ok).toBe(false));
});

// Cross-check ONLY (not used by the app): Labcorp SI Unit Conversion Table,
// https://www.labcorp.com/resource/si-unit-conversion-table — "conventional → SI (multiply by)".
// Labcorp rounds to 3-4 significant digits, so allow 1 % relative tolerance.
describe('cross-check vs Labcorp SI Unit Conversion Table', () => {
  const rows: [string, string, string, number][] = [
    ['glucose', 'mg/dL', 'mmol/L', 0.0555],
    ['creatinine', 'mg/dL', 'umol/L', 88.4],
    ['cholesterol', 'mg/dL', 'mmol/L', 0.0259],
    ['triglycerides', 'mg/dL', 'mmol/L', 0.0113],
    ['bun', 'mg/dL', 'mmol/L', 0.357],
    ['calcium', 'mg/dL', 'mmol/L', 0.25],
    ['magnesium', 'mg/dL', 'mmol/L', 0.4114],
    ['phosphorus', 'mg/dL', 'mmol/L', 0.323],
    ['uric-acid', 'mg/dL', 'umol/L', 59.48],
    ['bilirubin', 'mg/dL', 'umol/L', 17.1],
    ['lactate', 'mg/dL', 'mmol/L', 0.111],
    ['albumin', 'g/dL', 'g/L', 10],
  ];
  it.each(rows)('%s %s → %s ×%s', (id, f, t, labcorp) => {
    const factor = val(id, 1, f, t).basis.factor;
    expect(Math.abs(factor - labcorp) / labcorp).toBeLessThan(0.01);
  });
  it('uric acid: Labcorp lists mmol/L 0.059', () => {
    expect(val('uric-acid', 1, 'mg/dL', 'mmol/L').basis.factor).toBeCloseTo(0.059, 3);
  });
});

describe('cross-check vs other sources', () => {
  test.todo('TODO(verify): CMEinfo conversion table PDF — the PDF URL could not be located/downloaded');
  test.todo('TODO(verify): NBME Laboratory Reference Values PDF — official PDF URL returned 404; only mirrors found');
});
