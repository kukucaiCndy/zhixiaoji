/**
 * API 客户端配置
 * 使用 @zhixiaoji/api-sdk 创建微信小程序专用客户端
 * 需先在开发者工具中执行: 工具 → 构建 npm
 */

const { createWechatApiClient } = require('@zhixiaoji/api-sdk');

// 环境配置
const ENV_CONFIG = {
  development: {
    baseURL: 'http://192.168.16.129:3001/api/v1',
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

// 当前环境
const CURRENT_ENV = 'development';
const config = ENV_CONFIG[CURRENT_ENV];

// 创建 API 客户端
const apiClient = createWechatApiClient({
  baseURL: config.baseURL,
  timeout: config.timeout,
  onAuthError: () => {
    console.log('认证失败，跳转登录页');
    wx.reLaunch({
      url: '/pages/auth/login-guide/login-guide'
    });
  }
});

module.exports = {
  apiClient,
  auth: apiClient.auth,
  setToken: apiClient.setToken,
  clearToken: apiClient.clearToken
};
