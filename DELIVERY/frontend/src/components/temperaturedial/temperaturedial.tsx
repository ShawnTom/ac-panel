import { useRef, useCallback, useEffect } from 'react';
import './temperaturedial.css';

interface TemperatureDialProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * Semi-circular temperature dial with pointer drag support.
 * Uses SVG arc for progress visualization.
 */
export function TemperatureDial({
  value,
  min = 16,
  max = 30,
  onChange,
  disabled = false,
}: TemperatureDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  // Arc parameters
  const radius = 130;
  const centerX = 150;
  const centerY = 150;
  const strokeWidth = 12;

  // Convert temperature to angle (0deg = left, 180deg = right)
  const tempToAngle = useCallback((temp: number) => {
    const ratio = (temp - min) / (max - min);
    return ratio * 180; // 0 to 180 degrees
  }, [min, max]);

  // Convert angle to temperature
  const angleToTemp = useCallback((angle: number) => {
    const clamped = Math.max(0, Math.min(180, angle));
    const ratio = clamped / 180;
    const temp = min + ratio * (max - min);
    return Math.round(temp);
  }, [min, max]);

  // Calculate pointer angle from center
  const getAngle = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;
    // angle from -180 to 0 (semi-circle on top)
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    // Normalize: 0 = right, -180 = left → we want 0=left, 180=right
    angle = 180 + angle; // Now 0 = left, 180 = right
    return Math.max(0, Math.min(180, angle));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    const angle = getAngle(e.clientX, e.clientY);
    onChange(angleToTemp(angle));
  }, [disabled, getAngle, angleToTemp, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const angle = getAngle(e.clientX, e.clientY);
    onChange(angleToTemp(angle));
  }, [disabled, getAngle, angleToTemp, onChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  // SVG arc path generation
  const describeArc = (angle: number) => {
    const startAngle = 180; // Start from left
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

  const currentAngle = tempToAngle(value);
  const progressPath = describeArc(currentAngle);
  const trackPath = describeArc(180);

  // Tick marks
  const ticks = Array.from({ length: 15 }, (_, i) => {
    const tickAngle = (i / 14) * 180;
    const tickRad = ((180 - tickAngle) * Math.PI) / 180;
    const innerR = radius - 18;
    const outerR = radius - 8;
    const x1 = centerX + innerR * Math.cos(tickRad);
    const y1 = centerY - innerR * Math.sin(tickRad);
    const x2 = centerX + outerR * Math.cos(tickRad);
    const y2 = centerY - outerR * Math.sin(tickRad);
    return { x1, y1, x2, y2, temp: min + (i / 14) * (max - min) };
  });

  useEffect(() => {
    // Prevent scrolling when dragging
    const preventScroll = (e: TouchEvent) => {
      if (isDragging.current) e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

  return (
    <div className={`temperature-dial ${disabled ? 'temperature-dial--disabled' : ''}`}>
      <svg
        ref={svgRef}
        className="temperature-dial__svg"
        viewBox="0 0 300 300"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <linearGradient id="dial-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="var(--dial-track)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={progressPath}
          fill="none"
          stroke="url(#dial-progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {/* Knob/handle */}
        {(() => {
          const knobAngle = (180 - currentAngle) * Math.PI / 180;
          const knobX = centerX + radius * Math.cos(knobAngle);
          const knobY = centerY - radius * Math.sin(knobAngle);
          return (
            <circle
              cx={knobX}
              cy={knobY}
              r={10}
              fill="var(--accent-secondary)"
              stroke="var(--bg-secondary)"
              strokeWidth="3"
              className="temperature-dial__knob"
            />
          );
        })()}
      </svg>

      {/* Center display */}
      <div className="temperature-dial__center">
        <span className="temperature-dial__value">{value}</span>
        <span className="temperature-dial__unit">°C</span>
      </div>
    </div>
  );
}
