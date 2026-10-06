export type AnalyteKind = 'molar' | 'enzyme' | 'mass-only' | 'special';

export interface Analyte {
  id: string;
  en: string;
  ko: string;
  synonyms: string[];
  kind: AnalyteKind;
  /** Chemical formula the molar mass is computed from (kind 'molar'). */
  formula?: string;
  /** Ion charge (valence) used for mEq conversion. Omitted when not well defined. */
  charge?: number;
  /** Suggested UCUM units (first = default source, second = default target). */
  units: string[];
  assumptions?: string[];
}

export const ANALYTES: Analyte[] = [
  {
    id: 'glucose', en: 'Glucose', ko: '포도당(혈당)', synonyms: ['blood sugar', 'FBS', 'FPG', '혈당', '당'],
    kind: 'molar', formula: 'C6H12O6', units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'creatinine', en: 'Creatinine', ko: '크레아티닌', synonyms: ['Cr', 'Cre', 'serum creatinine'],
    kind: 'molar', formula: 'C4H7N3O', units: ['mg/dL', 'umol/L'],
  },
  {
    id: 'urea', en: 'Urea', ko: '요소', synonyms: ['urea'],
    kind: 'molar', formula: 'CH4N2O', units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'bun', en: 'Blood urea nitrogen (BUN)', ko: '요소질소(BUN)', synonyms: ['BUN', 'urea nitrogen', '혈중요소질소'],
    kind: 'molar', formula: 'N2', units: ['mg/dL', 'mmol/L'],
    assumptions: [
      'BUN은 요소 분자 1개당 질소 2원자(N₂ = 2×14.007 g/mol)의 질량으로 표현된 값입니다.',
      'mmol/L은 요소(urea) mmol/L와 같은 값입니다(요소 1분자 = 질소 2원자).',
    ],
  },
  {
    id: 'uric-acid', en: 'Uric acid', ko: '요산', synonyms: ['urate', 'UA'],
    kind: 'molar', formula: 'C5H4N4O3', units: ['mg/dL', 'umol/L'],
  },
  {
    id: 'cholesterol', en: 'Cholesterol (total / HDL / LDL)', ko: '콜레스테롤(총/HDL/LDL)', synonyms: ['TC', 'HDL', 'LDL', 'HDL-C', 'LDL-C', '총콜레스테롤'],
    kind: 'molar', formula: 'C27H46O', units: ['mg/dL', 'mmol/L'],
    assumptions: ['콜레스테롤(C₂₇H₄₆O) 분자량 기준. 중성지방과는 계수가 다릅니다.'],
  },
  {
    id: 'triglycerides', en: 'Triglycerides', ko: '중성지방', synonyms: ['TG', 'TAG', 'triacylglycerol', '트리글리세라이드'],
    kind: 'molar', formula: 'C57H104O6', units: ['mg/dL', 'mmol/L'],
    assumptions: [
      '중성지방은 지방산 조성이 다양한 혼합물이므로 대표 분자로 트리올레인(C₅₇H₁₀₄O₆, 약 885.4 g/mol)을 가정합니다.',
      '임상에서 널리 쓰는 계수(×0.01129 ≈ 0.0113)와 같은 가정입니다.',
    ],
  },
  {
    id: 'bilirubin', en: 'Bilirubin (total / direct)', ko: '빌리루빈', synonyms: ['T.bil', 'D.bil', 'total bilirubin', '총빌리루빈'],
    kind: 'molar', formula: 'C33H36N4O6', units: ['mg/dL', 'umol/L'],
  },
  {
    id: 'lactate', en: 'Lactate', ko: '젖산(락테이트)', synonyms: ['lactic acid', 'lactate'],
    kind: 'molar', formula: 'C3H6O3', units: ['mg/dL', 'mmol/L'],
  },
  {
    id: 'sodium', en: 'Sodium', ko: '나트륨', synonyms: ['Na', 'Na+'],
    kind: 'molar', formula: 'Na', charge: 1, units: ['meq/L', 'mmol/L', 'mg/dL'],
  },
  {
    id: 'potassium', en: 'Potassium', ko: '칼륨', synonyms: ['K', 'K+'],
    kind: 'molar', formula: 'K', charge: 1, units: ['meq/L', 'mmol/L', 'mg/dL'],
  },
  {
    id: 'chloride', en: 'Chloride', ko: '염소(클로라이드)', synonyms: ['Cl', 'Cl-'],
    kind: 'molar', formula: 'Cl', charge: 1, units: ['meq/L', 'mmol/L', 'mg/dL'],
  },
  {
    id: 'bicarbonate', en: 'Bicarbonate', ko: '중탄산염', synonyms: ['HCO3', 'HCO3-', 'total CO2', 'CO2', '탄산수소'],
    kind: 'molar', formula: 'HCO3', charge: 1, units: ['meq/L', 'mmol/L', 'mg/dL'],
    assumptions: ['HCO₃⁻ 이온(1가) 기준입니다. 총 CO₂ 측정값은 mEq/L = mmol/L로 취급합니다.'],
  },
  {
    id: 'calcium', en: 'Calcium (total)', ko: '칼슘(총칼슘)', synonyms: ['Ca', 'Ca2+', 'total calcium'],
    kind: 'molar', formula: 'Ca', charge: 2, units: ['mg/dL', 'mmol/L', 'meq/L'],
    assumptions: ['이온화칼슘과 총칼슘 모두 같은 원자량·2가 전하로 계산합니다(측정 대상의 임상적 의미는 별개).'],
  },
  {
    id: 'magnesium', en: 'Magnesium', ko: '마그네슘', synonyms: ['Mg', 'Mg2+'],
    kind: 'molar', formula: 'Mg', charge: 2, units: ['mg/dL', 'mmol/L', 'meq/L'],
  },
  {
    id: 'phosphorus', en: 'Phosphorus / phosphate (as P)', ko: '인(인산염)', synonyms: ['phosphate', 'Pi', 'P', 'PO4', '무기인'],
    kind: 'molar', formula: 'P', units: ['mg/dL', 'mmol/L'],
    assumptions: [
      'mg/dL는 인(P 원소) 질량 기준입니다(인산염 PO₄ 질량 기준이 아님).',
      'mEq/L은 인산염의 가수가 pH에 따라 달라(약 1.8) 단일 전하로 정의되지 않으므로 제공하지 않습니다.',
    ],
  },
  {
    id: 'albumin', en: 'Albumin', ko: '알부민', synonyms: ['Alb', 'serum albumin'],
    kind: 'mass-only', units: ['g/dL', 'g/L'],
  },
  {
    id: 'total-protein', en: 'Total protein', ko: '총단백', synonyms: ['TP', 'protein', '단백질'],
    kind: 'mass-only', units: ['g/dL', 'g/L'],
  },
  ...(
    [
      ['alt', 'ALT (GPT)', 'ALT(GPT)', ['SGPT', 'GPT', 'alanine aminotransferase', '알라닌아미노전이효소']],
      ['ast', 'AST (GOT)', 'AST(GOT)', ['SGOT', 'GOT', 'aspartate aminotransferase', '아스파르테이트아미노전이효소']],
      ['alp', 'Alkaline phosphatase (ALP)', '알칼리인산분해효소(ALP)', ['ALP', 'alk phos', '알칼리 포스파타제']],
      ['ggt', 'GGT', '감마글루타밀전이효소(GGT)', ['gamma-GT', 'GGTP', 'γ-GTP']],
      ['ldh', 'Lactate dehydrogenase (LD/LDH)', '젖산탈수소효소(LDH)', ['LD', 'LDH']],
      ['ck', 'Creatine kinase (CK)', '크레아틴키나제(CK)', ['CPK', 'CK']],
    ] as [string, string, string, string[]][]
  ).map(([id, en, ko, synonyms]): Analyte => ({
    id, en, ko, synonyms, kind: 'enzyme', units: ['U/L', 'ukat/L'],
    assumptions: ['효소 활성 단위: 1 U = 1 μmol/min, 1 kat = 1 mol/s (UCUM 정의). 측정 온도·방법이 같다고 가정합니다.'],
  })),
];
