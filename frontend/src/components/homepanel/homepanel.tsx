import { useState, useEffect } from 'react';
import type { Room, GlobalSettings } from '../../types';
import { Panel } from '../shared/panel';
import './homepanel.css';

interface HomePanelProps {
  rooms: Room[];
  settings: GlobalSettings;
  onPowerToggle: () => void;
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PowerIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? 'home-panel__power-icon--spin' : ''}
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function TempIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

export function HomePanel({ rooms, settings, onPowerToggle }: HomePanelProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
      const y = now.getFullYear();
      const mo = now.getMonth() + 1;
      const d = now.getDate();
      setCurrentDate(`${y}年${mo}月${d}日`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const avgTemp = rooms.length > 0
    ? Math.round(rooms.reduce((sum, r) => sum + r.indoorTemp, 0) / rooms.length * 10) / 10
    : 0;
  const avgHumidity = rooms.length > 0
    ? Math.round(rooms.reduce((sum, r) => sum + r.humidity, 0) / rooms.length)
    : 0;

  const outdoor = { airIndex: '优', humidity: 88, pm25: 21 };
  const indoorAir = { pm25: 0, co2: 0, voc: 0 };
  const isPoweredOn = settings.power;

  return (
    <Panel className="home-panel">
      <div className="home-panel__top-bar">
        <div className="home-panel__time-block">
          <span className="home-panel__time">{currentTime}</span>
          <span className="home-panel__date">{currentDate}</span>
        </div>
        <button
          className={`home-panel__master-power ${isPoweredOn ? 'home-panel__master-power--on' : 'home-panel__master-power--off'}`}
          onClick={onPowerToggle}
          aria-label={isPoweredOn ? '一键关闭' : '一键启动'}
        >
          <PowerIcon spinning={isPoweredOn} />
          <span className="home-panel__master-power-label">
            {isPoweredOn ? '一键关闭' : '一键启动'}
          </span>
        </button>
      </div>

      <div className="home-panel__outdoor">
        <span className="home-panel__outdoor-text">
          室外空气指数 {outdoor.airIndex} | 湿度 {outdoor.humidity}% | PM2.5 {outdoor.pm25}μg/m³
        </span>
      </div>

      <div className="home-panel__device">
        <span className="home-panel__location">
          <span className="home-panel__location-icon"><LocationIcon /></span>
          <span className="home-panel__location-name">上海</span>
        </span>
        <span className="home-panel__device-label">设备名称：</span>
        <span className="home-panel__device-name">海上景庭</span>
      </div>

      <div className="home-panel__cards">
        <div className="home-panel__card-row">
          <div className="home-panel__data-card home-panel__data-card--inline">
            <span className="home-panel__data-icon"><TempIcon /></span>
            <span className="home-panel__data-label">平均温度</span>
            <span className="home-panel__data-value">{avgTemp}°C</span>
          </div>
          <div className="home-panel__data-card home-panel__data-card--inline">
            <span className="home-panel__data-icon"><HumidityIcon /></span>
            <span className="home-panel__data-label">平均湿度</span>
            <span className="home-panel__data-value">{avgHumidity}%</span>
          </div>
        </div>

        <div className="home-panel__data-card home-panel__data-card--wide">
          <div className="home-panel__air-col">
            <span className="home-panel__air-label">PM2.5</span>
            <span className="home-panel__air-value">{indoorAir.pm25} μg/m³</span>
          </div>
          <div className="home-panel__air-divider" />
          <div className="home-panel__air-col">
            <span className="home-panel__air-label">CO2</span>
            <span className="home-panel__air-value">{indoorAir.co2} ppm</span>
          </div>
          <div className="home-panel__air-divider" />
          <div className="home-panel__air-col">
            <span className="home-panel__air-label">VOC</span>
            <span className="home-panel__air-value">{indoorAir.voc} 级别</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
