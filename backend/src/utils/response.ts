import type { ApiResponse } from '../types';

/**
 * 构造成功响应
 * @param data 响应数据
 * @returns 统一格式的成功响应对象
 */
export function success<T>(data: T): ApiResponse<T> {
  return { code: 0, msg: 'SUCCESS', data };
}

/**
 * 构造错误响应
 * @param msg 错误消息
 * @param code 错误码，默认 1
 * @returns 统一格式的错误响应对象
 */
export function error(msg: string, code = 1): ApiResponse {
  return { code, msg, data: null };
}
