import { Router } from 'express';
import { getAllRooms, getRoomById, updateRoom, updateRoomMode } from '../controllers/roomController';

const router: Router = Router();

// 获取所有房间列表
router.get('/', (req, res) => {
  const result = getAllRooms();
  res.json(result);
});

// 获取单个房间详情
router.get('/:id', (req, res) => {
  const result = getRoomById(req.params.id);
  res.status(result.code === 0 ? 200 : 404).json(result);
});

// 更新房间信息（温度/电源）
router.put('/:id', (req, res) => {
  const result = updateRoom(req.params.id, req.body);
  res.status(result.code === 0 ? 200 : 400).json(result);
});

// 更新空调模式（仅主控房间）
router.put('/:id/mode', (req, res) => {
  const result = updateRoomMode(req.params.id, req.body);
  const statusCode = result.code === 0 ? 200 : (result.code === 404 ? 404 : (result.code === 403 ? 403 : 400));
  res.status(statusCode).json(result);
});

export default router;
