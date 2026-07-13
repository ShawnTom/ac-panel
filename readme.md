# 智能空调控制面板 — 项目说明文档

> 480×480px 智能家居空调控制面板系统，含前端交互原型和后端 API 预留。

---

## 一、项目概述

本项目为智能家居空调控制面板的原型系统，面板尺寸 **480×480px**，适用于嵌入式触控屏或智能家居中控设备。系统采用前后端分离架构，前端使用 React 18 + TypeScript + Vite 6，后端使用 Express 4 + TypeScript，当前阶段前端使用 Mock 数据独立运行，后端 API 已预留完整接口供后续对接。

### 核心功能

| 功能 | 总控面板 | 房间面板 | 首页 | 设置页 |
|------|:-:|:-:|:-:|:-:|
| 空调模式切换（制冷/制热/通风） | ✅ | ❌ 仅展示 | — | — |
| 温度调节（半圆旋钮，16–30°C） | ✅ | ✅ | — | — |
| 风量调节（通风模式：5 档 + 自动/手动） | ✅ | ✅ | — | — |
| 房间电源开关 | ✅ | ✅ | ✅ 一键启动/关闭全部 | — |
| 主题切换（黑金/灰白/蓝紫） | — | — | — | ✅ |
| 亮度调节（白天 8:00-18:00 / 晚上 18:00-8:00，跨时段 3 秒预览） | — | — | — | ✅ |
| 室内环境监测（温度/湿度/PM2.5/CO2/VOC） | — | — | ✅ | — |
| 总控电源校验（关闭后单独开房间 → toast 提示） | — | ✅ | — | — |
| 滑动导航 | ✅ | ✅ | ✅ | ❌（禁用滑动手势） |
| 覆盖层（150ms opacity 渐变） | — | ✅ | — | ✅ |

---

## 二、技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端框架 | React 18 | 函数组件 + Hooks |
| 类型系统 | TypeScript 5+ | 严格模式（strict: true） |
| 构建工具 | Vite 6 | 开发服务器 + 热更新 |
| 样式方案 | 纯 CSS 变量 | 三套主题通过 `data-theme` 属性切换 |
| 后端框架 | Express 4 | RESTful API |
| 后端语言 | TypeScript | ts-node 运行 |
| API 文档 | Markdown | backend/api.md |
| 部署 | Vercel | GitHub push 自动触发 re-deploy |

---

## 三、项目结构

```
ac-panel/
├── frontend/                      # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── homepanel/         # 首页（环境监测面板）
│   │   │   ├── mainpanel/         # 总控面板
│   │   │   ├── roompanel/         # 房间面板
│   │   │   ├── roomlist/          # 房间列表（负一屏）
│   │   │   ├── temperaturedial/   # 半圆形温度旋钮
│   │   │   ├── fanspeedcontrol/   # 风量调节组件（5 档 + 自动/手动）
│   │   │   ├── globalsettings/    # 全局设置（主题/亮度）
│   │   │   └── shared/            # 共享面板容器
│   │   ├── hooks/
│   │   │   ├── usetheme.ts        # 主题切换
│   │   │   ├── usebrightness.ts   # 亮度自动判断 + 跨时段预览
│   │   │   ├── useswipe.ts        # 滑动手势检测
│   │   │   └── usetoast.ts        # Toast 提示
│   │   ├── themes/
│   │   │   ├── tech-blue-purple.css  # 科技蓝紫主题
│   │   │   ├── black-gold.css        # 尊贵黑金主题
│   │   │   └── gray-white.css        # 极简灰白主题
│   │   ├── types/index.ts         # TypeScript 类型定义（含 FanMode / fanSpeed）
│   │   ├── mock/data.ts           # Mock 数据（含风量字段）
│   │   ├── app.tsx                # 根组件（视图路由 + 总控校验 + 覆盖层）
│   │   ├── app.css                # 全局样式（track + overlay）
│   │   └── main.tsx               # 入口
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── backend/                       # 后端项目
│   ├── src/
│   │   ├── routes/                # Express 路由
│   │   │   ├── rooms.ts
│   │   │   ├── settings.ts
│   │   │   └── system.ts
│   │   ├── controllers/
│   │   ├── data/mockdata.ts
│   │   ├── types/index.ts
│   │   ├── utils/response.ts
│   │   └── index.ts
│   ├── api.md                     # API 文档
│   ├── package.json
│   └── tsconfig.json
├── DELIVERY/                      # 早期交付备份（不含 fanspeedcontrol 等新组件）
└── README.md                      # 本文档
```

---

## 四、前端代码说明

