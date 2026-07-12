import { rooms, MASTER_ROOM_ID } from '../data/mockData';
import type { Room, ACMode, UpdateRoomBody, UpdateModeBody } from '../types';
import { success, error } from '../utils/response';
import type { ApiResponse } from '../types';

/**
 * 获取所有房间列表
 */
export function getAllRooms(): ApiResponse<Room[]> {
  return success(rooms);
}

/**
 * 根据 ID 获取单个房间详情
 * @param id 房间 ID
 */
export function getRoomById(id: string): ApiResponse<Room> {
  const room = rooms.find(r => r.id === id);
  if (!room) {
    return error(`房间 "${id}" 不存在`, 404);
  }
  return success(room);
}

/**
 * 更新房间信息（温度/电源）
 * @param id 房间 ID
 * @param body 请求体，包含可选的 acTemp 和 power
 */
export function updateRoom(id: string, body: UpdateRoomBody): ApiResponse<Room> {
  const room = rooms.find(r => r.id === id);
  if (!room) {
    return error(`房间 "${id}" 不存在`, 404);
  }

  // 验证温度范围（16-32°C）
  if (body.acTemp !== undefined) {
    if (typeof body.acTemp !== 'number' || body.acTemp < 16 || body.acTemp > 32) {
      return error('温度必须在 16-32°C 之间', 400);
    }
    room.acTemp = body.acTemp;
  }

  // 验证电源状态
  if (body.power !== undefined) {
    if (typeof body.power !== 'boolean') {
      return error('power 必须是布尔值', 400);
    }
    room.power = body.power;
  }

  return success(room);
}

/**
 * 更新空调模式（仅主控房间可用）
 * @param id 房间 ID
 * @param body 请求体，包含 mode
 */
export function updateRoomMode(id: string, body: UpdateModeBody): ApiResponse<Room> {
  const room = rooms.find(r => r.id === id);
  if (!room) {
    return error(`房间 "${id}" 不存在`, 404);
  }

  // 仅主控房间可更新模式
  if (id !== MASTER_ROOM_ID) {
    return error('只有主控房间（客厅）可以更改空调模式', 403);
  }

  // 验证模式值
  const validModes: ACMode[] = ['cool', 'heat', 'wind', 'auto'];
  if (!body.mode || !validModes.includes(body.mode)) {
    return error(`mode 必须是以下值之一: ${validModes.join(', ')}`, 400);
  }

  room.mode = body.mode;
  return success(room);
}
