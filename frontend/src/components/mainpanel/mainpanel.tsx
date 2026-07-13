import { useState, useEffect, type ReactElement } from 'react';
import type { Room, GlobalSettings, ACMode, FanMode } from '../../types';
import { Panel } from '../shared/panel';
import { TemperatureDial } from '../temperaturedial/temperaturedial';
import { FanSpeedControl } from '../fanspeedcontrol/fanspeedcontrol';
import './mainpanel.css';

interface MainPanelProps {
  room: Room;
  settings: GlobalSettings;
  onModeChange: (mode: ACMode) => void;
  onPowerToggle: () => void;
  onSettingsClick: () => void;
  onRoomUpdate: (room: Room) => void;
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

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function MainPanel({
  room,
  settings,
  onModeChange,
  onPowerToggle,
  onSettingsClick,
  onRoomUpdate,
}: MainPanelProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [period, setPeriod] = useState('');

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

  const handleFanSpeedChange = (speed: number) => {
    onRoomUpdate({ ...room, fanSpeed: speed });
  };

  const handleFanModeChange = (mode: FanMode) => {
    onRoomUpdate({ ...room, fanMode: mode });
  };

  const isPoweredOn = settings.power && room.power;

  // 关闭时显示当前模式（默认 cool），打开时切换模式只在前三个之间选
  const activeMode: ModeKey =
    settings.currentMode === 'auto' ? 'cool' : (settings.currentMode as ModeKey);

  // 通风模式下主区显示风量档/自动-手动；其他模式保留温度调节
  const isVentMode = activeMode === 'wind';
  const fanSpeed = room.fanSpeed ?? 1;
  const fanMode: FanMode = room.fanMode ?? 'manual';
  const fanAdjustable = room.fanAdjustable !== false; // 默认 true

  return (
    <Panel className={`main-panel ${!isPoweredOn ? 'main-panel--off' : ''}`}>
      {/* Header — 房间名 + 时间并列：房间名左、时间右 */}
      <div className="main-panel__header">
        <div className="main-panel__room-info">
          <span className="main-panel__room-name">{room.name}</span>
          <span className={`main-panel__time ${!isPoweredOn ? 'main-panel__time--dim' : ''}`}>
            {currentTime}
          </span>
        </div>
        <button
          className="main-panel__settings-btn"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      </div>

      {/* Center: dial ↔ fan-dial ↔ off clock 三态切换 */}
      <div className="main-panel__stage">
        {/* 通风模式：风量拨盘（半圆+5 段+拖拽）；自动模式禁用 */}
        <div
          className={`main-panel__fan-stage ${(isPoweredOn && isVentMode && fanAdjustable) ? '' : 'main-panel__fan-stage--hidden'}`}
          aria-hidden={!(isPoweredOn && isVentMode && fanAdjustable)}
        >
          <FanSpeedControl
            value={fanSpeed}
            onChange={handleFanSpeedChange}
            autoMode={fanMode === 'auto'}
            disabled={!isPoweredOn}
          />
        </div>

        {/* 制冷/制热：温度旋钮 */}
        <div
          className={`main-panel__dial-wrapper ${(isPoweredOn && !isVentMode) ? '' : 'main-panel__dial-wrapper--hidden'}`}
          aria-hidden={!(isPoweredOn && !isVentMode)}
        >
          <TemperatureDial
            value={room.acTemp}
            onChange={handleTempChange}
            min={16}
            max={30}
            disabled={!isPoweredOn}
          />
        </div>

        {/* 关闭时显示当前时间 */}
        <div
          className={`main-panel__clock ${!isPoweredOn ? 'main-panel__clock--visible' : ''}`}
          aria-hidden={isPoweredOn}
        >
          <span className="main-panel__clock-time">{currentTime}</span>
          <span className="main-panel__clock-period">{period}</span>
          <span className="main-panel__clock-hint">轻触开关开启空调</span>
        </div>
      </div>

      {/* 当前温度 / 当前湿度 信息卡 — 开关和温度调节中间 */}
      {isPoweredOn && !isVentMode && (
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

      {/* 通风模式 + 手动 + 开机时：自动/手动 切换
          风量值由半圆 dial 直接交互，不需要下方独立 progress 条 */}
      {isPoweredOn && isVentMode && fanAdjustable && (
        <div className="main-panel__mode-toggle-row">
          <button
            className={`main-panel__mode-toggle ${fanMode === 'auto' ? 'is-active' : ''}`}
            onClick={() => handleFanModeChange('auto')}
            aria-pressed={fanMode === 'auto'}
          >
            自动
          </button>
          <button
            className={`main-panel__mode-toggle ${fanMode === 'manual' ? 'is-active' : ''}`}
            onClick={() => handleFanModeChange('manual')}
            aria-pressed={fanMode === 'manual'}
          >
            手动
          </button>
        </div>
      )}

      {/* Bottom unified control: collapsed = single centered power pill;
          expanded = power pill + 3 mode chips */}
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
              className={`main-panel__mode-chip ${activeMode === mode ? 'main-panel__mode-chip--active' : ''}`}
              onClick={() => onModeChange(mode)}
              data-mode={mode}
              aria-label={MODE_ICONS[mode].label}
              aria-pressed={activeMode === mode}
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
