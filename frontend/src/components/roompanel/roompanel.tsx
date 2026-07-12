import { useState, useEffect, type ReactElement } from 'react';
import type { Room, GlobalSettings, ACMode } from '../../types';
import { Panel } from '../shared/panel';
import { TemperatureDial } from '../temperaturedial/temperaturedial';
import { useToast } from '../../hooks/usetoast';
import '../../hooks/toast.css';
import '../mainpanel/mainpanel.css';
import './roompanel.css';

interface RoomPanelProps {
  room: Room;
  settings: GlobalSettings;
  globalPower: boolean;
  onBack: () => void;
  onModeChange: (mode: ACMode) => void;
  onPowerToggle: () => void;
  onRoomUpdate: (room: Room) => void;
  modeDisabled?: boolean;
}

type ModeKey = Exclude<ACMode, 'auto'>;

const MODE_ICONS: Record<ModeKey, { label: string; icon: ReactElement }> = {
  cool: {
    label: '制冷',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
      </svg>
    ),
  },
  heat: {
    label: '制热',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  wind: {
    label: '通风',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
    ),
  },
};

const POWER_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function RoomPanel({
  room,
  settings,
  globalPower,
  onBack,
  onModeChange,
  onPowerToggle,
  onRoomUpdate,
  modeDisabled = false,
}: RoomPanelProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [period, setPeriod] = useState('');
  const { toast, showToast } = useToast();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
      setPeriod(now.getHours() >= 12 ? 'PM' : 'AM');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTempChange = (temp: number) => {
    onRoomUpdate({ ...room, acTemp: temp });
  };

  const handleModeClick = (mode: ModeKey) => {
    if (modeDisabled) {
      showToast('房间不支持模式调节');
      return;
    }
    onModeChange(mode);
  };

  const isPoweredOn = globalPower && room.power;

  const activeMode: ModeKey =
    settings.currentMode === 'auto' ? 'cool' : (settings.currentMode as ModeKey);

  return (
    <Panel className={`room-panel main-panel ${!isPoweredOn ? 'main-panel--off' : ''}`}>
      {/* Toast 提示 */}
      <div className={`toast ${toast.visible ? 'toast--visible' : ''}`}>
        {toast.message}
      </div>

      {/* Header */}
      <div className="main-panel__header">
        <div className="main-panel__room-info">
          <span className="main-panel__room-name">{room.name}</span>
          <span className={`main-panel__time ${!isPoweredOn ? 'main-panel__time--dim' : ''}`}>
            {currentTime}
          </span>
        </div>
        <button className="room-panel__back-btn" onClick={onBack} aria-label="Back">
          <BackArrowIcon />
        </button>
      </div>

      {/* Center stage */}
      <div className="main-panel__stage">
        <div
          className={`main-panel__dial-wrapper ${!isPoweredOn ? 'main-panel__dial-wrapper--hidden' : ''}`}
          aria-hidden={!isPoweredOn}
        >
          <TemperatureDial
            value={room.acTemp}
            onChange={handleTempChange}
            min={16}
            max={30}
            disabled={!isPoweredOn}
          />
        </div>

        <div
          className={`main-panel__clock ${!isPoweredOn ? 'main-panel__clock--visible' : ''}`}
          aria-hidden={isPoweredOn}
        >
          <span className="main-panel__clock-time">{currentTime}</span>
          <span className="main-panel__clock-period">{period}</span>
          <span className="main-panel__clock-hint">轻触开关开启空调</span>
        </div>
      </div>

      {/* 当前温度 / 当前湿度 信息卡 */}
      {isPoweredOn && (
        <div className="main-panel__info-row">
          <div className="main-panel__info-card">
            <span className="main-panel__info-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </span>
            <div className="main-panel__info-body">
              <span className="main-panel__info-label">当前温度</span>
              <span className="main-panel__info-value">{room.indoorTemp}°C</span>
            </div>
          </div>
          <div className="main-panel__info-card">
            <span className="main-panel__info-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </span>
            <div className="main-panel__info-body">
              <span className="main-panel__info-label">当前湿度</span>
              <span className="main-panel__info-value">{room.humidity}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom unified control */}
      <div
        className={`main-panel__control ${isPoweredOn ? 'main-panel__control--on' : 'main-panel__control--off'}`}
      >
        <button
          className="main-panel__power-pill"
          onClick={onPowerToggle}
          aria-label={isPoweredOn ? 'Turn off' : 'Turn on'}
        >
          <span className="main-panel__power-pill-icon">{POWER_ICON}</span>
          <span className="main-panel__power-pill-label">
            {isPoweredOn ? 'On' : 'Off'}
          </span>
        </button>

        <div
          className={`main-panel__mode-cluster ${!isPoweredOn ? 'main-panel__mode-cluster--hidden' : ''}`}
          aria-hidden={!isPoweredOn}
        >
          {(Object.keys(MODE_ICONS) as ModeKey[]).map((mode) => (
            <button
              key={mode}
              className={`main-panel__mode-chip ${activeMode === mode ? 'main-panel__mode-chip--active' : ''} ${modeDisabled ? 'main-panel__mode-chip--readonly' : ''}`}
              onClick={() => handleModeClick(mode)}
              aria-label={MODE_ICONS[mode].label}
              aria-pressed={activeMode === mode}
              aria-disabled={modeDisabled}
              tabIndex={isPoweredOn ? 0 : -1}
            >
              <span className="main-panel__mode-chip-icon">
                {MODE_ICONS[mode].icon}
              </span>
              <span className="main-panel__mode-chip-label">
                {MODE_ICONS[mode].label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
