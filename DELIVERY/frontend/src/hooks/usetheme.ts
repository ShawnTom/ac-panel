import { useCallback } from 'react';
import type { ThemeName } from '../types';

/**
 * Theme hook — manages data-theme attribute on document root.
 */
export function useTheme(initialTheme: ThemeName = 'tech-blue-purple') {
  const setTheme = useCallback((theme: ThemeName) => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const getTheme = useCallback((): ThemeName => {
    return (document.documentElement.getAttribute('data-theme') as ThemeName) || initialTheme;
  }, [initialTheme]);

  return { setTheme, getTheme };
}
