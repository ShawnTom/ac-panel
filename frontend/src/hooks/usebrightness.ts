import { useState, useEffect, useCallback } from 'react';

interface BrightnessConfig {
  day: number;
  night: number;
}

/**
 * Brightness hook — auto-detects day/night and applies CSS filter.
 * Day: 06:00–18:00, Night: 18:00–06:00
 *
 * 设计原则：保证最低可读性
 * - 夜间模式最低不低于 30%，避免 brightness(0) 全黑
 * - 白天模式最低不低于 50%，保证普通环境可读
 * - 用 filter: brightness 而非 opacity，避免白底/黑底同时变暗的问题
 */
const MIN_DAY = 50;
const MIN_NIGHT = 30;
const MAX_BRIGHTNESS = 100;

/** 把用户配置钳到合理范围 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useBrightness(config: BrightnessConfig) {
  const [isNight, setIsNight] = useState(false);
  // 初始化时就把不合法的旧值修正，避免从 localStorage 恢复后变全黑
  const [brightnessConfig, setBrightnessConfig] = useState<BrightnessConfig>({
    day: clamp(config.day, MIN_DAY, MAX_BRIGHTNESS),
    night: clamp(config.night, MIN_NIGHT, MAX_BRIGHTNESS),
  });

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNight(hour < 6 || hour >= 18);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const applyBrightness = useCallback(() => {
    const value = isNight ? brightnessConfig.night : brightnessConfig.day;
    const root = document.getElementById('root');
    if (root) {
      // brightness(N/100) 的可读下限大约在 0.3-0.4，再低深色主题几乎看不见
      // 所以即便用户拉到最低（30%），我们也用 0.55 的最低映射
      const raw = value / 100;
      const safe = Math.max(raw, 0.55); // 最低映射到 55%，保证可读
      root.style.filter = `brightness(${safe.toFixed(2)})`;
      root.style.transition = 'filter 0.5s ease';
    }
  }, [isNight, brightnessConfig]);

  useEffect(() => {
    applyBrightness();
  }, [applyBrightness]);

  const updateConfig = useCallback((newConfig: Partial<BrightnessConfig>) => {
    setBrightnessConfig(prev => {
      const next = { ...prev, ...newConfig };
      return {
        day: clamp(next.day, MIN_DAY, MAX_BRIGHTNESS),
        night: clamp(next.night, MIN_NIGHT, MAX_BRIGHTNESS),
      };
    });
  }, []);

  return {
    isNight,
    brightnessConfig,
    updateConfig,
    currentBrightness: isNight ? brightnessConfig.night : brightnessConfig.day,
    limits: { minDay: MIN_DAY, minNight: MIN_NIGHT, max: MAX_BRIGHTNESS },
  };
}