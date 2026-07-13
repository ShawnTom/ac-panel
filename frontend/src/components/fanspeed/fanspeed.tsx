import './fanspeed.css';

interface FanSpeedProps {
  /** 当前风量档 1-5 */
  value: number;
  /** 修改档位 */
  onChange: (next: number) => void;
}

/** 5 档，使用 1..5 */
const SPEEDS = [1, 2, 3, 4, 5];

/** 低风量图标：1 根斜线 */
function LowFanIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16h12" />
      <path d="M4 20h8" />
    </svg>
  );
}

/** 大风量图标：3 根弧线 */
function HighFanIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8c4 0 6 2 6 6" />
      <path d="M9 10c2-4 5-6 8-6" />
      <path d="M3 14c6 0 12 4 14 8" />
    </svg>
  );
}

export function FanSpeed({ value, onChange }: FanSpeedProps) {
  const safe = Math.max(1, Math.min(5, Math.round(value || 1)));
  const ratio = (safe - 1) / 4; // 0..1
  return (
    <div className="fan-speed" role="group" aria-label="风量调节">
      <span className="fan-speed__icon fan-speed__icon--low" aria-hidden="true">
        <LowFanIcon />
      </span>
      <div className="fan-speed__track">
        <div
          className="fan-speed__fill"
          style={{ width: `${ratio * 100}%` }}
        />
        {SPEEDS.map(s => {
          const active = s <= safe;
          return (
            <button
              key={s}
              type="button"
              className={`fan-speed__seg ${active ? 'is-active' : ''}`}
              onClick={() => onChange(s)}
              aria-label={`${s} 档`}
            />
          );
        })}
      </div>
      <span className="fan-speed__icon fan-speed__icon--high" aria-hidden="true">
        <HighFanIcon />
      </span>
    </div>
  );
}
