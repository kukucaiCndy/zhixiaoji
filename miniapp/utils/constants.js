/**
 * 全局常量配置
 */

const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000
  },
  test: {
    baseURL: 'https://api-test.zhixiaoji.com/api/v1',
    timeout: 10000
  },
  production: {
    baseURL: 'https://api.zhixiaoji.com/api/v1',
    timeout: 10000
  }
};

const ENV = 'development';

module.exports = {
  API_CONFIG,
  ENV,
  BASE_URL: API_CONFIG[ENV].baseURL,
  TIMEOUT: API_CONFIG[ENV].timeout,

  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',       // SDK 内部使用（驼峰）
    REFRESH_TOKEN: 'refresh_token',
    USER_INFO: 'user_info',
    SYSTEM_INFO: 'system_info',
    GUIDE_SHOWN: 'guide_shown',        // 是否展示过引导页
    USER_PREFERENCES: 'user_preferences', // 用户兴趣偏好
    THEME: 'theme'                     // 主题模式：light / dark / auto
  },

  // 主题模式
  THEME_MODE: {
    AUTO: 'auto',   // 跟随系统（默认）
    LIGHT: 'light', // 强制浅色
    DARK: 'dark'    // 强制深色
  }
};