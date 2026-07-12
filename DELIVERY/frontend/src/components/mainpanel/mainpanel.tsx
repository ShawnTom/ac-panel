import { useState, useEffect } from 'react';
import type { Room, GlobalSettings, ACMode } from '../../types';
import { Panel } from '../shared/panel';
import { TemperatureDial } from '../temperaturedial/temperaturedial';
import './mainpanel.css';

interface MainPanelProps {
  room: Room;
  settings: GlobalSettings;
  onModeChange: (mode: ACMode) => void;
  onPowerToggle: () => void;
  onSettingsClick: () => void;
  onRoomUpdate: (room: Room) => void;
}

const MODE_ICONS: Record<ACMode, { label: string; icon: string }> = {
  cool: { label: 'Cool', icon: '❄️' },
  heat: { label: 'Heat', icon: '🔥' },
  wind: { label: 'Wind', icon: '💨' },
  auto: { label: 'Auto', icon: '🤖' },
};

export function MainPanel({
  room,
  settings,
  onModeChange,
  onPowerToggle,
  onSettingsClick,
  onRoomUpdate,
}: MainPanelProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTempChange = (temp: number) => {
    onRoomUpdate({ ...room, acTemp: temp });
  };

  const isPoweredOn = settings.power && room.power;

  return (
    <Panel className={`main-panel ${!isPoweredOn ? 'main-panel--off' : ''}`}>
      {/* Header */}
      <div className="main-panel__header">
        <div className="main-panel__room-info">
          <span className="main-panel__room-name">{room.name}</span>
          <span className="main-panel__time">{currentTime}</span>
        </div>
        <button
          className="main-panel__settings-btn"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>

      {isPoweredOn ? (
        <>
          {/* AC Mode buttons */}
          <div className="main-panel__modes">
            {(Object.keys(MODE_ICONS) as ACMode[]).map((mode) => (
              <button
                key={mode}
                className={`main-panel__mode-btn ${settings.currentMode === mode ? 'main-panel__mode-btn--active' : ''}`}
                onClick={() => onModeChange(mode)}
              >
                <span className="main-panel__mode-icon">{MODE_ICONS[mode].icon}</span>
                <span className="main-panel__mode-label">{MODE_ICONS[mode].label}</span>
              </button>
            ))}
          </div>

          {/* Temperature Dial */}
          <div className="main-panel__dial-wrapper">
            <TemperatureDial
              value={room.acTemp}
              onChange={handleTempChange}
              min={16}
              max={30}
            />
          </div>

          {/* Info row */}
          <div className="main-panel__info-row">
            <div className="main-panel__info-item">
              <span className="main-panel__info-label">室内温度</span>
              <span className="main-panel__info-value">{room.indoorTemp}°C</span>
            </div>
            <div className="main-panel__info-divider" />
            <div className="main-panel__info-item">
              <span className="main-panel__info-label">湿度</span>
              <span className="main-panel__info-value">{room.humidity}%</span>
            </div>
          </div>

          {/* Power button */}
          <button
            className="main-panel__power-btn"
            onClick={onPowerToggle}
            aria-label="Power"
          >
            <span className="main-panel__power-icon">⏻</span>
          </button>
        </>
      ) : (
        <div className="main-panel__off-state">
          <span className="main-panel__off-time">{currentTime}</span>
          <button
            className="main-panel__power-btn main-panel__power-btn--off"
            onClick={onPowerToggle}
            aria-label="Power"
          >
            <span className="main-panel__power-icon">⏻</span>
          </button>
        </div>
      )}
    </Panel>
  );
}
