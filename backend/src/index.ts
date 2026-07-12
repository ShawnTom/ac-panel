import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import roomRoutes from './routes/rooms';
import settingsRoutes from './routes/settings';
import systemRoutes from './routes/system';
import { error } from './utils/response';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());              // 开启 CORS（开发环境）
app.use(express.json());      // 解析 JSON 请求体

// 路由挂载
app.use('/api/rooms', roomRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', systemRoutes);

// 根路由
app.get('/', (req: Request, res: Response) => {
  res.json({
    code: 0,
    msg: 'SUCCESS',
    data: {
      name: 'AC Panel Backend API',
      version: '1.0.0',
      docs: '/api/health',
    },
  });
});

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json(error('接口不存在', 404));
});

// 统一错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[错误]', err.message);
  res.status(500).json(error('服务器内部错误', 500));
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🏠 空调控制面板后端服务已启动`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
});

export default app;
