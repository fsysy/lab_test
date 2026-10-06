import { describe, expect, it } from 'vitest';
import { REFERENCE_INTERVALS } from '../src/data/referenceIntervals';
import { ageInYears, judge, lookupIntervals } from '../src/lib/interval';

describe('reference interval lookup', () => {
  it('adult male creatinine 30 y → 60–110 µmol/L', () => {
    const r = lookupIntervals('creatinine', 30, 'M', 'serum');
    expect(r).toHaveLength(1);
    expect([r[0].low, r[0].high, r[0].unit]).toEqual([60, 110, 'umol/L']);
  });
  it('adult female creatinine 30 y → 45–90', () => {
    const r = lookupIntervals('creatinine', 30, 'F', 'serum');
    expect([r[0].low, r[0].high]).toEqual([45, 90]);
  });
  it('creatinine ≥60 y: no published interval, nothing extrapolated', () => {
    expect(lookupIntervals('creatinine', 65, 'M', 'serum')).toEqual([]);
  });
  it('plasma vs serum potassium differ in children', () => {
    const s = lookupIntervals('potassium', ageInYears(3, 'weeks'), 'M', 'serum')[0];
    const p = lookupIntervals('potassium', ageInYears(3, 'weeks'), 'M', 'plasma')[0];
    expect([s.low, s.high]).toEqual([4.2, 6.7]);
    expect([p.low, p.high]).toEqual([3.8, 6.4]);
  });
  it('age band boundaries: lower inclusive, upper exclusive', () => {
    expect(lookupIntervals('sodium', ageInYears(1, 'weeks'), 'M', 'serum')[0].low).toBe(133);
    expect(lookupIntervals('sodium', ageInYears(0.99, 'weeks'), 'M', 'serum')[0].low).toBe(132);
    expect(lookupIntervals('sodium', 18, 'M', 'serum')[0].low).toBe(135);
    expect(lookupIntervals('sodium', 17.99, 'M', 'serum')[0].low).toBe(133);
  });
  it('sex-specific paediatric ALP', () => {
    expect(lookupIntervals('alp', 12, 'M', 'serum')[0].high).toBe(530);
    expect(lookupIntervals('alp', 12, 'F', 'serum')[0].high).toBe(460);
  });
  it('ALP adult interval starts at 22 y', () => {
    expect(lookupIntervals('alp', 22, 'M', 'serum')[0].high).toBe(110);
    expect(lookupIntervals('alp', 21.5, 'M', 'serum')[0].high).toBe(150);
  });
  it('no adult-only analytes below 18 y (LDH has no paediatric interval)', () => {
    expect(lookupIntervals('ldh', 10, 'M', 'serum')).toEqual([]);
  });
  it('every interval is well formed', () => {
    for (const r of REFERENCE_INTERVALS) {
      expect(r.low).toBeLessThan(r.high);
      if (r.ageMax !== null) expect(r.ageMin).toBeLessThan(r.ageMax);
    }
  });
});

describe('low / normal / high', () => {
  const r = { low: 135, high: 145 };
  it('judges', () => {
    expect(judge(134.9, r)).toBe('low');
    expect(judge(135, r)).toBe('normal');
    expect(judge(145, r)).toBe('normal');
    expect(judge(145.1, r)).toBe('high');
  });
});
