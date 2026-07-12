# 智能空调控制面板

480×480px 智能家居空调控制面板，含主控面板和房间面板，支持三种主题、亮度调节、半圆形温度旋钮交互。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite |
| 后端 | Node.js + Express + TypeScript |
| 样式 | 纯 CSS 变量驱动主题切换 |

## 快速启动

### 前端

```bash
cd ac-panel/frontend
npm install
npm run dev
```

访问 http://localhost:5173

### 后端

```bash
cd ac-panel/backend
npm install
npm run dev
```

服务启动于 http://localhost:3001

## 功能清单

### 主控面板（客厅）
- 空调模式切换：制冷 / 制热 / 送风 / 自动
- 温度调节：半圆形旋钮，触摸拖动，16–30°C
- 全局开关机
- 全局设置入口（齿轮图标）

### 房间面板
- 温度调节：半圆形旋钮
- 独立开关机
- **不能**切换空调模式

### 全局设置
- 主题切换：尊贵黑金 / 极简灰白 / 科技蓝紫
- 亮度调整：白天 / 夜间分段滑块（06:00–18:00 白天）
- 系统状态显示

### 滑动导航
- 主面板 ←右滑→ 负一屏（房间列表）
- 房间列表点击卡片 → 房间面板
- 设置页 ←右滑→ 主面板

### 显示信息
房间名、空调设定温度、室内实际温度、湿度、实时时间

### 关机状态
面板变暗（opacity 0.5），仅显示时间和电源按钮

## 项目结构

```
ac-panel/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── mainpanel/          # 主控面板
│   │   │   ├── roompanel/          # 房间面板
│   │   │   ├── temperaturedial/    # 半圆温度旋钮
│   │   │   ├── globalsettings/     # 全局设置页
│   │   │   ├── roomlist/           # 负一屏房间列表
│   │   │   └── shared/             # 共享面板容器
│   │   ├── hooks/
│   │   │   ├── useTheme.ts         # 主题切换
│   │   │   ├── useBrightness.ts    # 亮度自动判断+应用
│   │   │   └── useSwipe.ts         # 滑动手势检测
│   │   ├── themes/
│   │   │   └── tech-blue-purple.css # 三套主题 CSS 变量
│   │   ├── types/index.ts          # 类型定义
│   │   ├── mock/data.ts            # Mock 数据
│   │   ├── App.tsx                 # 根组件+视图路由
│   │   └── main.tsx                # 入口
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── routes/                 # Express 路由
│   │   ├── controllers/            # 控制器+输入验证
│   │   ├── data/mockData.ts        # Mock 数据
│   │   ├── types/index.ts          # 类型定义
│   │   ├── utils/response.ts       # 统一响应格式
│   │   └── index.ts                # 入口
│   ├── api.md                      # API 文档
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/rooms | 获取所有房间 |
| GET | /api/rooms/:id | 获取单个房间 |
| PUT | /api/rooms/:id | 更新房间（温度/电源） |
| PUT | /api/rooms/:id/mode | 更新空调模式（仅主控） |
| GET | /api/settings | 获取全局设置 |
| PUT | /api/settings | 更新全局设置 |
| PUT | /api/settings/mode | 更新主控模式 |
| GET | /api/health | 健康检查 |
| GET | /api/time | 获取服务器时间 |

详细文档见 `backend/api.md`。

## Mock 数据

| 房间 | ID | 默认温度 |
|------|----|---------|
| 客厅（主控） | living-room | 24°C |
| 主卧 | master-bedroom | 23°C |
| 次卧 | second-bedroom | 25°C |
| 书房 | study | 22°C |
| 厨房 | kitchen | 26°C |
| 儿童房 | kids-room | 24°C |

前后端使用统一的房间 ID，确保接入真实 API 后无缝切换。

## 后续开发建议

1. **接入真实 API**：创建 `frontend/src/api/` 目录，封装 fetch 调用替换 mock 数据
2. **添加 WebSocket**：实时温度推送，替代轮询
3. **用户认证**：JWT/Session 中间件
4. **数据库**：替换内存 mock 数据为持久化存储
5. **滑动动画调优**：实际设备测试旋钮与面板滑动的 touch 事件边界