### 4.1 视图架构

系统采用 **横向 track + 覆盖层** 混合架构：

```
横向 track（左/右滑动）：首页 → 总控面板 → 房间列表
覆盖层（直接替换 + 150ms opacity 渐变）：房间详情 / 全局设置
```

- `app.tsx` 作为唯一状态源，管理 `rooms`（房间数组）和 `globalSettings`（全局设置）
- 3 个横向视图同时渲染在 `app__track`（300% 宽）容器中，通过 `translateX` 控制位置（每个视图占 33.3334%）
- `useSwipe` 检测左/右滑手势切换横向视图
- 房间详情 + 全局设置作为**独立覆盖层**（`.app__overlay`）渲染：`position: absolute; inset: 0`，`opacity: 0 → 1` 渐变 150ms（无位移）
- 覆盖层打开时（`overlayView !== null`），`useSwipe` 的 `onSwipeLeft` / `onSwipeRight` 都传 `undefined`，自动禁用横向滑动

> **注意**：房间详情页和设置页都不显示顶部跑马灯（避免视觉冲突），由覆盖层自然遮挡。

### 4.2 核心组件

#### TemperatureDial（温度旋钮）
- **实现方式**：SVG 半圆弧 + Pointer Events
- **交互**：触摸/鼠标拖动，通过 `Math.atan2` 计算角度映射到温度
- **防冲突**：`setPointerCapture` 捕获事件 + `stopPropagation` 阻止冒泡到面板滑动
- **范围**：16–30°C，整数步进
- **视觉**：渐变进度弧 + 刻度线 + 可拖拽旋钮 + 中央大号温度数字

#### FanSpeedControl（风量调节）— 通风模式专用
- **5 个风量档**：1~5 档，垂直细长条（14×40）+ 档位数字
- **运行模式切换**：自动 / 手动 两个 chip
- **手动模式**：用户点击档位直接设置风量
- **自动模式**：风扇持续转动（`autoMode` 维持 `active=true`），5 段条状以"充电"跑马灯形式从 0 累加到 5 循环（2.5s 周期），整体不可交互
- **实现方式**：纯 CSS 关键帧动画 + `:nth-child()` 选择器设置不同 `animation-delay`，避开 `transform: scaleY(0)` 黑屏风险

#### MainPanel（总控面板，原"客厅"）
- 空调模式切换：制冷 / 制热 / 通风（三个胶囊按钮，激活态高亮）
- 温度旋钮调节（制冷/制热模式）或 风量调节（通风模式）
- 当前室内温度、湿度信息卡（所有模式都保留显示）
- 电源开关（胶囊按钮，关机后面板变暗仅显示时钟）
- 设置入口（齿轮图标，**无外圆边框**）

#### RoomPanel（房间面板）
- 温度调节（同总控面板）
- 风量调节（通风模式同步显示）
- 电源开关（受总控电源校验：总控关闭时单独开启 → toast 提示）
- 模式按钮仅展示不可操作（`modeDisabled`），点击弹出 Toast "房间不支持模式调节"
- **header 布局**：返回按钮在最左，房间名 + 时间紧贴返回按钮右侧（间距 12px）

#### HomePanel（首页）
- 实时时间 + 日期
- 室外空气数据（空气指数/湿度/PM2.5）
- 设备名称 + 地点
- 室内平均温度/湿度卡片（**两行布局**：第一行 icon+label，第二行 value，整体居中）
- PM2.5 / CO2 / VOC 三列数据卡
- 一键启动/关闭按钮（开启时图标旋转，反色填充）

#### RoomList（房间列表）
- 两列网格布局
- 过滤掉总控（id='living-room'），仅展示 5 个房间
- 每张卡片：房间名 + 温度 + 圆形电源开关（受总控电源校验）
- 启动态卡片有描边+发光强调
- **header 布局**：返回按钮 + "房间列表"标题 + 右上角设置按钮（齿轮 icon，**无外圆边框**，与总控面板样式一致）

#### GlobalSettings（全局设置）
- 三套主题选择（科技蓝紫/尊贵黑金/极简灰白）
- 亮度调节滑块：
  - 白天（8:00-18:00）/ 晚上（18:00-8:00）独立配置
  - **跨时段调节**：白天调夜间 / 夜间调白天滑块时，临时预览 3 秒，3 秒后自动恢复当前时段真实亮度（不写入持久配置）
  - 预览期间：屏幕亮度实时跟随滑块 + toast 倒计时（"3秒后退出预览" → "2秒后退出预览" → "1秒后退出预览"）
  - 滑块用本地虚拟值显示，3 秒预览结束后滑块回弹到真实配置位置
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
- **白天：8:00-18:00 / 晚上：18:00-8:00**（updated from earlier 6:00-18:00）
- 通过 `#root { filter: brightness(X%) }` 应用亮度
- 最低可读性保护：白天不低于 50%、夜间不低于 30%
- **跨时段预览**：用 `previewBrightness(value)` 临时应用 3 秒后自动恢复，用 `isNightRef` / `configRef` 锁住最新值避免 useEffect 时序问题

