import { useState, useEffect } from 'react';
import type { GlobalSettings, ThemeName } from '../../types';
import { Panel } from '../shared/panel';
import '../../hooks/toast.css';
import './globalsettings.css';

interface GlobalSettingsProps {
  settings: GlobalSettings;
  brightnessConfig: { day: number; night: number };
  isNight: boolean;
  onThemeChange: (theme: ThemeName) => void;
  onBrightnessChange: (day: number, night: number) => void;
  /** 跨时段调节时调用：临时应用 value 3 秒后自动恢复 */
  onBrightnessPreview?: (value: number) => void;
  /** 当前是否处于预览中（用于高亮提示） */
  previewValue?: number | null;
  /** 预览倒计时（秒） */
  previewCountdown?: number;
  onBack: () => void;
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const THEMES: { name: ThemeName; label: string; preview: string }[] = [
  { name: 'tech-blue-purple', label: '科技蓝紫', preview: 'linear-gradient(135deg, #6c5ce7, #5b9cff)' },
  { name: 'black-gold', label: '尊贵黑金', preview: 'linear-gradient(135deg, #8B7332 0%, #D4AF37 50%, #C9A961 100%)' },
  { name: 'gray-white', label: '简约黑白', preview: 'linear-gradient(135deg, #4a4e58 0%, #1a1a1a 50%, #2a2a2a 100%)' },
];

export function GlobalSettingsPanel({
  settings,
  brightnessConfig,
  isNight,
  onThemeChange,
  onBrightnessChange,
  onBrightnessPreview,
  previewValue = null,
  previewCountdown = 0,
  onBack,
}: GlobalSettingsProps) {
  // 全局 toast（用于跨时段预览倒计时）
  const [globalToast, setGlobalToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // 跨时段滑块的本地"虚拟"值：让滑块 UI 不回弹，但不持久化
  const [daySlider, setDaySlider] = useState<number | null>(null);
  const [nightSlider, setNightSlider] = useState<number | null>(null);

  // 预览结束时清掉本地虚拟值
  useEffect(() => {
    if (previewValue === null) {
      setDaySlider(null);
      setNightSlider(null);
    }
  }, [previewValue]);

  useEffect(() => {
    if (previewValue === null) {
      setGlobalToast({ message: '', visible: false });
      return;
    }
    setGlobalToast({
      message: `${previewCountdown}秒后退出预览`,
      visible: true,
    });
  }, [previewValue, previewCountdown]);

  /**
   * 处理亮度滑块变化：
   * - 当前时段滑块：直接写入配置
   * - 跨时段滑块（白天调夜间/夜间调白天）：触发 3 秒预览 + toast 倒计时
   *   滑块 UI 显示本地虚拟值（不回弹），3 秒后预览结束本地虚拟值清空，恢复原值
   */
  const handleDayChange = (value: number) => {
    if (isNight) {
      // 当前是夜间，调节白天滑块 = 跨时段预览
      setDaySlider(value);
      onBrightnessPreview?.(value);
    } else {
      onBrightnessChange(value, brightnessConfig.night);
    }
  };

  const handleNightChange = (value: number) => {
    if (isNight) {
      // 当前是夜间，调节夜间滑块 = 当前时段，直接写入
      onBrightnessChange(brightnessConfig.day, value);
    } else {
      // 当前是白天，调节夜间滑块 = 跨时段预览
      setNightSlider(value);
      onBrightnessPreview?.(value);
    }
  };

  return (
    <Panel className="global-settings">
      {/* Header */}
      <div className="global-settings__header">
        <button className="global-settings__back-btn" onClick={onBack} aria-label="Back">
          <BackArrowIcon />
        </button>
        <span className="global-settings__title">设置</span>
      </div>

      {/* 跨时段预览 Toast */}
      <div className={`toast ${globalToast.visible ? 'toast--visible' : ''}`}>
        {globalToast.message}
      </div>

      {/* Theme Selection */}
      <div className="global-settings__section">
        <span className="global-settings__section-title">主题</span>
        <div className="global-settings__themes">
          {THEMES.map((theme) => (
            <button
              key={theme.name}
              className={`global-settings__theme-card ${settings.theme === theme.name ? 'global-settings__theme-card--active' : ''}`}
              onClick={() => onThemeChange(theme.name)}
            >
              <div
                className="global-settings__theme-preview"
                style={{ background: theme.preview }}
              />
              <span className="global-settings__theme-label">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brightness */}
      <div className="global-settings__section">
        <div className="global-settings__section-header">
          <span className="global-settings__section-title">亮度</span>
          <p className="global-settings__section-hint">
            非当前时间段预览 3 秒后自动恢复
          </p>
        </div>
        <div className="global-settings__period-hint">
          <span>白天（8:00-18:00）{isNight ? '' : '●'}</span>
          <span>晚上（18:00-8:00）{isNight ? '●' : ''}</span>
        </div>
        <div className="global-settings__brightness">
          <div className="global-settings__brightness-row">
            <span className="global-settings__brightness-label">
              白天 {isNight ? '' : '●'}
            </span>
            <input
              type="range"
              min={50}
              max={100}
              value={daySlider ?? brightnessConfig.day}
              onChange={(e) => handleDayChange(Number(e.target.value))}
              className="global-settings__slider"
            />
            <span className="global-settings__brightness-value">{daySlider ?? brightnessConfig.day}%</span>
          </div>
          <div className="global-settings__brightness-row">
            <span className="global-settings__brightness-label">
              夜间 {isNight ? '●' : ''}
            </span>
            <input
              type="range"
              min={30}
              max={80}
              value={nightSlider ?? brightnessConfig.night}
              onChange={(e) => handleNightChange(Number(e.target.value))}
              className="global-settings__slider"
            />
            <span className="global-settings__brightness-value">{nightSlider ?? brightnessConfig.night}%</span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="global-settings__section global-settings__section--info">
        <div className="global-settings__info-row">
          <span className="global-settings__info-label">当前模式</span>
          <span className="global-settings__info-value">{settings.currentMode}</span>
        </div>
        <div className="global-settings__info-row">
          <span className="global-settings__info-label">系统状态</span>
          <span className={`global-settings__info-value ${settings.power ? 'global-settings__info-value--on' : ''}`}>
            {settings.power ? '运行中' : '已关闭'}
          </span>
        </div>
      </div>
    </Panel>
  );
}
