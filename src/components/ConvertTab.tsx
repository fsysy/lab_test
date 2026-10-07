import { useMemo, useState } from 'react';
import { ANALYTES } from '../data/analytes';
import { convert, findAnalyte } from '../lib/convert';
import { SPECIALS } from '../lib/special';
import { fmt, unitLabel } from '../lib/format';
import { AnalyteSearch } from './AnalyteSearch';

const ALL = [...ANALYTES, ...SPECIALS];

export function ConvertTab() {
  const [id, setId] = useState('glucose');
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState('mg/dL');
  const [to, setTo] = useState('mmol/L');
  const [copied, setCopied] = useState(false);

  const analyte = findAnalyte(id)!;

  const pick = (nid: string) => {
    const a = findAnalyte(nid)!;
    setId(nid);
    setFrom(a.units[0]);
    setTo(a.units[1] ?? a.units[0]);
  };

  const result = useMemo(() => {
    const n = Number(value);
    if (value.trim() === '' || Number.isNaN(n)) return null;
    return convert(id, n, from, to);
  }, [id, value, from, to]);

  const copy = async () => {
    if (!result?.ok) return;
    const text = `${fmt(result.value)} ${unitLabel(result.unit)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('복사하세요', text);
    }
  };

  return (
    <div className="workbench">
      <section className="worksheet" aria-label="입력">
        <AnalyteSearch items={ALL} value={id} onChange={pick} label="분석물" />

        <div className="entry">
          <label className="field">
            <span className="lbl">값</span>
            <input className="num" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
          <div className="units">
            <label className="field">
              <span className="lbl">원본 단위</span>
              <input list="units" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <button type="button" className="swap" onClick={() => { setFrom(to); setTo(from); }} aria-label="원본 단위와 대상 단위 맞바꾸기" title="맞바꾸기">
              ⇄
            </button>
            <label className="field">
              <span className="lbl">대상 단위</span>
              <input list="units" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
          <datalist id="units">
            {analyte.units.map((u) => (
              <option key={u} value={u} label={unitLabel(u)} />
            ))}
          </datalist>
          <p className="note">UCUM 표기를 씁니다(대소문자 구분). 예: mg/dL, mmol/L, umol/L, meq/L, U/L, ukat/L</p>
        </div>
      </section>

      <section className="outcome" aria-live="polite" aria-label="결과">
        {result === null && <p className="note">값을 입력하면 결과가 여기에 표시됩니다.</p>}

        {result?.ok && (
          <>
            <p className="readout">
              <span className="figure">{fmt(result.value)}</span>
              <span className="unit">{unitLabel(result.unit)}</span>
            </p>
            <p className="equation">{result.basis.formula.split('\n')[0]}</p>
            <button type="button" className="copy" onClick={copy}>
              {copied ? '복사했습니다' : '결과 복사'}
            </button>

            <h2 className="derivation-title">계산 근거</h2>
            <dl className="derivation">
              <dt>방법</dt>
              <dd>{result.basis.method}</dd>
              <dt>계수</dt>
              <dd>
                <ul>{result.basis.coefficients.map((c) => <li key={c}>{c}</li>)}</ul>
              </dd>
              <dt>수식</dt>
              <dd><pre>{result.basis.formula}</pre></dd>
              <dt>가정</dt>
              <dd>
                {result.basis.assumptions.length === 0 ? (
                  '없음'
                ) : (
                  <ul>{result.basis.assumptions.map((c) => <li key={c}>{c}</li>)}</ul>
                )}
              </dd>
              <dt>출처</dt>
              <dd>
                <ul>
                  {result.basis.sources.map((s) => (
                    <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>
                  ))}
                </ul>
              </dd>
            </dl>
          </>
        )}

        {result && !result.ok && (
          <div className="refusal" role="alert">
            <h2>이 변환은 할 수 없습니다</h2>
            <p>{result.reason}</p>
          </div>
        )}
      </section>
    </div>
  );
}
