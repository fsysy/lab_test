import { UcumLhcUtils } from '@lhncbc/ucum-lhc';
import { ANALYTES, type Analyte } from '../data/analytes';
import { molarMass } from '../data/atomicWeights';
import { SPECIALS, type Special } from './special';
import { fmt, unitLabel } from './format';

export interface SourceLink {
  label: string;
  url: string;
}

export interface Basis {
  method: string;
  factor: number; // result / input, computed numerically
  formula: string;
  coefficients: string[];
  assumptions: string[];
  sources: SourceLink[];
}

export type ConversionResult =
  | { ok: true; value: number; unit: string; basis: Basis }
  | { ok: false; reason: string };

export const SOURCES = {
  ucum: { label: 'UCUM (Unified Code for Units of Measure)', url: 'https://ucum.org/ucum' },
  ucumLhc: { label: '@lhncbc/ucum-lhc', url: 'https://github.com/lhncbc/ucum-lhc' },
  iupac: { label: 'IUPAC CIAAW 표준 원자량', url: 'https://ciaaw.org/atomic-weights.htm' },
  ngsp: { label: 'NGSP: IFCC 표준화 / 변환식', url: 'https://www.ngsp.org/ifcc.asp' },
  kdigo: { label: 'KDIGO 2024 CKD Guideline', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' },
} satisfies Record<string, SourceLink>;

/** Normalise user-typed unit strings to UCUM (case-sensitive) codes. */
export function normalizeUnit(u: string): string {
  return u
    .trim()
    .replace(/[µμ]/g, 'u')
    .replace(/\bmEq\b/g, 'meq')
    .replace(/mEq/g, 'meq')
    .replace(/\bIU\b/g, '[IU]')
    .replace(/\s+/g, '');
}

export function findAnalyte(id: string): Analyte | Special | undefined {
  return ANALYTES.find((a) => a.id === id) ?? SPECIALS.find((s) => s.id === id);
}

function ucum() {
  return UcumLhcUtils.getInstance();
}

const isCatalytic = (u: string) => ucum().convertUnitTo(u, 1, 'kat/L').status === 'succeeded';

function reject(reason: string): ConversionResult {
  return { ok: false, reason };
}

function convertWithUcum(a: Analyte, value: number, fromRaw: string, toRaw: string): ConversionResult {
  const from = normalizeUnit(fromRaw);
  const to = normalizeUnit(toRaw);
  const U = ucum();
  for (const [raw, u] of [[fromRaw, from], [toRaw, to]] as const) {
    if (u === '' || U.validateUnitString(u).status !== 'valid') {
      return reject(`'${raw}'은(는) UCUM 단위로 인식되지 않습니다. 예: mg/dL, mmol/L, umol/L, meq/L, g/L, U/L.`);
    }
  }

  const assumptions = [...(a.assumptions ?? [])];
  const coefficients: string[] = [];
  const opts: { molecularWeight?: number; charge?: number } = {};
  let method = 'UCUM 단위 차원 검사 + 스케일 변환';
  let mwText = '';

  if (a.kind === 'molar' && a.formula) {
    const mw = molarMass(a.formula);
    opts.molecularWeight = mw.value;
    mwText = `M(${a.formula}) = ${fmt(mw.value, 7)} g/mol  (${mw.breakdown})`;
    coefficients.push(mwText);
    if (a.charge !== undefined) {
      opts.charge = a.charge;
      coefficients.push(`전하(가수) z = ${a.charge} (mEq = mmol × z)`);
    }
    method = 'UCUM 스케일 변환 + 분자량(IUPAC 원자량으로 계산)·이온 전하 적용';
  }

  const r = U.convertUnitTo(from, value, to, opts);
  if (r.status !== 'succeeded' || r.toVal === null) {
    const msg = (r.msg ?? []).join(' ');
    // Classify the failure so the user gets a reason, not just "failed".
    if (a.kind === 'enzyme') {
      if (!isCatalytic(from) || !isCatalytic(to)) {
        return reject(
          `${a.ko}의 효소활성(U/L, μkat/L)은 질량·몰농도(mg/dL, mmol/L)로 바꿀 근거가 없습니다. ` +
            `활성은 효소 단백량이 아니라 반응 속도이고, 비활성도(U/mg)가 효소·시약·측정 조건마다 달라 고정 계수가 존재하지 않습니다.`,
        );
      }
    }
    if (/charge/i.test(msg) || ((isEq(from) || isEq(to)) && opts.charge === undefined)) {
      return reject(
        `mEq/L 변환에는 이온 전하(가수)가 필요한데, ${a.ko}은(는) 단일 전하로 정의되지 않습니다. mmol/L 또는 mg/dL를 사용하세요.`,
      );
    }
    if (opts.molecularWeight === undefined) {
      return reject(
        `${a.ko}은(는) 이 앱에 분자량 근거가 정의되어 있지 않아 질량↔몰 변환을 하지 않습니다 ` +
          `(단백질 혼합물 등은 단일 분자량이 없음). 같은 차원 내 단위(예: g/dL↔g/L)만 변환됩니다.`,
      );
    }
    return reject(
      `'${unitLabel(from)}'과(와) '${unitLabel(to)}'은(는) 차원이 달라 ${a.ko}에 대해 변환 근거가 없습니다. (UCUM: ${msg || 'dimension mismatch'})`,
    );
  }

  const factorRes = U.convertUnitTo(from, 1, to, opts);
  const factor = factorRes.toVal ?? r.toVal / value;
  coefficients.push(`계산된 환산계수: 1 ${unitLabel(from)} = ${fmt(factor)} ${unitLabel(to)}`);

  const formulaParts = [`결과 = 입력값 × ${fmt(factor)}`];
  if (opts.molecularWeight !== undefined) {
    formulaParts.push(
      `질량→몰: mmol/L = (mg/L) ÷ M,  몰→질량: mg/L = mmol/L × M${opts.charge !== undefined ? ',  mEq/L = mmol/L × z' : ''}`,
    );
  }
  return {
    ok: true,
    value: r.toVal,
    unit: to,
    basis: {
      method,
      factor,
      formula: formulaParts.join('\n'),
      coefficients,
      assumptions,
      sources: [SOURCES.ucum, SOURCES.ucumLhc, ...(a.kind === 'molar' ? [SOURCES.iupac] : [])],
    },
  };
}

function isEq(u: string): boolean {
  return /eq/.test(u);
}

export function convert(analyteId: string, value: number, from: string, to: string): ConversionResult {
  const a = findAnalyte(analyteId);
  if (!a) return reject('분석물을 선택하세요.');
  if (!Number.isFinite(value)) return reject('값을 숫자로 입력하세요.');
  if ('convert' in a) return a.convert(value, from, to);
  return convertWithUcum(a, value, from, to);
}
