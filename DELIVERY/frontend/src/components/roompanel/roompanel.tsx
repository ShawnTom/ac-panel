import { useState, useEffect } from 'react';
import type { Room } from '../../types';
import { Panel } from '../shared/panel';
import { TemperatureDial } from '../temperaturedial/temperaturedial';
import './roompanel.css';

interface RoomPanelProps {
  room: Room;
  globalPower: boolean;
  onBack: () => void;
  onRoomUpdate: (room: Room) => void;
}

export function RoomPanel({ room, globalPower, onBack, onRoomUpdate }: RoomPanelProps) {
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

  const handlePowerToggle = () => {
    onRoomUpdate({ ...room, power: !room.power });
  };

  // 房间面板同时受全局电源和房间电源控制
  const isPoweredOn = globalPower && room.power;

  return (
    <Panel className={`room-panel ${!isPoweredOn ? 'room-panel--off' : ''}`}>
      {/* Header */}
      <div className="room-panel__header">
        <div className="room-panel__room-info">
          <span className="room-panel__room-name">{room.name}</span>
          <span className="room-panel__time">{currentTime}</span>
        </div>
        <button className="room-panel__back-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
      </div>

      {isPoweredOn ? (
        <>
          {/* Temperature Dial */}
          <div className="room-panel__dial-wrapper">
            <TemperatureDial
              value={room.acTemp}
              onChange={handleTempChange}
              min={16}
              max={30}
            />
          </div>

          {/* Info row */}
          <div className="room-panel__info-row">
            <div className="room-panel__info-item">
              <span className="room-panel__info-label">室内温度</span>
              <span className="room-panel__info-value">{room.indoorTemp}°C</span>
            </div>
            <div className="room-panel__info-divider" />
            <div className="room-panel__info-item">
              <span className="room-panel__info-label">湿度</span>
              <span className="room-panel__info-value">{room.humidity}%</span>
            </div>
          </div>

          {/* Power button */}
          <button
            className="room-panel__power-btn"
            onClick={handlePowerToggle}
            aria-label="Power"
          >
            <span className="room-panel__power-icon">⏻</span>
          </button>
        </>
      ) : (
        <div className="room-panel__off-state">
          <span className="room-panel__off-time">{currentTime}</span>
          <button
            className="room-panel__power-btn room-panel__power-btn--off"
            onClick={handlePowerToggle}
            aria-label="Power"
          >
            <span className="room-panel__power-icon">⏻</span>
          </button>
        </div>
      )}
    </Panel>
  );
}
