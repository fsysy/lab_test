// Australasian (AACB/RCPA) Harmonised Reference Intervals, first panel.
// Transcribed from Tate JR et al., Clin Biochem Rev 2014;35(4):213-235, Tables 1 (adult) and 2 (paediatric),
// open access: https://pmc.ncbi.nlm.nih.gov/articles/PMC4310061
// The RCPA web page (Table 6) itself returned HTTP 403 (Cloudflare) from this environment, so values could not be
// compared against it directly. TODO(verify): compare with https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem
// Only intervals that appear in that source are included; nothing is extrapolated or filled in.

export type Sex = 'M' | 'F' | 'any';
export type SpecimenKind = 'serum' | 'plasma';

export interface RefInterval {
  analyte: string;
  sex: Sex;
  /** Inclusive lower age bound / exclusive upper bound, in years (weeks converted by /52.1775). null = no upper bound. */
  ageMin: number;
  ageMax: number | null;
  ageLabel: string;
  low: number;
  high: number;
  unit: string;
  specimens: SpecimenKind[];
  note?: string;
}

export interface RefAnalyte {
  id: string;
  en: string;
  ko: string;
  synonyms: string[];
  /** id in the conversion analytes (for entering results in another unit) */
  convertId?: string;
}

export const WEEKS_PER_YEAR = 52.1775;
const W = (w: number) => w / WEEKS_PER_YEAR;

export const REF_ANALYTES: RefAnalyte[] = [
  { id: 'sodium', en: 'Sodium', ko: '나트륨', synonyms: ['Na'], convertId: 'sodium' },
  { id: 'potassium', en: 'Potassium', ko: '칼륨', synonyms: ['K'], convertId: 'potassium' },
  { id: 'chloride', en: 'Chloride', ko: '염소', synonyms: ['Cl'], convertId: 'chloride' },
  { id: 'bicarbonate', en: 'Bicarbonate', ko: '중탄산염', synonyms: ['HCO3', 'CO2'], convertId: 'bicarbonate' },
  { id: 'creatinine', en: 'Creatinine', ko: '크레아티닌', synonyms: ['Cr'], convertId: 'creatinine' },
  { id: 'calcium', en: 'Calcium', ko: '칼슘', synonyms: ['Ca'], convertId: 'calcium' },
  { id: 'calcium-adj', en: 'Calcium (albumin adjusted)', ko: '칼슘(알부민 보정)', synonyms: ['corrected calcium'], convertId: 'calcium' },
  { id: 'phosphate', en: 'Phosphate', ko: '인', synonyms: ['phosphorus', 'P', 'PO4'], convertId: 'phosphorus' },
  { id: 'magnesium', en: 'Magnesium', ko: '마그네슘', synonyms: ['Mg'], convertId: 'magnesium' },
  { id: 'ldh', en: 'Lactate dehydrogenase (L to P, IFCC)', ko: '젖산탈수소효소(LDH)', synonyms: ['LD', 'LDH'], convertId: 'ldh' },
  { id: 'alp', en: 'Alkaline phosphatase', ko: '알칼리인산분해효소(ALP)', synonyms: ['ALP'], convertId: 'alp' },
  { id: 'total-protein', en: 'Total protein', ko: '총단백', synonyms: ['TP'], convertId: 'total-protein' },
];

type Row = [
  analyte: string, sex: Sex, from: string, to: string | null, low: number, high: number,
  unit: string, specimens: SpecimenKind[], note?: string,
];

function age(s: string): number {
  const n = Number(s.slice(0, -1));
  return s.endsWith('w') ? W(n) : n;
}

const BOTH: SpecimenKind[] = ['serum', 'plasma'];
const ADULT_NOTE = '성인(≥18세) 구간. JCTLM 추적성 있는 측정법 사용 검사실용.';
const VITROS = '19세 미만 구간은 Ortho Vitros 효소법 크레아티닌 사용 검사실용. 그 외 검사실은 18세부터 성인 구간 적용.';

