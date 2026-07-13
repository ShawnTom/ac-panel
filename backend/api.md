# 空调控制面板后端 API 文档

## 基本信息

- **基础地址**: `http://localhost:3001`
- **响应格式**: JSON
- **字符编码**: UTF-8

## 统一响应格式

所有接口返回统一的 JSON 格式：

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {}
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 400 | 请求参数错误 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 数据模型

### Room（房间）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 房间唯一标识 |
| name | string | 房间名称 |
| acTemp | number | 空调设定温度（16-30°C） |
| indoorTemp | number | 室内实际温度 |
| humidity | number | 湿度百分比（0-100） |
| power | boolean | 空调电源状态 |
| mode | ACMode? | 空调模式（仅总控房间有） |
| fanSpeed | number? | 风量档 1-5（通风模式） |
| fanMode | FanMode? | 风量运行模式：`'auto' | 'manual'` |
| fanAdjustable | boolean? | 是否支持风量显示/调节 |

> **说明**：后端当前类型定义未含风量字段（仅前端使用），后续如需持久化请扩展 `backend/src/types/index.ts` 和 `backend/src/data/mockData.ts`。

### ACMode（空调模式）

```
'cool' | 'heat' | 'wind' | 'auto'
```

### FanMode（风量运行模式）

```
'auto' | 'manual'
```

### GlobalSettings（全局设置）

| 字段 | 类型 | 说明 |
|------|------|------|
| theme | ThemeName | 主题名称 |
| brightness.day | number | 白天亮度（0-100，白天 = 8:00-18:00） |
| brightness.night | number | 夜间亮度（0-100，晚上 = 18:00-8:00） |
| currentMode | ACMode | 总控空调当前模式 |
| power | boolean | 总控电源状态 |

### ThemeName（主题名称）

```
'black-gold' | 'gray-white' | 'tech-blue-purple'
```

---

## API 接口

### 1. 获取所有房间列表

- **方法**: `GET`
- **路径**: `/api/rooms`
- **请求参数**: 无

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "id": "living-room",
      "name": "总控",
      "acTemp": 24,
      "indoorTemp": 26,
      "humidity": 55,
      "power": true,
      "mode": "cool",
      "fanSpeed": 3,
      "fanMode": "manual",
      "fanAdjustable": true
    },
    {
      "id": "master-bedroom",
      "name": "主卧",
      "acTemp": 23,
      "indoorTemp": 25,
      "humidity": 50,
      "power": true,
      "fanSpeed": 2,
      "fanMode": "auto",
      "fanAdjustable": true
    }
  ]
}
```

---

### 2. 获取单个房间详情

- **方法**: `GET`
- **路径**: `/api/rooms/:id`
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 房间 ID |

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "id": "living-room",
    "name": "总控",
    "acTemp": 24,
    "indoorTemp": 26,
    "humidity": 55,
    "power": true,
    "mode": "cool",
    "fanSpeed": 3,
    "fanMode": "manual",
    "fanAdjustable": true
  }
}
```

**错误响应**:

```json
{
  "code": 404,
  "msg": "房间 \"xxx\" 不存在",
  "data": null
}
```

---

### 3. 更新房间信息（温度/电源）

- **方法**: `PUT`
- **路径**: `/api/rooms/:id`
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 房间 ID |

- **请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| acTemp | number | 否 | 空调温度（16-30°C） |
| power | boolean | 否 | 电源开关 |

**请求示例**:

```json
{
  "acTemp": 24,
  "power": true
}
```

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "id": "living-room",
    "name": "总控",
    "acTemp": 24,
    "indoorTemp": 26,
    "humidity": 55,
    "power": true,
    "mode": "cool"
  }
}
```

---

### 4. 更新空调模式（仅总控房间）

- **方法**: `PUT`
- **路径**: `/api/rooms/:id/mode`
- **路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 房间 ID（必须为总控房间 "living-room"） |

- **请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mode | ACMode | 是 | 空调模式: cool/heat/wind/auto |

**请求示例**:

```json
{
  "mode": "heat"
}
```

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "id": "living-room",
    "name": "总控",
    "acTemp": 24,
    "indoorTemp": 26,
    "humidity": 55,
    "power": true,
    "mode": "heat"
  }
}
```

**错误响应（非总控房间）**:

```json
{
  "code": 403,
  "msg": "只有主控房间（客厅）可以更改空调模式",
  "data": null
}
```

---

### 5. 获取全局设置

- **方法**: `GET`
- **路径**: `/api/settings`
- **请求参数**: 无

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "theme": "tech-blue-purple",
    "brightness": {
      "day": 100,
      "night": 70
    },
    "currentMode": "cool",
    "power": true
  }
}
```

---

### 6. 更新全局设置（主题/亮度）

- **方法**: `PUT`
- **路径**: `/api/settings`
- **请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| theme | ThemeName | 否 | 主题: black-gold/gray-white/tech-blue-purple |
| brightness.day | number | 否 | 白天亮度（0-100） |
| brightness.night | number | 否 | 夜间亮度（0-100） |

**请求示例**:

```json
{
  "theme": "tech-blue-purple",
  "brightness": {
    "day": 90,
    "night": 50
  }
}
```

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "theme": "tech-blue-purple",
    "brightness": {
      "day": 90,
      "night": 50
    },
    "currentMode": "cool",
    "power": true
  }
}
```

---

### 7. 更新总控空调模式

- **方法**: `PUT`
- **路径**: `/api/settings/mode`
- **请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mode | ACMode | 是 | 空调模式: cool/heat/wind/auto |

**请求示例**:

```json
{
  "mode": "auto"
}
```

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "theme": "tech-blue-purple",
    "brightness": {
      "day": 100,
      "night": 70
    },
    "currentMode": "auto",
    "power": true
  }
}
```

---

### 8. 健康检查

- **方法**: `GET`
- **路径**: `/api/health`
- **请求参数**: 无

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "status": "ok",
    "uptime": 3600
  }
}
```

---

### 9. 获取当前时间

- **方法**: `GET`
- **路径**: `/api/time`
- **请求参数**: 无

**响应示例**:

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "timestamp": 1720527600000,
    "iso": "2026-07-13T11:00:00.000Z"
  }
}
```

---

## 房间列表

| ID | 名称 | 备注 |
|----|------|------|
| living-room | 总控 | 主控房间 |
| master-bedroom | 主卧 | |
| second-bedroom | 次卧 | |
| study | 书房 | |
| kitchen | 厨房 | |
| kids-room | 儿童房 | |

---

## 输入验证规则

- 温度范围：16–30°C（超出返回 400）
- 白天亮度：0–100（后端未做最低保护，前端最低 50%）
- 夜间亮度：0–100（后端未做最低保护，前端最低 30%）
- 空调模式枚举：cool / heat / wind / auto
- 电源类型：boolean
- 非主控房间调用模式更新返回 403

---

## 启动方式

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 编译
npm run build

# 生产模式运行
npm start
```

默认监听端口: **3001**

---

## 后续待补充

- [ ] 后端支持风量字段（`fanSpeed` / `fanMode` / `fanAdjustable`）持久化
- [ ] WebSocket 推送接口
- [ ] 用户认证
- [ ] 数据库持久化（当前是内存 Mock）
