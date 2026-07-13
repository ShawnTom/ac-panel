import { useState, useEffect, useCallback, useRef } from 'react';

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
 *
 * 跨时段调节：
 * - 白天调夜间/夜间调白天滑块时，临时应用 3 秒预览
 * - 预览期间通过 previewValue / previewCountdown 暴露给上层做 toast 倒计时
 * - 3 秒后自动恢复当前时段配置的亮度（用 ref 锁住最新值，不依赖 useEffect 时序）
 */
const MIN_DAY = 50;
const MIN_NIGHT = 30;
const MAX_BRIGHTNESS = 100;
const PREVIEW_DURATION_MS = 3000;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useBrightness(config: BrightnessConfig) {
  const [isNight, setIsNight] = useState(false);
  const [brightnessConfig, setBrightnessConfig] = useState<BrightnessConfig>({
    day: clamp(config.day, MIN_DAY, MAX_BRIGHTNESS),
    night: clamp(config.night, MIN_NIGHT, MAX_BRIGHTNESS),
  });
  // 预览值：非 null 时说明正在预览中（用于上层 toast 倒计时）
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 用 ref 锁住最新的 isNight / brightnessConfig，避免 effect 时序问题
  const isNightRef = useRef(isNight);
  const configRef = useRef(brightnessConfig);
  useEffect(() => { isNightRef.current = isNight; }, [isNight]);
  useEffect(() => { configRef.current = brightnessConfig; }, [brightnessConfig]);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNight(hour < 6 || hour >= 18);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 把用户给定的值钳到合理范围并按最低映射
  const applyValue = useCallback((value: number) => {
    const root = document.getElementById('root');
    if (!root) return;
    const raw = value / 100;
    const safe = Math.max(raw, 0.55);
    root.style.filter = `brightness(${safe.toFixed(2)})`;
    root.style.transition = 'filter 0.5s ease';
  }, []);

  // 应用当前时段配置的亮度（不进入预览态）
  const applyCurrent = useCallback(() => {
    const current = isNightRef.current ? configRef.current.night : configRef.current.day;
    applyValue(current);
  }, [applyValue]);

  // 取消预览：清除 timer + 重置状态 + 立即恢复当前时段真实亮度
  const cancelPreview = useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    setPreviewValue(null);
    setCountdown(0);
    // 显式立刻恢复当前时段的真实亮度，不依赖 useEffect
    applyCurrent();
  }, [applyCurrent]);

  // 预览一个亮度值（跨时段滑块调节时调用）
  const previewBrightness = useCallback((value: number) => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setPreviewValue(value);
    setCountdown(Math.ceil(PREVIEW_DURATION_MS / 1000));
    applyValue(value);
    previewTimerRef.current = setTimeout(() => {
      cancelPreview();
    }, PREVIEW_DURATION_MS);
  }, [cancelPreview, applyValue]);

  // 倒计时 tick：每秒递减
  useEffect(() => {
    if (previewValue === null) return;
    const tick = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [previewValue]);

  // 当 isNight 或 brightnessConfig 变化时（且未在预览）应用当前时段
  useEffect(() => {
    if (previewValue === null) {
      applyCurrent();
    }
  }, [isNight, brightnessConfig, previewValue, applyCurrent]);

  // 卸载时清理
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

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
    previewValue,
    previewCountdown: countdown,
    previewBrightness,
    cancelPreview,
  };
}