const rows: Row[] = [
  // ---- Adults (Table 1)
  ['sodium', 'any', '18y', null, 135, 145, 'mmol/L', BOTH, ADULT_NOTE],
  ['potassium', 'any', '18y', null, 3.5, 5.2, 'mmol/L', BOTH, ADULT_NOTE + ' 혈청·혈장 공용 구간(헤파린 혈장만 검사하는 곳은 더 낮은 구간 선택 가능).'],
  ['chloride', 'any', '18y', null, 95, 110, 'mmol/L', BOTH, ADULT_NOTE],
  ['bicarbonate', 'any', '18y', null, 22, 32, 'mmol/L', BOTH, ADULT_NOTE],
  ['creatinine', 'M', '18y', '60y', 60, 110, 'umol/L', BOTH, '성인 구간은 60세 미만까지 조화(harmonised). 이후는 각 검사실 자체 구간.'],
  ['creatinine', 'F', '18y', '60y', 45, 90, 'umol/L', BOTH, '성인 구간은 60세 미만까지 조화(harmonised). 이후는 각 검사실 자체 구간.'],
  ['calcium', 'any', '18y', null, 2.1, 2.6, 'mmol/L', BOTH, ADULT_NOTE],
  ['calcium-adj', 'any', '18y', null, 2.1, 2.6, 'mmol/L', BOTH, ADULT_NOTE],
  ['phosphate', 'any', '20y', null, 0.75, 1.5, 'mmol/L', BOTH, '소아 구간과 맞추기 위해 20세부터 시작.'],
  ['magnesium', 'any', '18y', null, 0.7, 1.1, 'mmol/L', BOTH, ADULT_NOTE],
  ['ldh', 'any', '18y', null, 120, 250, 'U/L', BOTH, ADULT_NOTE + ' 혈청·혈장 공용 구간(헤파린 혈장만 검사하는 곳은 더 낮은 구간 선택 가능).'],
  ['alp', 'any', '22y', null, 30, 110, 'U/L', BOTH, '소아 구간과 맞추기 위해 22세부터 시작.'],
  ['total-protein', 'any', '18y', null, 60, 80, 'g/L', BOTH, ADULT_NOTE],

  // ---- Paediatric (Table 2)
  ['sodium', 'any', '0w', '1w', 132, 147, 'mmol/L', BOTH],
  ['sodium', 'any', '1w', '18y', 133, 144, 'mmol/L', BOTH],
  ['potassium', 'any', '0w', '1w', 3.8, 6.5, 'mmol/L', ['serum'], '소아 혈청 칼륨 구간.'],
  ['potassium', 'any', '1w', '26w', 4.2, 6.7, 'mmol/L', ['serum'], '소아 혈청 칼륨 구간.'],
  ['potassium', 'any', '26w', '2y', 3.9, 5.6, 'mmol/L', ['serum'], '소아 혈청 칼륨 구간.'],
  ['potassium', 'any', '2y', '18y', 3.6, 5.3, 'mmol/L', ['serum'], '소아 혈청 칼륨 구간.'],
  ['potassium', 'any', '0w', '1w', 3.5, 6.2, 'mmol/L', ['plasma'], '소아 혈장 칼륨 구간.'],
  ['potassium', 'any', '1w', '26w', 3.8, 6.4, 'mmol/L', ['plasma'], '소아 혈장 칼륨 구간.'],
  ['potassium', 'any', '26w', '2y', 3.5, 5.4, 'mmol/L', ['plasma'], '소아 혈장 칼륨 구간.'],
  ['potassium', 'any', '2y', '18y', 3.3, 4.9, 'mmol/L', ['plasma'], '소아 혈장 칼륨 구간.'],
  ['chloride', 'any', '0w', '1w', 98, 115, 'mmol/L', BOTH],
  ['chloride', 'any', '1w', '18y', 97, 110, 'mmol/L', BOTH],
  ['bicarbonate', 'any', '0w', '1w', 15, 28, 'mmol/L', BOTH],
  ['bicarbonate', 'any', '1w', '2y', 16, 29, 'mmol/L', BOTH],
  ['bicarbonate', 'any', '2y', '10y', 17, 30, 'mmol/L', BOTH],
  ['bicarbonate', 'any', '10y', '18y', 20, 32, 'mmol/L', BOTH],
  ['creatinine', 'any', '0w', '1w', 22, 93, 'umol/L', BOTH, VITROS],
  ['creatinine', 'any', '1w', '4w', 17, 50, 'umol/L', BOTH, VITROS],
  ['creatinine', 'any', '4w', '2y', 11, 36, 'umol/L', BOTH, VITROS],
  ['creatinine', 'any', '2y', '6y', 20, 44, 'umol/L', BOTH, VITROS],
  ['creatinine', 'any', '6y', '12y', 27, 58, 'umol/L', BOTH, VITROS],
  ['creatinine', 'M', '12y', '15y', 35, 83, 'umol/L', BOTH, VITROS],
  ['creatinine', 'M', '15y', '19y', 50, 100, 'umol/L', BOTH, VITROS],
  ['creatinine', 'F', '12y', '15y', 35, 74, 'umol/L', BOTH, VITROS],
  ['creatinine', 'F', '15y', '19y', 38, 82, 'umol/L', BOTH, VITROS],
  ['calcium', 'any', '0w', '1w', 1.85, 2.8, 'mmol/L', BOTH],
  ['calcium', 'any', '1w', '26w', 2.2, 2.8, 'mmol/L', BOTH],
  ['calcium', 'any', '26w', '2y', 2.2, 2.7, 'mmol/L', BOTH],
  ['calcium', 'any', '2y', '18y', 2.2, 2.65, 'mmol/L', BOTH],
  ['phosphate', 'any', '0w', '1w', 1.25, 2.85, 'mmol/L', BOTH],
  ['phosphate', 'any', '1w', '4w', 1.5, 2.75, 'mmol/L', BOTH],
  ['phosphate', 'any', '4w', '26w', 1.45, 2.5, 'mmol/L', BOTH],
  ['phosphate', 'any', '26w', '1y', 1.3, 2.3, 'mmol/L', BOTH],
  ['phosphate', 'any', '1y', '4y', 1.1, 2.2, 'mmol/L', BOTH],
  ['phosphate', 'any', '4y', '15y', 0.9, 2.0, 'mmol/L', BOTH],
  ['phosphate', 'any', '15y', '18y', 0.8, 1.85, 'mmol/L', BOTH],
  ['phosphate', 'any', '18y', '20y', 0.75, 1.65, 'mmol/L', BOTH],
  ['magnesium', 'any', '0w', '1w', 0.6, 1.0, 'mmol/L', BOTH],
  ['magnesium', 'any', '1w', '18y', 0.65, 1.1, 'mmol/L', BOTH],
  ['alp', 'any', '0w', '1w', 80, 380, 'U/L', BOTH],
  ['alp', 'any', '1w', '4w', 120, 550, 'U/L', BOTH],
  ['alp', 'any', '4w', '26w', 120, 650, 'U/L', BOTH],
  ['alp', 'any', '26w', '2y', 120, 450, 'U/L', BOTH],
  ['alp', 'any', '2y', '6y', 120, 370, 'U/L', BOTH],
  ['alp', 'any', '6y', '10y', 120, 440, 'U/L', BOTH],
  ['alp', 'M', '10y', '14y', 130, 530, 'U/L', BOTH],
  ['alp', 'M', '14y', '15y', 105, 480, 'U/L', BOTH],
  ['alp', 'M', '15y', '17y', 80, 380, 'U/L', BOTH],
  ['alp', 'M', '17y', '19y', 50, 220, 'U/L', BOTH],
  ['alp', 'M', '19y', '22y', 45, 150, 'U/L', BOTH],
  ['alp', 'F', '10y', '13y', 100, 460, 'U/L', BOTH],
  ['alp', 'F', '13y', '14y', 70, 330, 'U/L', BOTH],
  ['alp', 'F', '14y', '15y', 50, 280, 'U/L', BOTH],
  ['alp', 'F', '15y', '16y', 45, 170, 'U/L', BOTH],
  ['alp', 'F', '16y', '22y', 35, 140, 'U/L', BOTH],
];

function ageLabel(from: string, to: string | null): string {
  const f = from.replace('w', ' 주').replace('y', ' 세');
  return to === null ? `≥ ${f}` : `${f} 이상 ~ ${to.replace('w', ' 주').replace('y', ' 세')} 미만`;
}

export const REFERENCE_INTERVALS: RefInterval[] = rows.map(
  ([analyte, sex, from, to, low, high, unit, specimens, note]) => ({
    analyte, sex, ageMin: age(from), ageMax: to === null ? null : age(to), ageLabel: ageLabel(from, to),
    low, high, unit, specimens, note,
  }),
);

export const SOURCE = {
  label: 'AACB/RCPA Harmonised Reference Intervals (Tate et al., Clin Biochem Rev 2014; 35(4):213-235)',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4310061',
  rcpa: 'https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem',
  caliper: 'https://caliperproject.ca/',
};
