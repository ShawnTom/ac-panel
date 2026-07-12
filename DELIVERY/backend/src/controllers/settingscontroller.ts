import { globalSettings } from '../data/mockData';
import type { GlobalSettings, ThemeName, UpdateSettingsBody, ACMode } from '../types';
import { success, error } from '../utils/response';
import type { ApiResponse } from '../types';

// 合法的主题列表
const VALID_THEMES: ThemeName[] = ['black-gold', 'gray-white', 'tech-blue-purple'];

// 合法的空调模式列表
const VALID_MODES: ACMode[] = ['cool', 'heat', 'wind', 'auto'];

/**
 * 获取全局设置
 */
export function getSettings(): ApiResponse<GlobalSettings> {
  return success(globalSettings);
}

/**
 * 更新全局设置（主题/亮度）
 * @param body 请求体，包含可选的 theme 和 brightness
 */
export function updateSettings(body: UpdateSettingsBody): ApiResponse<GlobalSettings> {
  // 验证主题
  if (body.theme !== undefined) {
    if (!VALID_THEMES.includes(body.theme)) {
      return error(`theme 必须是以下值之一: ${VALID_THEMES.join(', ')}`, 400);
    }
    globalSettings.theme = body.theme;
  }

  // 验证亮度
  if (body.brightness !== undefined) {
    if (body.brightness.day !== undefined) {
      if (typeof body.brightness.day !== 'number' || body.brightness.day < 0 || body.brightness.day > 100) {
        return error('白天亮度必须在 0-100 之间', 400);
      }
      globalSettings.brightness.day = body.brightness.day;
    }
    if (body.brightness.night !== undefined) {
      if (typeof body.brightness.night !== 'number' || body.brightness.night < 0 || body.brightness.night > 100) {
        return error('夜间亮度必须在 0-100 之间', 400);
      }
      globalSettings.brightness.night = body.brightness.night;
    }
  }

  return success(globalSettings);
}

/**
 * 更新主控空调模式
 * @param body 请求体，包含 mode
 */
export function updateMode(body: { mode: ACMode }): ApiResponse<GlobalSettings> {
  if (!body.mode || !VALID_MODES.includes(body.mode)) {
    return error(`mode 必须是以下值之一: ${VALID_MODES.join(', ')}`, 400);
  }

  globalSettings.currentMode = body.mode;
  return success(globalSettings);
}
