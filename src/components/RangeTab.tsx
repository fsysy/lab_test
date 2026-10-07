import { useMemo, useState } from 'react';
import { ANALYTES } from '../data/analytes';
import { REFERENCE_INTERVALS, REF_ANALYTES, SOURCE, type SpecimenKind } from '../data/referenceIntervals';
import { convert } from '../lib/convert';
import { fmt, unitLabel } from '../lib/format';
import { ageInYears, judge, lookupIntervals, type AgeUnit } from '../lib/interval';
import { AnalyteSearch } from './AnalyteSearch';
import { RangeBar } from './RangeBar';

const FLAG_TEXT = { low: '낮음', normal: '정상', high: '높음' } as const;
const SEX_TEXT = { any: '남녀 공통', M: '남', F: '여' } as const;
const SPECIMEN_TEXT: Record<SpecimenKind, string> = { serum: '혈청', plasma: '혈장' };

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
    <div className="workbench">
      <section className="worksheet" aria-label="조건">
        <AnalyteSearch items={REF_ANALYTES} value={id} onChange={(v) => { setId(v); setResultUnit(''); }} label="분석물" />

        <div className="entry">
          <div className="units">
            <label className="field">
              <span className="lbl">나이</span>
              <input className="num" inputMode="decimal" value={age} onChange={(e) => setAge(e.target.value)} />
            </label>
            <label className="field">
              <span className="lbl">나이 단위</span>
              <select value={ageUnit} onChange={(e) => setAgeUnit(e.target.value as AgeUnit)}>
                <option value="years">세</option>
                <option value="weeks">주</option>
              </select>
            </label>
          </div>

          <fieldset className="choice">
            <legend>성별</legend>
            {(['M', 'F'] as const).map((s) => (
              <label key={s}>
                <input type="radio" name="sex" checked={sex === s} onChange={() => setSex(s)} />
                <span>{SEX_TEXT[s]}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="choice">
            <legend>검체</legend>
            {(['serum', 'plasma'] as const).map((s) => (
              <label key={s}>
                <input type="radio" name="specimen" checked={specimen === s} onChange={() => setSpecimen(s)} />
                <span><i className={`cap ${s}`} aria-hidden="true" />{SPECIMEN_TEXT[s]}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </section>

      <section className="outcome" aria-live="polite" aria-label="참고구간">
        {!ageOk && (
          <div className="refusal" role="alert">
            <h2>나이를 확인하세요</h2>
            <p>0 이상의 숫자를 입력해야 합니다.</p>
          </div>
        )}

        {ageOk && ageYears < 18 && (
          <p className="pointer">
            18세 미만은 나이와 성별로 더 세분된 <a href={SOURCE.caliper} target="_blank" rel="noreferrer">CALIPER</a> 소아 참고구간도 함께 확인하세요.
            이 앱에는 CALIPER 수치가 없고, 아래에는 AACB/RCPA가 공표한 소아 구간만 있습니다.
          </p>
        )}

        {ageOk && found.length === 0 && (
          <div className="refusal">
            <h2>이 조건에 공표된 구간이 없습니다</h2>
            <p>
              {ref.ko}은(는) 선택한 나이, 성별, 검체에 해당하는 구간이 출처 표에 없습니다. 다른 나이 구간에서 외삽하지 않습니다.
            </p>
            <details>
              <summary>이 분석물에 공표된 구간 전체</summary>
              <ul className="published">
                {published.map((r, i) => (
                  <li key={i}>
                    <span>{r.ageLabel}</span>
                    <span>{SEX_TEXT[r.sex]}, {r.specimens.map((s) => SPECIMEN_TEXT[s]).join('/')}</span>
                    <span className="num">{fmt(r.low)}–{fmt(r.high)} {unitLabel(r.unit)}</span>
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
              convertNote = `${fmt(raw)} ${unitLabel(unit)}은(는) ${fmt(c.value)} ${unitLabel(r.unit)}입니다 (계수 ${fmt(c.basis.factor)}).`;
            } else {
              valueInRefUnit = null;
              convertErr = c.reason;
            }
          }
          const flag = valueInRefUnit === null ? null : judge(valueInRefUnit, r);
          return (
            <article className="interval" key={i}>
              <p className="readout">
                <span className="figure">{fmt(r.low)}–{fmt(r.high)}</span>
                <span className="unit">{unitLabel(r.unit)}</span>
              </p>

              <RangeBar low={r.low} high={r.high} value={valueInRefUnit} flag={flag} />

              <div className="entry inline">
                <label className="field">
                  <span className="lbl">결과 값</span>
                  <input className="num" inputMode="decimal" value={result} onChange={(e) => setResult(e.target.value)} />
                </label>
                <label className="field">
                  <span className="lbl">결과 단위</span>
                  <select value={unit} onChange={(e) => setResultUnit(e.target.value)}>
                    {[r.unit, ...convUnits.filter((u) => u !== r.unit)].map((u) => (
                      <option key={u} value={u}>{unitLabel(u)}</option>
                    ))}
                  </select>
                </label>
                {flag && <p className={`verdict ${flag}`}>{FLAG_TEXT[flag]}</p>}
              </div>
              {convertNote && <p className="note">{convertNote}</p>}
              {convertErr && <p className="note warn">{convertErr}</p>}

              <dl className="derivation">
                <dt>나이 구간</dt>
                <dd>{r.ageLabel}</dd>
                <dt>성별</dt>
                <dd>{SEX_TEXT[r.sex]}</dd>
                <dt>검체</dt>
                <dd>{r.specimens.map((s) => SPECIMEN_TEXT[s]).join(', ')}</dd>
                <dt>출처</dt>
                <dd><a href={SOURCE.url} target="_blank" rel="noreferrer">{SOURCE.label}</a></dd>
                {r.note && (<><dt>비고</dt><dd>{r.note}</dd></>)}
              </dl>
            </article>
          );
        })}
      </section>
    </div>
  );
}
