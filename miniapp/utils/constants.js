/**
 * 全局常量配置
 */

// API 基础配置
const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000
  },
  // 测试环境
  test: {
    baseURL: 'https://api-test.zhixiaoji.com/api/v1',
    timeout: 10000
  },
  // 生产环境
  production: {
    baseURL: 'https://api.zhixiaoji.com/api/v1',
    timeout: 10000
  }
};

// 当前环境
const ENV = 'development';

// 导出配置
module.exports = {
  API_CONFIG,
  ENV,
  BASE_URL: API_CONFIG[ENV].baseURL,
  TIMEOUT: API_CONFIG[ENV].timeout,
  
  // 存储键名
  STORAGE_KEYS: {
    TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_INFO: 'user_info',
    SYSTEM_INFO: 'system_info'
  }
};
