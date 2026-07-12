import { success } from '../utils/response';
import type { ApiResponse } from '../types';

/**
 * 健康检查
 */
export function healthCheck(): ApiResponse<{ status: string; uptime: number }> {
  return success({
    status: 'ok',
    uptime: process.uptime(),
  });
}

/**
 * 获取当前时间（用于面板同步）
 */
export function getCurrentTime(): ApiResponse<{ timestamp: number; iso: string }> {
  const now = new Date();
  return success({
    timestamp: now.getTime(),
    iso: now.toISOString(),
  });
}
