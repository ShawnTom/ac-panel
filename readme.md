# 智能空调控制面板 — 项目说明文档

> 480×480px 智能家居空调控制面板系统，含前端交互原型和后端 API 预留。

---

## 一、项目概述

本项目为智能家居空调控制面板的原型系统，面板尺寸 **480×480px**，适用于嵌入式触控屏或智能家居中控设备。系统采用前后端分离架构，前端使用 React + TypeScript + Vite，后端使用 Express + TypeScript，当前阶段前端使用 Mock 数据独立运行，后端 API 已预留完整接口供后续对接。

### 核心功能

| 功能 | 主控面板（客厅） | 房间面板 | 首页 |
|------|:-:|:-:|:-:|
| 空调模式切换（制冷/制热/送风） | ✅ 可操作 | ❌ 仅展示 | — |
| 温度调节（半圆旋钮，16–30°C） | ✅ | ✅ | — |
| 开关机 | ✅ | ✅ | ✅ 一键启动/关闭全部 |
| 主题切换（黑金/灰白/蓝紫） | ✅ 设置页 | — | — |
| 亮度调节（白天/夜间） | ✅ 设置页 | — | — |
| 室内环境监测 | — | — | ✅ 温度/湿度/PM2.5/CO2/VOC |
| 滑动导航 | ✅ | ✅ | ✅ |

---

## 二、技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端框架 | React 18 | 函数组件 + Hooks |
| 类型系统 | TypeScript 5+ | 严格模式（strict: true） |
| 构建工具 | Vite 6 | 开发服务器 + 热更新 |
| 样式方案 | 纯 CSS 变量 | 三套主题通过 data-theme 属性切换 |
| 后端框架 | Express 4 | RESTful API |
| 后端语言 | TypeScript | ts-node 运行 |
| API 文档 | Markdown | backend/api.md |

---

## 三、项目结构

```
ac-panel/
├── frontend/                      # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── homepanel/         # 首页（环境监测面板）
│   │   │   ├── mainpanel/         # 主控面板（客厅）
│   │   │   ├── roompanel/         # 房间面板
│   │   │   ├── roomlist/          # 房间列表（负一屏）
│   │   │   ├── temperaturedial/   # 半圆形温度旋钮
│   │   │   ├── globalsettings/    # 全局设置（主题/亮度）
│   │   │   └── shared/            # 共享面板容器
│   │   ├── hooks/
│   │   │   ├── usetheme.ts        # 主题切换
│   │   │   ├── usebrightness.ts   # 亮度自动判断（白天/夜间）
│   │   │   ├── useswipe.ts        # 滑动手势检测
│   │   │   └── usetoast.ts        # Toast 提示
│   │   ├── themes/
│   │   │   ├── tech-blue-purple.css  # 科技蓝紫主题
│   │   │   ├── black-gold.css        # 尊贵黑金主题
│   │   │   └── gray-white.css        # 极简灰白主题
│   │   ├── types/index.ts         # TypeScript 类型定义
│   │   ├── mock/data.ts           # Mock 数据
│   │   ├── App.tsx                # 根组件（视图路由 + 状态管理）
│   │   ├── App.css                # 全局样式
│   │   └── main.tsx               # 入口
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── backend/                       # 后端项目
│   ├── src/
│   │   ├── routes/                # Express 路由
│   │   │   ├── rooms.ts           # 房间相关路由
│   │   │   ├── settings.ts        # 全局设置路由
│   │   │   └── system.ts          # 系统路由（健康检查/时间）
│   │   ├── controllers/           # 控制器（含输入验证）
│   │   │   ├── roomcontroller.ts
│   │   │   ├── settingscontroller.ts
│   │   │   └── systemcontroller.ts
│   │   ├── data/mockdata.ts       # Mock 数据
│   │   ├── types/index.ts         # 类型定义
│   │   ├── utils/response.ts      # 统一响应格式
│   │   └── index.ts               # 入口
│   ├── api.md                     # API 文档
│   ├── package.json
│   └── tsconfig.json
└── README.md                      # 本文档
```

---

## 四、前端代码说明

### 4.1 视图架构

系统采用 **track + translateX** 滑动架构，5 个视图横向排列，通过 `translateX` 偏移实现平滑滑动切换：

```
视图顺序：首页 → 主控面板 → 房间列表 → 房间面板 → 设置页
滑动方向：左滑前进，右滑后退
```

- `App.tsx` 作为唯一状态源，管理 `rooms`（房间数组）和 `globalSettings`（全局设置）
- 所有视图同时渲染在 `app__track` 容器中，通过 CSS `transform` 控制位置
- 每个视图占 `20%` 宽度（100% / 5），track 总宽 `500%`

