import { REFERENCE_INTERVALS, WEEKS_PER_YEAR, type RefInterval, type Sex, type SpecimenKind } from '../data/referenceIntervals';

export type AgeUnit = 'years' | 'weeks';

export function ageInYears(value: number, unit: AgeUnit): number {
  return unit === 'weeks' ? value / WEEKS_PER_YEAR : value;
}

/** Only intervals that were published for exactly this analyte/age/sex/specimen. No extrapolation. */
export function lookupIntervals(analyte: string, ageYears: number, sex: Exclude<Sex, 'any'>, specimen: SpecimenKind): RefInterval[] {
  return REFERENCE_INTERVALS.filter(
    (r) =>
      r.analyte === analyte &&
      r.specimens.includes(specimen) &&
      (r.sex === 'any' || r.sex === sex) &&
      ageYears >= r.ageMin &&
      (r.ageMax === null || ageYears < r.ageMax),
  );
}

export type Flag = 'low' | 'normal' | 'high';

export function judge(value: number, r: Pick<RefInterval, 'low' | 'high'>): Flag {
  if (value < r.low) return 'low';
  if (value > r.high) return 'high';
  return 'normal';
}
