import { fmt } from '../lib/format';
import type { Flag } from '../lib/interval';

/** Published interval drawn to scale, with the entered result located on it. */
export function RangeBar({ low, high, value, flag }: { low: number; high: number; value: number | null; flag: Flag | null }) {
  const span = high - low;
  const min = Math.max(0, low - span * 0.75);
  const max = high + span * 0.75;
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
  const lowPct = pct(low);
  const highPct = pct(high);

  return (
    <div className="rangebar" role="img" aria-label={`참고구간 ${fmt(low)} 이상 ${fmt(high)} 이하${value !== null ? `, 입력값 ${fmt(value)}` : ''}`}>
      <div className="track">
        <span className="zone below" style={{ width: `${lowPct}%` }} />
        <span className="zone within" style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }} />
        <span className="zone above" style={{ left: `${highPct}%`, width: `${100 - highPct}%` }} />
        {value !== null && (
          <span className={`marker ${flag ?? ''}`} style={{ left: `${pct(value)}%` }}>
            <span className="tag">{fmt(value)}</span>
          </span>
        )}
      </div>
      <div className="ticks">
        <span style={{ left: `${lowPct}%` }}>{fmt(low)}</span>
        <span style={{ left: `${highPct}%` }}>{fmt(high)}</span>
      </div>
    </div>
  );
}
