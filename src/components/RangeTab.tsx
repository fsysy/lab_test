import { useMemo, useState } from 'react';
import { ANALYTES } from '../data/analytes';
import { REFERENCE_INTERVALS, REF_ANALYTES, SOURCE, type SpecimenKind } from '../data/referenceIntervals';
import { convert } from '../lib/convert';
import { fmt, unitLabel } from '../lib/format';
import { ageInYears, judge, lookupIntervals, type AgeUnit } from '../lib/interval';
import { AnalyteSearch } from './AnalyteSearch';

const FLAG_TEXT = { low: '낮음 (low)', normal: '정상 (normal)', high: '높음 (high)' } as const;

export function RangeTab() {
  const [id, setId] = useState('sodium');
  const [age, setAge] = useState('30');
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('years');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [specimen, setSpecimen] = useState<SpecimenKind>('serum');
  const [result, setResult] = useState('');
  const [resultUnit, setResultUnit] = useState('');

  const ref = REF_ANALYTES.find((a) => a.id === id)!;
  const ageNum = Number(age);
  const ageOk = age.trim() !== '' && Number.isFinite(ageNum) && ageNum >= 0;
  const ageYears = ageOk ? ageInYears(ageNum, ageUnit) : NaN;

  const found = useMemo(
    () => (ageOk ? lookupIntervals(id, ageYears, sex, specimen) : []),
    [id, ageYears, ageOk, sex, specimen],
  );
  const published = REFERENCE_INTERVALS.filter((r) => r.analyte === id);
  const convUnits = ANALYTES.find((a) => a.id === ref.convertId)?.units ?? [];

  return (
    <section>
      <AnalyteSearch items={REF_ANALYTES} value={id} onChange={(v) => { setId(v); setResultUnit(''); }} label="분석물" />

      <div className="row">
        <label className="field grow">
          나이
          <input inputMode="decimal" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <label className="field">
          단위
          <select value={ageUnit} onChange={(e) => setAgeUnit(e.target.value as AgeUnit)}>
            <option value="years">세</option>
            <option value="weeks">주</option>
          </select>
        </label>
        <label className="field">
          성별
          <select value={sex} onChange={(e) => setSex(e.target.value as 'M' | 'F')}>
            <option value="M">남</option>
            <option value="F">여</option>
          </select>
        </label>
        <label className="field">
          검체
          <select value={specimen} onChange={(e) => setSpecimen(e.target.value as SpecimenKind)}>
            <option value="serum">혈청</option>
            <option value="plasma">혈장</option>
          </select>
        </label>
      </div>

      {ageOk && ageYears < 18 && (
        <p className="callout">
          소아(18세 미만)는 나이·성별별로 세분된 <a href={SOURCE.caliper} target="_blank" rel="noreferrer">CALIPER (caliperproject.ca)</a>의
          소아 참고구간도 함께 확인하세요. 이 앱은 CALIPER 수치를 담지 않았고, 아래에는 AACB/RCPA가 공표한 소아 구간만 표시합니다.
        </p>
      )}

      {!ageOk && <p className="reject">나이를 0 이상의 숫자로 입력하세요.</p>}

      {ageOk && found.length === 0 && (
        <div className="reject">
          <strong>이 조건에 공표된 구간이 없습니다.</strong>
          <p>
            {ref.ko}에 대해 선택한 나이·성별·검체에 해당하는 구간이 출처 표에 없으며, 다른 나이 구간에서 외삽하지 않습니다.
          </p>
          <details>
            <summary>이 분석물의 공표된 구간 전체 보기</summary>
            <ul>
              {published.map((r, i) => (
                <li key={i}>
                  {r.ageLabel} · {r.sex === 'any' ? '남녀 공통' : r.sex === 'M' ? '남' : '여'} · {r.specimens.map((s) => (s === 'serum' ? '혈청' : '혈장')).join('/')} :
                  {' '}{fmt(r.low)}–{fmt(r.high)} {unitLabel(r.unit)}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {found.map((r, i) => {
        const raw = Number(result);
        const hasValue = result.trim() !== '' && Number.isFinite(raw);
        const unit = resultUnit || r.unit;
        let valueInRefUnit: number | null = hasValue ? raw : null;
        let convertNote = '';
        let convertErr = '';
        if (hasValue && unit !== r.unit && ref.convertId) {
          const c = convert(ref.convertId, raw, unit, r.unit);
          if (c.ok) {
            valueInRefUnit = c.value;
            convertNote = `${fmt(raw)} ${unitLabel(unit)} → ${fmt(c.value)} ${unitLabel(r.unit)} (계수 ${fmt(c.basis.factor)})`;
          } else {
            valueInRefUnit = null;
            convertErr = c.reason;
          }
        }
        const flag = valueInRefUnit === null ? null : judge(valueInRefUnit, r);
        return (
          <div className="interval" key={i}>
            <div className="big">
              {fmt(r.low)} – {fmt(r.high)} <span className="unit">{unitLabel(r.unit)}</span>
            </div>
            <ul className="meta">
              <li>나이 구간: {r.ageLabel}</li>
              <li>성별: {r.sex === 'any' ? '남녀 공통' : r.sex === 'M' ? '남' : '여'}</li>
              <li>검체: {r.specimens.map((s) => (s === 'serum' ? '혈청' : '혈장')).join(' / ')}</li>
              <li>
                출처: <a href={SOURCE.url} target="_blank" rel="noreferrer">{SOURCE.label}</a>
              </li>
              {r.note && <li>비고: {r.note}</li>}
            </ul>

            <div className="row">
              <label className="field grow">
                결과 값
                <input inputMode="decimal" value={result} onChange={(e) => setResult(e.target.value)} />
              </label>
              <label className="field">
                단위
                <select value={unit} onChange={(e) => setResultUnit(e.target.value)}>
                  {[r.unit, ...convUnits.filter((u) => u !== r.unit)].map((u) => (
                    <option key={u} value={u}>{unitLabel(u)}</option>
                  ))}
                </select>
              </label>
            </div>
            {convertNote && <p className="muted">{convertNote}</p>}
            {convertErr && <p className="reject">{convertErr}</p>}
            {flag && <div className={`flag ${flag}`}>{FLAG_TEXT[flag]}</div>}
          </div>
        );
      })}
    </section>
  );
}
