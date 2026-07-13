import { useRef, useCallback, useEffect } from 'react';
import './fandial.css';

interface FanDialProps {
  value: number;          // 1..5
  onChange: (next: number) => void;
  disabled?: boolean;     // 自动模式时 disable
}

/**
 * 半圆形风量拨盘：复用 TemperatureDial 的弧形几何（半径 150、半圆 180°）
 * 但内部分段为 5 档风量；中央显示"按档位递增"的风 icon（不再显示 °C）。
 *
 * - 自动模式（disabled）→ 半透明、不可拖拽
 * - 手动模式 → 拖拽选择档位；弧上 5 个等分点指示当前档
 */
export function FanDial({ value, onChange, disabled = false }: FanDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  // 与 TemperatureDial 一致的画布几何
  const radius = 150;
  const centerX = 160;
  const centerY = 175;
  const strokeWidth = 14;

  // 风量 1..5 → 0..180°
  const speedToAngle = useCallback((n: number) => {
    const c = Math.max(1, Math.min(5, Math.round(n)));
    return ((c - 1) / 4) * 180; // 0..180
  }, []);

  // 角度 0..180 → 风量档 1..5（按位置最近的一档）
  const angleToSpeed = useCallback((angle: number) => {
    const c = Math.max(0, Math.min(180, angle));
    // 每一档 36°，找到最近的档（1..5）
    return Math.max(1, Math.min(5, Math.round((c / 180) * 4) + 1));
  }, []);

  const getAngle = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    angle = 180 + angle; // 0=left, 180=right
    return Math.max(0, Math.min(180, angle));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const angle = getAngle(e.clientX, e.clientY);
    onChange(angleToSpeed(angle));
  }, [disabled, getAngle, angleToSpeed, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const angle = getAngle(e.clientX, e.clientY);
    onChange(angleToSpeed(angle));
  }, [disabled, getAngle, angleToSpeed, onChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  // 弧线描述
  const describeArc = (angle: number) => {
    const startAngle = 180;
    const endAngle = 180 - angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY - radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY - radius * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const trackPath = describeArc(180);
  const fillPath = describeArc(speedToAngle(value));

  // 5 个等分点（0/36/72/108/144/180 → 0..5 编号 → 点位置 5 个，0 和 180 = 同一个首/尾）
  // 5 段用 5 个中点位置：每段中心 36/2 = 18°、90°、162° → 1..5 档
  // 实际上需要的是 5 个"等分点"，放在各档位置
  const ticks = [0, 1, 2, 3, 4].map(i => i * 45); // 0°, 45°, 90°, 135°, 180° — 5 个等分
  const tickInnerR = radius - 18;
  const tickOuterR = radius - 8;

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging.current) e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

  const safeValue = Math.max(1, Math.min(5, Math.round(value)));

  return (
    <div className={`fan-dial ${disabled ? 'fan-dial--disabled' : ''}`}>
      <svg ref={svgRef} className="fan-dial__svg" viewBox="0 0 320 200">
        <defs>
          <linearGradient id="fan-dial-fill-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>

        {/* 背景轨道 */}
        <path d={trackPath} fill="none" stroke="var(--dial-track)" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* 当前档进度（fill arc） */}
        <path
          d={fillPath}
          fill="none"
          stroke="url(#fan-dial-fill-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 5 个等分刻度点：高亮 1..value 的前几档；其余暗淡 */}
        {ticks.map((angle, i) => {
          const tickRad = ((180 - angle) * Math.PI) / 180;
          const x1 = centerX + tickInnerR * Math.cos(tickRad);
          const y1 = centerY - tickInnerR * Math.sin(tickRad);
          const x2 = centerX + tickOuterR * Math.cos(tickRad);
          const y2 = centerY - tickOuterR * Math.sin(tickRad);
          const lit = i < safeValue;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lit ? 'var(--accent-secondary)' : 'var(--text-muted)'}
              strokeWidth={lit ? 3 : 1.5}
              opacity={lit ? 1 : 0.45}
              style={{ filter: lit ? 'drop-shadow(0 0 4px var(--accent-glow))' : 'none' }}
            />
          );
        })}

        {/* 旋钮/handle：位置 = 当前档对应角度 */}
        {(() => {
          const knobAngle = (180 - speedToAngle(safeValue)) * Math.PI / 180;
          const knobX = centerX + radius * Math.cos(knobAngle);
          const knobY = centerY - radius * Math.sin(knobAngle);
          return (
            <g className="fan-dial__knob-group">
              <circle cx={knobX} cy={knobY} r={14} fill="var(--accent-secondary)" opacity="0.35" />
              <circle
                cx={knobX}
                cy={knobY}
                r={10}
                fill="var(--accent-secondary)"
                stroke="var(--bg-secondary)"
                strokeWidth={3}
                className="fan-dial__knob"
              />
            </g>
          );
        })()}

        {/* 拖拽热区：透明窄带覆盖弧附近 */}
        <path
          d={trackPath}
          fill="none"
          stroke="transparent"
          strokeWidth={32}
          strokeLinecap="round"
          className="fan-dial__hotzone"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </svg>

      {/* 中央：风 icon + 大档位数字 */}
      <div className="fan-dial__center">
        <FanLevelIcon level={safeValue} />
        <span className="fan-dial__value">{safeValue}</span>
        <span className="fan-dial__unit">档</span>
      </div>
    </div>
  );
}

/** 按档位渲染不同尺寸的"几道风"icon
 * 1=最弱（一根线），5=最强（五道） */
function FanLevelIcon({ level }: { level: number }) {
  const l = Math.max(1, Math.min(5, level));
  const lines = Array.from({ length: l }, (_, i) => i);
  return (
    <svg viewBox="0 0 64 32" width="56" height="28" fill="none" stroke="currentColor"
         strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {lines.map(i => {
        const y = 4 + (i * 24 / Math.max(1, lines.length - 1 || 1));
        const length = 22 + i * 4;
        return (
          <path
            key={i}
            d={`M ${4} ${y} Q ${4 + length / 2} ${y - 4 - i * 1} ${4 + length} ${y}`}
            opacity={0.5 + i * 0.1}
          />
        );
      })}
    </svg>
  );
}
