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
    <div className="analyte">
      <label className="field">
        <span className="lbl">{label}</span>
        <input
          type="search"
          placeholder="glucose, 혈당, SGPT, A1c"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <ul className="picklist" role="listbox" aria-label={`${label} 목록`}>
        {matches.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              role="option"
              aria-selected={a.id === value}
              onClick={() => onChange(a.id)}
            >
              <span className="ko">{a.ko}</span>
              <span className="en">{a.en}</span>
            </button>
          </li>
        ))}
      </ul>
      {matches.length === 0 && (
        <p className="note">'{q}'에 해당하는 분석물이 없습니다. 이 앱에 없는 분석물은 임의로 추가하지 않았습니다.</p>
      )}
    </div>
  );
}
