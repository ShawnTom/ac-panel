import './fanspeeddisplay.css';

export type FanMode = 'auto' | 'manual';

interface FanSpeedDisplayProps {
  /** 当前风量档 1-5 */
  speed: number;
  /** 当前风量模式：auto / manual */
  mode: FanMode;
  /** 切档 */
  onSpeedChange: (next: number) => void;
  /** 切自动/手动 */
  onModeChange: (next: FanMode) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

const SPEEDS = [1, 2, 3, 4, 5];

/**
 * 中央风量显示：大数字档位 + 大风 icon；下方一行自动/手动 chip
 */
export function FanSpeedDisplay({ speed, mode, onSpeedChange, onModeChange, disabled = false }: FanSpeedDisplayProps) {
  const safe = Math.max(1, Math.min(5, Math.round(speed)));
  return (
    <div className={`fan-speed-display ${disabled ? 'fan-speed-display--disabled' : ''}`}>
      {/* 中央：大档位 + 大风 icon */}
      <div className="fan-speed-display__hero" aria-label={`当前风量 ${safe} 档，${mode === 'auto' ? '自动' : '手动'}`}>
        <button
          type="button"
          className="fan-speed-display__hero-btn"
          onClick={() => !disabled && onSpeedChange(safe >= 5 ? 1 : safe + 1)}
          disabled={disabled}
          aria-label="点按递增风量档"
          title={mode === 'auto' ? '自动模式下档位由系统控制' : '点按递增风量档'}
        >
          <FanLevelIcon level={safe} />
          <span className="fan-speed-display__value">{safe}</span>
          <span className="fan-speed-display__unit">档</span>
        </button>
      </div>

      {/* 5 颗等级点 */}
      <div className="fan-speed-display__pips" aria-hidden="true">
        {SPEEDS.map(s => (
          <span
            key={s}
            className={`fan-speed-display__pip ${s <= safe ? 'is-on' : ''}`}
          />
        ))}
      </div>

      {/* 下方：自动/手动 切换 */}
      <div className="fan-speed-display__mode-row" role="tablist" aria-label="风量模式">
        <button
          role="tab"
          aria-selected={mode === 'auto'}
          className={`fan-speed-display__mode-chip ${mode === 'auto' ? 'is-active' : ''}`}
          onClick={() => !disabled && onModeChange('auto')}
          disabled={disabled}
        >
          自动
        </button>
        <button
          role="tab"
          aria-selected={mode === 'manual'}
          className={`fan-speed-display__mode-chip ${mode === 'manual' ? 'is-active' : ''}`}
          onClick={() => !disabled && onModeChange('manual')}
          disabled={disabled}
        >
          手动
        </button>
      </div>
    </div>
  );
}

/**
 * 按档位渲染不同尺寸的"几道风"icon
 * 1=最弱（一根线），5=最强（五道）
 */
function FanLevelIcon({ level }: { level: number }) {
  const l = Math.max(1, Math.min(5, level));
  const lines = Array.from({ length: l }, (_, i) => i);
  return (
    <svg viewBox="0 0 64 64" width="84" height="84" fill="none" stroke="currentColor"
         strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {lines.map(i => {
        // 几道风在画布上排成轻微弧
        const y = 12 + (i * (40 / Math.max(1, lines.length - 1 || 1))) ;
        const length = 22 + i * 4;
        return (
          <path
            key={i}
            d={`M ${10} ${y} Q ${10 + length / 2} ${y - 4 - i * 2} ${10 + length} ${y}`}
            opacity={0.5 + i * 0.1}
          />
        );
      })}
    </svg>
  );
}
