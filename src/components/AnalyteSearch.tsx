import { useMemo, useState } from 'react';

export interface SearchItem {
  id: string;
  en: string;
  ko: string;
  synonyms: string[];
}

const norm = (s: string) => s.toLowerCase().replace(/[\s\-_()/.]/g, '');

export function AnalyteSearch<T extends SearchItem>({
  items, value, onChange, label,
}: { items: T[]; value: string; onChange: (id: string) => void; label: string }) {
  const [q, setQ] = useState('');
  const matches = useMemo(() => {
    const n = norm(q);
    if (!n) return items;
    return items.filter((a) => [a.id, a.en, a.ko, ...a.synonyms].some((t) => norm(t).includes(n)));
  }, [items, q]);

  return (
    <fieldset className="field">
      <legend>{label}</legend>
      <input
        type="search"
        placeholder="영문·한글·동의어 검색 (예: glucose, 혈당, SGPT, A1c)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label={`${label} 검색`}
      />
      <select size={Math.min(6, Math.max(2, matches.length))} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {matches.map((a) => (
          <option key={a.id} value={a.id}>
            {a.ko} · {a.en}
          </option>
        ))}
      </select>
      {matches.length === 0 && <p className="muted">검색 결과가 없습니다. 이 앱에 없는 분석물은 임의로 추가하지 않았습니다.</p>}
    </fieldset>
  );
}
