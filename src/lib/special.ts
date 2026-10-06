import { molarMass } from '../data/atomicWeights';
import type { Basis, ConversionResult, SourceLink } from './convert';
import { fmt } from './format';

export interface Special {
  id: string;
  en: string;
  ko: string;
  synonyms: string[];
  kind: 'special';
  units: string[]; // ids understood by convert()
  unitLabels?: Record<string, string>;
  convert(value: number, from: string, to: string): ConversionResult;
}

const NGSP: SourceLink = { label: 'NGSP: IFCC 표준화 / 변환식', url: 'https://www.ngsp.org/ifcc.asp' };
const KDIGO: SourceLink = { label: 'KDIGO 2024 CKD Guideline', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' };
const IUPAC: SourceLink = { label: 'IUPAC CIAAW 표준 원자량', url: 'https://ciaaw.org/atomic-weights.htm' };

const bad = (reason: string): ConversionResult => ({ ok: false, reason });

// HbA1c master equation: NGSP(%) = 0.09148 × IFCC(mmol/mol) + 2.152
export const HBA1C_SLOPE = 0.09148;
export const HBA1C_INTERCEPT = 2.152;

function hba1c(value: number, from: string, to: string): ConversionResult {
  if (from === to) return bad('원본 단위와 대상 단위가 같습니다.');
  const ok = (v: number, unit: string, formula: string): ConversionResult => {
    const f = fmt(HBA1C_SLOPE);
    const basis: Basis = {
      method: 'NGSP–IFCC 마스터 방정식(선형 회귀식)',
      factor: v / value,
      formula,
      coefficients: [`기울기 ${f}, 절편 ${HBA1C_INTERCEPT} (NGSP % = ${f} × IFCC mmol/mol + ${HBA1C_INTERCEPT})`],
      assumptions: [
        '비례 계수가 아닌 선형식(절편 포함)이므로 값에 따라 환산비가 달라집니다.',
        'DCCT/NGSP 정렬 HbA1c 기준. eAG(평균혈당) 추정은 하지 않습니다.',
        'TODO(verify): ngsp.org 접속 불가로 계수는 공개된 마스터 방정식(Hoelzel 2004)을 기준으로 입력했으며 해당 페이지에서 직접 확인하지 못했습니다.',
      ],
      sources: [NGSP],
    };
    return { ok: true, value: v, unit, basis };
  };
  if (from === '%' && to === 'mmol/mol') {
    return ok((value - HBA1C_INTERCEPT) / HBA1C_SLOPE, 'mmol/mol', 'IFCC = (NGSP − 2.152) ÷ 0.09148');
  }
  if (from === 'mmol/mol' && to === '%') {
    return ok(HBA1C_SLOPE * value + HBA1C_INTERCEPT, '%', 'NGSP = 0.09148 × IFCC + 2.152');
  }
  return bad('HbA1c는 % (NGSP) ↔ mmol/mol (IFCC)만 변환합니다.');
}

function ratioToCreatinine(name: string) {
  return (value: number, from: string, to: string): ConversionResult => {
    if (from === to) return bad('원본 단위와 대상 단위가 같습니다.');
    const mw = molarMass('C4H7N3O');
    // 1 mg analyte per g creatinine = 1 mg per (1000 mg / M) mmol creatinine = M/1000 mg/mmol
    const mgPerGToMgPerMmol = mw.value / 1000;
    let factor: number;
    if (from === 'mg/g' && to === 'mg/mmol') factor = mgPerGToMgPerMmol;
    else if (from === 'mg/mmol' && to === 'mg/g') factor = 1 / mgPerGToMgPerMmol;
    else return bad(`${name}은(는) mg/g ↔ mg/mmol만 변환합니다.`);
    const basis: Basis = {
      method: '분모(크레아티닌) 단위를 질량에서 몰로 변환',
      factor,
      formula: `mg/mmol = mg/g × M(크레아티닌) ÷ 1000\nmg/g = mg/mmol × 1000 ÷ M(크레아티닌)`,
      coefficients: [
        `M(C4H7N3O) = ${fmt(mw.value, 7)} g/mol  (${mw.breakdown})`,
        `1 mg/g = ${fmt(mgPerGToMgPerMmol)} mg/mmol`,
      ],
      assumptions: [
        'KDIGO 2024 표는 30 mg/g ≈ 3 mg/mmol처럼 반올림한 값을 쓰므로, 계산값(30 mg/g = 3.39 mg/mmol)과 약간 다릅니다.',
        'TODO(verify): kdigo.org 접속 불가로 KDIGO 2024 본문의 환산 표기를 직접 확인하지 못했습니다.',
      ],
      sources: [KDIGO, IUPAC],
    };
    return { ok: true, value: value * factor, unit: to, basis };
  };
}
function bunUrea(value: number, from: string, to: string): ConversionResult {
  if (from === to) return bad('원본 단위와 대상 단위가 같습니다.');
  const mN2 = molarMass('N2').value;
  const mUrea = molarMass('CH4N2O').value;
  // mmol urea per L from each unit
  const toMmol: Record<string, number> = {
    'BUN mg/dL': 10 / mN2,
    'urea mg/dL': 10 / mUrea,
    'urea mmol/L': 1,
  };
  if (!(from in toMmol) || !(to in toMmol)) return bad('BUN mg/dL · 요소 mg/dL · 요소 mmol/L 사이만 변환합니다.');
  const mmol = value * toMmol[from];
  const out = mmol / toMmol[to];
  const factor = toMmol[from] / toMmol[to];
  const basis: Basis = {
    method: '요소 1분자 = 질소 2원자 (몰 기준으로 통일)',
    factor,
    formula: 'urea mmol/L = BUN mg/dL × 10 ÷ M(N₂);  urea mg/dL = urea mmol/L × M(요소) ÷ 10',
    coefficients: [
      `M(N₂) = ${fmt(mN2, 7)} g/mol,  M(CH₄N₂O) = ${fmt(mUrea, 7)} g/mol`,
      `1 ${from} = ${fmt(factor)} ${to}`,
    ],
    assumptions: ['BUN(요소질소)은 요소 중 질소만의 질량이므로 요소 질량 = BUN × M(요소)/M(N₂) ≈ ×2.14.'],
    sources: [IUPAC],
  };
  return { ok: true, value: out, unit: to, basis };
}

export const SPECIALS: Special[] = [
  {
    id: 'hba1c', en: 'HbA1c (NGSP ↔ IFCC)', ko: '당화혈색소(HbA1c)', synonyms: ['A1c', 'glycated hemoglobin', 'glycohemoglobin', '당화혈색소'],
    kind: 'special', units: ['%', 'mmol/mol'], convert: hba1c,
  },
  {
    id: 'uacr', en: 'Urine albumin-creatinine ratio (uACR)', ko: '요 알부민/크레아티닌비(uACR)', synonyms: ['ACR', 'albuminuria', 'albumin creatinine ratio', '알부민뇨'],
    kind: 'special', units: ['mg/g', 'mg/mmol'], convert: ratioToCreatinine('uACR'),
  },
  {
    id: 'upcr', en: 'Urine protein-creatinine ratio (uPCR)', ko: '요 단백/크레아티닌비(uPCR)', synonyms: ['PCR', 'proteinuria', 'protein creatinine ratio', '단백뇨'],
    kind: 'special', units: ['mg/g', 'mg/mmol'], convert: ratioToCreatinine('uPCR'),
  },
  {
    id: 'bun-urea', en: 'BUN ↔ urea', ko: 'BUN ↔ 요소', synonyms: ['BUN', 'urea', 'blood urea nitrogen', '요소질소'],
    kind: 'special', units: ['BUN mg/dL', 'urea mg/dL', 'urea mmol/L'], convert: bunUrea,
  },
];
