import { Router } from 'express';
import { healthCheck, getCurrentTime } from '../controllers/systemController';

const router: Router = Router();

// 健康检查
router.get('/health', (req, res) => {
  const result = healthCheck();
  res.json(result);
});

// 获取当前时间（用于面板同步）
router.get('/time', (req, res) => {
  const result = getCurrentTime();
  res.json(result);
});

export default router;