### 4.5 TypeScript 类型定义

```typescript
export type ACMode = 'cool' | 'heat' | 'wind' | 'auto';
export type FanMode = 'auto' | 'manual';  // 风量运行模式
export type ThemeName = 'black-gold' | 'gray-white' | 'tech-blue-purple';

export interface Room {
  id: string;
  name: string;
  acTemp: number;        // 空调设定温度
  indoorTemp: number;    // 室内实际温度
  humidity: number;      // 湿度 %
  power: boolean;        // 开关状态
  mode?: ACMode;         // 仅主控有
  fanSpeed?: number;     // 风量档 1-5（通风模式）
  fanMode?: FanMode;     // 风量运行模式
  fanAdjustable?: boolean; // 是否支持风量显示/调节
}

export interface GlobalSettings {
  theme: ThemeName;
  brightness: { day: number; night: number };
  currentMode: ACMode;
  power: boolean;        // 总控电源
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

- 温度范围：16–30°C
- 亮度范围：0–100
- 模式枚举：cool / heat / wind / auto
- 电源类型：boolean
- 非主控房间调用模式更新返回 403

### 5.4 Mock 数据

| 房间 | ID | 默认温度 | 风量 |
|------|----|---------|------|
| 总控 | living-room | 24°C | 3 档 / 手动 |
| 主卧 | master-bedroom | 23°C | 2 档 / 自动 |
| 次卧 | second-bedroom | 25°C | — |
| 书房 | study | 22°C | 1 档 / 手动 |
| 厨房 | kitchen | 26°C | — |
| 儿童房 | kids-room | 24°C | 2 档 / 自动 |

前后端使用统一的房间 ID（`living-room` / `master-bedroom` / `second-bedroom` / `study` / `kitchen` / `kids-room`），确保接入真实 API 后无缝切换。

---

## 六、交互说明

### 6.1 滑动导航

横向 track 视图（3 个）：

| 当前页面 | 左滑（手指右→左） | 右滑（手指左→右） |
|---------|:-:|:-:|
| 首页 | → 总控面板 | — |
| 总控面板 | → 房间列表 | → 首页 |
| 房间列表 | — | → 总控面板 |

覆盖层（房间详情 / 全局设置）：禁用任何滑动手势，只允许用页面内返回按钮退出。

### 6.2 一键启动/关闭

首页右上角按钮：
- **关机状态**：显示"一键启动"，点击后所有房间空调打开 + 总控开启
- **开机状态**：显示"一键关闭"（反色填充），图标旋转，点击后所有房间空调关闭 + 总控关闭

### 6.3 温度旋钮交互

1. 触摸/点击旋钮弧线区域
2. 拖动手指/鼠标沿弧线移动
3. 松开后温度锁定到最近整数值
4. 旋钮区域的事件不会触发面板滑动

### 6.4 风量调节交互（通风模式）

- 5 段细长条 + 数字（1-5），点击其中一段直接设为该档位
- 自动/手动切换 chip 紧贴风量控件下方
- **自动模式**：5 段按"充电"效果从 0 累加到 5 循环（2.5s 周期），风扇持续转动，控件不可交互
- **手动模式**：用户自由点击设置档位，控件可交互

### 6.5 房间列表快捷操作

- 每张卡片右侧有圆形电源按钮，可直接开关房间空调
- 点击按钮不会跳转到房间详情（`stopPropagation`）
- 点击卡片其他区域才进入房间面板

### 6.6 总控电源校验

- 总控（`globalSettings.power`）关闭时，房间列表或房间详情页单独开启任意房间 → toast "请先打开总控开关"
- 关闭动作不受总控限制

### 6.7 亮度跨时段预览

- 当前时段滑块（白天调白天 / 晚上调晚上）→ 直接写入持久配置
- 跨时段滑块（白天调晚上 / 晚上调白天）→ 临时预览 3 秒，3 秒后自动恢复当前时段真实亮度
- 预览期间：
  - 屏幕亮度实时跟随滑块
  - toast 倒计时："3秒后退出预览" → "2秒后退出预览" → "1秒后退出预览"
  - 滑块显示本地虚拟值（不回弹），3 秒预览结束后滑块回弹到真实配置位置
  - 跨时段值**不会**写入持久配置

### 6.8 关机状态

- 总控面板关机：面板变暗（opacity 0.5），仅显示时间和电源按钮
- 房间面板关机：同上，同时受总控电源和房间电源双重控制
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
2. 在 `app.tsx` 中将 `mockRooms` / `mockGlobalSettings` 替换为 API 调用
3. 前后端房间 ID 已统一，可直接对接

### 生产构建

```bash
cd ac-panel/frontend
npm run build      # 输出到 dist/
npm run preview    # 预览构建结果
```

### Vercel 部署

项目通过 Vercel 与 GitHub 仓库关联，每次 `git push origin main` 自动触发 re-deploy。无需手动操作。

---

## 八、后续开发建议

| 优先级 | 事项 | 说明 |
|--------|------|------|
| 高 | 前端 API 服务层 | 创建 `src/api/` 目录，封装 fetch、loading/error 状态 |
| 高 | WebSocket 实时推送 | 实时温度同步，替代轮询 |
| 中 | 后端支持风量字段 | 持久化 fanSpeed / fanMode / fanAdjustable（当前 backend 类型未含） |
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
| `src/app.tsx` | 根组件，横向 track（3 view）+ 覆盖层（room/settings）+ 总控电源校验 + 顶层 toast |
| `src/app.css` | 全局样式，track 横向滑动 + overlay 渐入覆盖 |
| `src/main.tsx` | React 渲染入口 |
| `src/types/index.ts` | TypeScript 类型定义（含 FanMode / fanSpeed 等） |
| `src/mock/data.ts` | 6 个房间 + 全局设置 Mock 数据（含风量字段） |
| `src/components/homepanel/` | 首页（环境监测） |
| `src/components/mainpanel/` | 总控面板（原"客厅"） |
| `src/components/roompanel/` | 房间面板 |
| `src/components/roomlist/` | 房间列表（含右上角设置按钮） |
| `src/components/temperaturedial/` | 半圆形温度旋钮 |
| `src/components/fanspeedcontrol/` | 风量调节（5 档 + 自动/手动 + 充电动画） |
| `src/components/globalsettings/` | 全局设置（主题/亮度 + 跨时段预览） |
| `src/components/shared/` | 共享面板容器 |
| `src/hooks/usetheme.ts` | 主题切换 |
| `src/hooks/usebrightness.ts` | 亮度自动判断 + 跨时段预览（ref 锁值） |
| `src/hooks/useswipe.ts` | 滑动手势（支持 callback undefined 禁用） |
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

---

## 十、近期更新日志

- ✅ 总控面板标题由"客厅"改为"总控"（mock data `name: '总控'`）
- ✅ 新增 `FanSpeedControl` 组件（5 档 + 自动/手动 + 充电动画）
- ✅ 通风模式：主区显示风量调节组件替代温度旋钮
- ✅ 通风模式：主控切到通风时同步所有房间进入风量可调状态
- ✅ 新增 `FanMode` / `fanSpeed` / `fanAdjustable` 字段
- ✅ 主页平均温度/湿度卡片改为两行布局（icon+label / value，整体居中）
- ✅ 总控关闭时单独开启房间 → toast "请先打开总控开关"（房间列表 + 房间详情页都拦截）
- ✅ 亮度系统改为 8:00-18:00 白天 / 18:00-8:00 晚上
- ✅ 亮度跨时段调节 3 秒预览 + toast 倒计时（`useBrightness` 用 ref 锁住最新值）
- ✅ 主页 + 房间列表右上角统一设置按钮（无外圆边框）
- ✅ 房间详情页 header：返回按钮在最左 + 房间名+时间紧贴右侧 12px
- ✅ 房间详情页 + 设置页隐藏顶部跑马灯
- ✅ 设置页禁用滑动手势（`onSwipeLeft` / `onSwipeRight` 传 `undefined`）
- ✅ 充电动画从 inline style + transform 改为纯 CSS `:nth-child()` + box-shadow 动画（修复黑屏问题）
- ✅ **视图架构重构**：横向 track 只承载 3 个视图（首页/主控/房间列表）；房间详情 + 全局设置改为**覆盖层**（直接替换 + 150ms opacity 渐变，无位移）
- ✅ 主页改版：一键启动按钮移到页面最下方（底部居中），右上角改为全局设置按钮
- ✅ 房间列表微调：主页 icon 下移 2px（`transform: translateY(2px)`），房间卡片网格下移 8px（`margin-top: 8px`）
