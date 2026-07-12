export type PanelType = 'main' | 'room';

export type ACMode = 'cool' | 'heat' | 'wind' | 'auto';

export type ThemeName = 'black-gold' | 'gray-white' | 'tech-blue-purple';

export interface Room {
  id: string;
  name: string;
  acTemp: number;        // 空调设定温度
  indoorTemp: number;    // 室内实际温度
  humidity: number;      // 湿度 %
  power: boolean;        // 开关状态
  mode?: ACMode;         // 仅主控有
}

export interface GlobalSettings {
  theme: ThemeName;
  brightness: {
    day: number;    // 白天亮度 0-100
    night: number;  // 晚上亮度 0-100
  };
  currentMode: ACMode;
  power: boolean;
}
