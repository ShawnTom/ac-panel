import type { GlobalSettings, ThemeName } from '../../types';
import { Panel } from '../shared/panel';
import './globalsettings.css';

interface GlobalSettingsProps {
  settings: GlobalSettings;
  brightnessConfig: { day: number; night: number };
  isNight: boolean;
  onThemeChange: (theme: ThemeName) => void;
  onBrightnessChange: (day: number, night: number) => void;
  onBack: () => void;
}

const THEMES: { name: ThemeName; label: string; preview: string }[] = [
  { name: 'tech-blue-purple', label: '科技蓝紫', preview: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' },
  { name: 'black-gold', label: '尊贵黑金', preview: 'linear-gradient(135deg, #d4a843, #f0c75e)' },
  { name: 'gray-white', label: '极简灰白', preview: 'linear-gradient(135deg, #4a4a4a, #2d2d2d)' },
];

export function GlobalSettingsPanel({
  settings,
  brightnessConfig,
  isNight,
  onThemeChange,
  onBrightnessChange,
  onBack,
}: GlobalSettingsProps) {
  return (
    <Panel className="global-settings">
      {/* Header */}
      <div className="global-settings__header">
        <button className="global-settings__back-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <span className="global-settings__title">设置</span>
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
        <span className="global-settings__section-title">亮度</span>
        <div className="global-settings__brightness">
          <div className="global-settings__brightness-row">
            <span className="global-settings__brightness-label">
              白天 {isNight ? '' : '●'}
            </span>
            <input
              type="range"
              min={30}
              max={100}
              value={brightnessConfig.day}
              onChange={(e) => onBrightnessChange(Number(e.target.value), brightnessConfig.night)}
              className="global-settings__slider"
            />
            <span className="global-settings__brightness-value">{brightnessConfig.day}%</span>
          </div>
          <div className="global-settings__brightness-row">
            <span className="global-settings__brightness-label">
              夜间 {isNight ? '●' : ''}
            </span>
            <input
              type="range"
              min={20}
              max={80}
              value={brightnessConfig.night}
              onChange={(e) => onBrightnessChange(brightnessConfig.day, Number(e.target.value))}
              className="global-settings__slider"
            />
            <span className="global-settings__brightness-value">{brightnessConfig.night}%</span>
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
