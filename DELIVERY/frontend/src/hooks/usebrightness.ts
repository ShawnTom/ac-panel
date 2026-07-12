import { useState, useEffect, useCallback } from 'react';

interface BrightnessConfig {
  day: number;
  night: number;
}

/**
 * Brightness hook — auto-detects day/night and applies CSS filter.
 * Day: 06:00–18:00, Night: 18:00–06:00
 */
export function useBrightness(config: BrightnessConfig) {
  const [isNight, setIsNight] = useState(false);
  const [brightnessConfig, setBrightnessConfig] = useState(config);

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
      root.style.filter = `brightness(${value / 100})`;
      root.style.transition = 'filter 0.5s ease';
    }
  }, [isNight, brightnessConfig]);

  useEffect(() => {
    applyBrightness();
  }, [applyBrightness]);

  const updateConfig = useCallback((newConfig: Partial<BrightnessConfig>) => {
    setBrightnessConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return {
    isNight,
    brightnessConfig,
    updateConfig,
    currentBrightness: isNight ? brightnessConfig.night : brightnessConfig.day,
  };
}
