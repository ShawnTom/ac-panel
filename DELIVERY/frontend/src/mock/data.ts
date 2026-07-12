import type { Room, GlobalSettings } from '../types';

export const mockRooms: Room[] = [
  {
    id: 'living-room',
    name: '客厅',
    acTemp: 24,
    indoorTemp: 26,
    humidity: 55,
    power: true,
    mode: 'cool',
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

export const mockGlobalSettings: GlobalSettings = {
  theme: 'tech-blue-purple',
  brightness: {
    day: 90,
    night: 50,
  },
  currentMode: 'cool',
  power: true,
};
