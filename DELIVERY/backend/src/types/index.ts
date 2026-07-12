// 空调模式
export type ACMode = 'cool' | 'heat' | 'wind' | 'auto';

// 主题名称
export type ThemeName = 'black-gold' | 'gray-white' | 'tech-blue-purple';

// 房间模型
export interface Room {
  id: string;
  name: string;
  acTemp: number;       // 空调设定温度
  indoorTemp: number;   // 室内实际温度
  humidity: number;     // 湿度百分比
  power: boolean;       // 空调电源
  mode?: ACMode;        // 空调模式（仅主控房间有）
}

// 全局设置模型
export interface GlobalSettings {
  theme: ThemeName;
  brightness: {
    day: number;    // 白天亮度 0-100
    night: number;  // 夜间亮度 0-100
  };
  currentMode: ACMode;  // 主控空调当前模式
  power: boolean;        // 主控电源状态
}

// 统一响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// 更新房间的请求体
export interface UpdateRoomBody {
  acTemp?: number;
  power?: boolean;
}

// 更新空调模式的请求体
export interface UpdateModeBody {
  mode: ACMode;
}

// 更新全局设置的请求体
export interface UpdateSettingsBody {
  theme?: ThemeName;
  brightness?: {
    day?: number;
    night?: number;
  };
}