### 4.2 核心组件

#### TemperatureDial（温度旋钮）
- **实现方式**：SVG 半圆弧 + Pointer Events
- **交互**：触摸/鼠标拖动，通过 `Math.atan2` 计算角度映射到温度
- **防冲突**：`setPointerCapture` 捕获事件 + `stopPropagation` 阻止冒泡到面板滑动
- **范围**：16–30°C，整数步进
- **视觉**：渐变进度弧 + 刻度线 + 可拖拽旋钮 + 中央大号温度数字

#### MainPanel（主控面板）
- 空调模式切换：制冷 / 制热 / 通风（三个胶囊按钮，激活态高亮）
- 温度旋钮调节
- 当前室内温度、湿度信息卡
- 电源开关（胶囊按钮，关机后面板变暗仅显示时钟）
- 设置入口（齿轮图标）

#### RoomPanel（房间面板）
- 温度调节（同主控）
- 电源开关
- 模式按钮仅展示不可操作（`modeDisabled`），点击弹出 Toast "房间不支持模式调节"
- 受全局电源和房间电源双重控制

#### HomePanel（首页）
- 实时时间 + 日期
- 室外空气数据（空气指数/湿度/PM2.5）
- 设备名称 + 地点
- 室内平均温度/湿度（计算所有房间平均值）
- PM2.5 / CO2 / VOC 三列数据卡
- 一键启动/关闭按钮（开启时图标旋转，反色填充）

#### RoomList（房间列表）
- 两列网格布局
- 过滤掉客厅（主控），仅展示 5 个房间
- 每张卡片：房间名 + 温度 + 圆形电源开关（可直接开关不需进入详情）
- 启动态卡片有描边+发光强调

#### GlobalSettings（全局设置）
- 三套主题选择（科技蓝紫/尊贵黑金/极简灰白）
- 白天/夜间亮度滑块（06:00–18:00 自动判断）
- 系统状态显示

### 4.3 主题系统

三套主题通过 CSS 变量 + `data-theme` 属性实现：

```css
[data-theme="tech-blue-purple"] { --bg-primary: #07091a; --accent-primary: #6c5ce7; ... }
[data-theme="black-gold"]       { --bg-primary: #0a0a0a; --accent-primary: #D4AF37; ... }
[data-theme="gray-white"]       { --bg-primary: #fafafa; --accent-primary: #1a1a1a; ... }
```

切换时通过 `document.documentElement.setAttribute('data-theme', theme)` 修改，所有元素通过 `0.35s transition` 平滑过渡。所有颜色使用 CSS 变量，无硬编码色值。

### 4.4 亮度系统

- `useBrightness` hook 每分钟检测当前时间
- 06:00–18:00 为白天，18:00–06:00 为夜间
- 通过 `#root { filter: brightness(X%) }` 应用亮度
- 用户可在设置页分别调整白天和夜间亮度值

### 4.5 TypeScript 类型定义

```typescript
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
  brightness: { day: number; night: number };
  currentMode: ACMode;
  power: boolean;
}
```

---

## 五、后端代码说明

### 5.1 API 接口一览

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | /api/rooms | 获取所有房间 | — |
| GET | /api/rooms/:id | 获取单个房间 | — |
| PUT | /api/rooms/:id | 更新房间（温度/电源） | `{ acTemp?, power? }` |
| PUT | /api/rooms/:id/mode | 更新空调模式（仅主控） | `{ mode }` |
| GET | /api/settings | 获取全局设置 | — |
| PUT | /api/settings | 更新全局设置 | `{ theme?, brightness? }` |
| PUT | /api/settings/mode | 更新主控模式 | `{ mode }` |
| GET | /api/health | 健康检查 | — |
| GET | /api/time | 获取服务器时间 | — |

