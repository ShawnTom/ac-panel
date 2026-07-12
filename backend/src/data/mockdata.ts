import type { Room, GlobalSettings } from '../types';

// 主控房间 ID
export const MASTER_ROOM_ID = 'living-room';

// 初始化 6 个房间的 Mock 数据
export const rooms: Room[] = [
  {
    id: 'living-room',
    name: '客厅',
    acTemp: 24,
    indoorTemp: 26,
    humidity: 55,
    power: true,
    mode: 'cool',  // 主控房间有独立模式
  },
  {
    id: 'master-bedroom',
    name: '主卧',
    acTemp: 23,
    indoorTemp: 25,
    humidity: 50,
    power: true,
  },
  {
    id: 'second-bedroom',
    name: '次卧',
    acTemp: 25,
    indoorTemp: 27,
    humidity: 58,
    power: false,
  },
  {
    id: 'study',
    name: '书房',
    acTemp: 22,
    indoorTemp: 24,
    humidity: 48,
    power: true,
  },
  {
    id: 'kitchen',
    name: '厨房',
    acTemp: 26,
    indoorTemp: 30,
    humidity: 65,
    power: false,
  },
  {
    id: 'kids-room',
    name: '儿童房',
    acTemp: 24,
    indoorTemp: 25,
    humidity: 52,
    power: true,
  },
];

// 全局设置 Mock 数据
export const globalSettings: GlobalSettings = {
  theme: 'tech-blue-purple',
  brightness: {
    day: 90,
    night: 50,
  },
  currentMode: 'cool',
  power: true,
};
