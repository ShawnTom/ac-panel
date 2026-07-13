export type PanelType = 'main' | 'room';

export type ACMode = 'cool' | 'heat' | 'wind' | 'auto';

/** 风量运行模式：自动（系统决定档位）/ 手动（用户自己设） */
export type FanMode = 'auto' | 'manual';

export type ThemeName = 'black-gold' | 'gray-white' | 'tech-blue-purple';

export interface Room {
  id: string;
  name: string;
  acTemp: number;        // 空调设定温度
  indoorTemp: number;    // 室内实际温度
  humidity: number;      // 湿度 %
  power: boolean;        // 开关状态
  mode?: ACMode;         // 仅主控有
  /** 风量档 1-5；通风模式下必填 */
  fanSpeed?: number;
  /** 风量运行模式（自动/手动）；通风模式下必填 */
  fanMode?: FanMode;
  /** 是否支持风量显示/调节；true 时主区显示风量控件 */
  fanAdjustable?: boolean;
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
