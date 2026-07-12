import { Router } from 'express';
import { getSettings, updateSettings, updateMode } from '../controllers/settingsController';

const router: Router = Router();

// 获取全局设置
router.get('/', (req, res) => {
  const result = getSettings();
  res.json(result);
});

// 更新全局设置（主题/亮度）
router.put('/', (req, res) => {
  const result = updateSettings(req.body);
  res.status(result.code === 0 ? 200 : 400).json(result);
});

// 更新主控空调模式
router.put('/mode', (req, res) => {
  const result = updateMode(req.body);
  res.status(result.code === 0 ? 200 : 400).json(result);
});

export default router;
