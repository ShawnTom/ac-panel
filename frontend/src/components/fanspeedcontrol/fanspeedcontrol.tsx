import { useRef, useCallback, useEffect } from 'react';
import './fanspeedcontrol.css';

interface FanSpeedControlProps {
  value: number;          // 1..5
  onChange: (next: number) => void;
  /** 自动/手动：自动时控件整体禁用（视觉弱化 + 不可点） */
  autoMode?: boolean;
  disabled?: boolean;     // 整体禁用（断电等）
}

const LEVELS = 5;

/**
 * 五档风量调节组件（替代半圆 FanDial）：
 * 1. 顶部：动态扇叶 icon + 大数字 + "档" 单位
 * 2. 中部：5 个独立 segment 按钮，点哪个跳哪一档；支持点击/滑动
 * 3. 底部：自动/手动 切换 chip 内嵌在组件内
 *
 * 交互方式：
 * - 直接点击某一段 → 跳到该档
 * - 在 segment 区域横向滑动（touch/mouse drag）→ 跟随手指位置切换档
 * - 左右 ± 按钮 → 上一档/下一档（bound 1..5）
 */
export function FanSpeedControl({
  value,
  onChange,
  autoMode = false,
  disabled = false,
}: FanSpeedControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ active: boolean; pointerId: number | null }>({
    active: false,
    pointerId: null,
  });

  const safe = Math.max(1, Math.min(LEVELS, Math.round(value)));

  const isInactive = disabled || autoMode;

  const setLevel = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(LEVELS, Math.round(next)));
      if (clamped !== safe) onChange(clamped);
    },
    [onChange, safe]
  );

  // 把 pointer 坐标转换为当前应激活的档位（按 segment 容器宽度等分）
  const levelFromPointer = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return safe;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return safe;
    const ratio = (clientX - rect.left) / rect.width;
    const idx = Math.floor(ratio * LEVELS);
    return Math.max(1, Math.min(LEVELS, idx + 1));
  }, [safe]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isInactive) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, pointerId: e.pointerId };
    setLevel(levelFromPointer(e.clientX));
  }, [isInactive, levelFromPointer, setLevel]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active || isInactive) return;
    e.preventDefault();
    setLevel(levelFromPointer(e.clientX));
  }, [isInactive, levelFromPointer, setLevel]);

  const handlePointerEnd = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    dragRef.current = { active: false, pointerId: null };
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  // 防止拖拽时页面整体滚动
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (dragRef.current.active) e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

  return (
    <div
      className={`fan-speed ${isInactive ? 'fan-speed--inactive' : ''} ${autoMode ? 'fan-speed--auto' : ''}`}
      data-active-level={safe}
    >
      {/* 顶部：风 icon 在左，大档位数字在右（左右排列） */}
      <div className="fan-speed__display">
        <FanIcon level={safe} active={!disabled} autoMode={autoMode} />
        <div className="fan-speed__readout-col">
          <div className="fan-speed__readout">
            <span className="fan-speed__value">{safe}</span>
            <span className="fan-speed__unit">档</span>
          </div>
          <div className="fan-speed__label">
            {isInactive ? (autoMode ? '自动风量' : '已关闭') : '风量'}
          </div>
        </div>
      </div>

      {/* 中部：± 按钮 + 5 段 segment */}
      <div className="fan-speed__controls">
        <button
          type="button"
          className="fan-speed__step-btn"
          onClick={() => setLevel(safe - 1)}
          disabled={isInactive || safe <= 1}
          aria-label="降低风量"
        >
          <MinusIcon />
        </button>

        <div
          ref={trackRef}
          className="fan-speed__segments"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          role="slider"
          aria-valuemin={1}
          aria-valuemax={LEVELS}
          aria-valuenow={safe}
          aria-label="风量档位"
          tabIndex={isInactive ? -1 : 0}
        >
          {Array.from({ length: LEVELS }, (_, i) => i + 1).map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`fan-speed__segment ${lvl <= safe ? 'fan-speed__segment--lit' : ''}`}
              style={{ ['--seg-idx' as string]: i }}
              onClick={(e) => {
                e.stopPropagation();
                setLevel(lvl);
              }}
              disabled={isInactive}
              aria-label={`${lvl} 档`}
              aria-pressed={lvl === safe}
              tabIndex={-1}
            >
              <span className="fan-speed__segment-bar" />
              <span className="fan-speed__segment-num">{lvl}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="fan-speed__step-btn"
          onClick={() => setLevel(safe + 1)}
          disabled={isInactive || safe >= LEVELS}
          aria-label="提高风量"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * 旋转风叶 icon：
 * - 档位越高，扇叶越多/越"实"，手动模式下旋转越快
 * - 自动模式（autoMode=true）：保持中等固定速度
 * - 关闭 / 禁用时静止、半透明
 */
function FanIcon({ level, active, autoMode = false }: { level: number; active: boolean; autoMode?: boolean }) {
  const l = Math.max(1, Math.min(LEVELS, level));
  // 不同档位扇叶数不同：1=2 叶, 2=3 叶, 3=3 叶, 4=4 叶, 5=4 叶
  const bladeCount = l <= 1 ? 2 : l <= 3 ? 3 : 4;
  // 自动模式固定速度；手动模式按档位递增转速
  const dur = !active ? 0 : autoMode ? 1.2 : Math.max(0.4, 1.6 - l * 0.25);

  return (
    <div
      className={`fan-icon ${active ? 'fan-icon--active' : 'fan-icon--idle'}`}
      style={{ ['--fan-dur' as string]: `${dur}s` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" width="64" height="64">
        <defs>
          <linearGradient id="fan-blade-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>
        <g className="fan-icon__rotor" style={{ transformOrigin: '32px 32px' }}>
          {Array.from({ length: bladeCount }, (_, i) => {
            const angle = (360 / bladeCount) * i;
            return (
              <path
                key={i}
                d="M32 32 Q 24 12 32 8 Q 40 12 32 32 Z"
                fill="url(#fan-blade-gradient)"
                opacity={active ? 0.85 : 0.45}
                transform={`rotate(${angle} 32 32)`}
              />
            );
          })}
          <circle cx="32" cy="32" r="4" fill="var(--accent-secondary)" />
        </g>
      </svg>
    </div>
  );
}