### 5.2 统一响应格式

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": { ... }
}
```

错误时：`code` 非 0，`msg` 包含错误信息，HTTP 状态码对应错误类型。

### 5.3 输入验证

- 温度范围：16–32°C
- 亮度范围：0–100
- 模式枚举：cool / heat / wind / auto
- 电源类型：boolean
- 非主控房间调用模式更新返回 403

### 5.4 Mock 数据

| 房间 | ID | 默认温度 |
|------|----|---------|
| 客厅（主控） | living-room | 24°C |
| 主卧 | master-bedroom | 23°C |
| 次卧 | second-bedroom | 25°C |
| 书房 | study | 22°C |
| 厨房 | kitchen | 26°C |
| 儿童房 | kids-room | 24°C |

前后端使用统一的房间 ID，确保接入真实 API 后无缝切换。

---

## 六、交互说明

### 6.1 滑动导航

| 当前页面 | 左滑（手指右→左） | 右滑（手指左→右） |
|---------|:-:|:-:|
| 首页 | → 主控面板 | — |
| 主控面板 | → 房间列表 | → 首页 |
| 房间列表 | — | → 主控面板 |
| 房间面板 | — | → 房间列表 |
| 设置页 | — | → 主控面板 |

### 6.2 一键启动/关闭

首页右上角按钮：
- **关机状态**：显示"一键启动"，点击后所有房间空调打开
- **开机状态**：显示"一键关闭"（反色填充），图标旋转，点击后所有房间空调关闭

### 6.3 温度旋钮交互

1. 触摸/点击旋钮弧线区域
2. 拖动手指/鼠标沿弧线移动
3. 松开后温度锁定到最近整数值
4. 旋钮区域的事件不会触发面板滑动

### 6.4 房间列表快捷操作

- 每张卡片右侧有圆形电源按钮，可直接开关房间空调
- 点击按钮不会跳转到房间详情（`stopPropagation`）
- 点击卡片其他区域才进入房间面板

### 6.5 关机状态

- 主控面板关机：面板变暗（opacity 0.5），仅显示时间和电源按钮
- 房间面板关机：同上，同时受全局电源和房间电源控制
- 首页：关机后不变暗，环境数据正常显示

---

## 七、本地部署预览

### 环境要求

- Node.js 18+
- npm 或 yarn

### 前端启动

```bash
cd ac-panel/frontend
npm install
npm run dev
```

启动后访问终端显示的地址（通常为 http://localhost:5173）。

> **注意**：不能直接用浏览器打开 `index.html` 文件，必须通过 `npm run dev` 启动开发服务器，因为 Vite 项目使用 ES 模块，`file://` 协议下无法解析。

### 后端启动

```bash
cd ac-panel/backend
npm install
npm run dev
```

后端服务启动在 http://localhost:3001，可访问 http://localhost:3001/api/health 验证。

### 前端对接后端

当前前端使用 `src/mock/data.ts` 中的 Mock 数据。后续对接真实 API 时：

1. 创建 `src/api/` 目录，封装 fetch 调用
2. 在 `App.tsx` 中将 `mockRooms` / `mockGlobalSettings` 替换为 API 调用
3. 前后端房间 ID 已统一，可直接对接

### 生产构建

```bash
cd ac-panel/frontend
npm run build      # 输出到 dist/
npm run preview    # 预览构建结果
```

---

## 八、后续开发建议

| 优先级 | 事项 | 说明 |
|--------|------|------|
| 高 | 前端 API 服务层 | 创建 `src/api/` 目录，封装 fetch、loading/error 状态 |
| 高 | WebSocket 实时推送 | 实时温度同步，替代轮询 |
| 中 | 用户认证 | JWT/Session 中间件 |
| 中 | 数据库持久化 | 替换内存 Mock 数据 |
| 中 | 触摸事件调优 | 实际设备测试旋钮与面板滑动的边界 |
| 低 | 响应式适配 | 小屏幕设备的缩放处理 |
| 低 | 单元测试 | 前端组件测试 + 后端接口测试 |

---

## 九、文件清单

### 前端源文件

| 文件 | 说明 |
|------|------|
| `src/App.tsx` | 根组件，视图路由 + 全局状态管理 |
| `src/App.css` | 全局样式，track 滑动容器 |
| `src/main.tsx` | React 渲染入口 |
| `src/types/index.ts` | TypeScript 类型定义 |
| `src/mock/data.ts` | 6 个房间 + 全局设置 Mock 数据 |
| `src/components/homepanel/` | 首页（环境监测） |
| `src/components/mainpanel/` | 主控面板（客厅） |
| `src/components/roompanel/` | 房间面板 |
| `src/components/roomlist/` | 房间列表 |
| `src/components/temperaturedial/` | 半圆形温度旋钮 |
| `src/components/globalsettings/` | 全局设置 |
| `src/components/shared/` | 共享面板容器 |
| `src/hooks/usetheme.ts` | 主题切换 |
| `src/hooks/usebrightness.ts` | 亮度自动判断 |
| `src/hooks/useswipe.ts` | 滑动手势 |
| `src/hooks/usetoast.ts` | Toast 提示 |
| `src/themes/*.css` | 三套主题 CSS 变量 |

### 后端源文件

| 文件 | 说明 |
|------|------|
| `src/index.ts` | Express 入口 |
| `src/routes/*.ts` | 路由定义 |
| `src/controllers/*.ts` | 控制器 + 输入验证 |
| `src/data/mockdata.ts` | Mock 数据 |
| `src/types/index.ts` | 类型定义 |
| `src/utils/response.ts` | 统一响应格式 |
| `api.md` | API 文档 |
