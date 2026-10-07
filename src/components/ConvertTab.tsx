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
    <section>
      <AnalyteSearch items={ALL} value={id} onChange={pick} label="분석물" />

      <div className="row">
        <label className="field grow">
          값
          <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label className="field grow">
          원본 단위
          <input list="units" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <button type="button" className="swap" onClick={() => { setFrom(to); setTo(from); }} aria-label="원본·대상 단위 바꾸기" title="단위 바꾸기">
          ⇄
        </button>
        <label className="field grow">
          대상 단위
          <input list="units" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <datalist id="units">
          {analyte.units.map((u) => (
            <option key={u} value={u} label={unitLabel(u)} />
          ))}
        </datalist>
      </div>
      <p className="muted">단위는 UCUM 표기(대소문자 구분): mg/dL, mmol/L, umol/L(=μmol/L), meq/L(=mEq/L), U/L, ukat/L</p>

      <div className="result" aria-live="polite">
        {result === null && <span className="muted">값을 입력하세요.</span>}
        {result?.ok && (
          <>
            <div className="big">
              {fmt(result.value)} <span className="unit">{unitLabel(result.unit)}</span>
            </div>
            <button type="button" onClick={copy}>{copied ? '복사됨 ✓' : '결과 복사'}</button>
          </>
        )}
        {result && !result.ok && (
          <div className="reject">
            <strong>변환할 수 없습니다.</strong>
            <p>{result.reason}</p>
          </div>
        )}
      </div>

      {result?.ok && (
        <details className="basis" open>
          <summary>계산 근거</summary>
          <dl>
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
              {result.basis.assumptions.length === 0 ? '특별한 가정 없음' : (
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
        </details>
      )}
    </section>
  );
}
