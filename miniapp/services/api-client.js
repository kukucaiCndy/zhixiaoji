/**
 * API 客户端配置
 * 使用 @zhixiaoji/api-sdk-wechat 创建微信小程序专用客户端
 * 需先在开发者工具中执行: 工具 → 构建 npm
 */

const { createWechatApiClient, setLoggerEnabled } = require('@zhixiaoji/api-sdk-wechat');

// 调试阶段开启 SDK 日志
setLoggerEnabled(true);

// 环境配置
var ENV_CONFIG = {
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
var CURRENT_ENV = 'development';
var config = ENV_CONFIG[CURRENT_ENV];

// 多服务路由配置（SDK v0.5.2+ upload() 通过 service 路由）
// core 去掉 /api/v1 前缀，因为 uploadAvatar 路径已包含 /api/v1
var baseHost = config.baseURL.replace(/\/api\/v1\/?$/, '');
var services = {
  auth: config.baseURL,
  core: baseHost,
  knowledge: config.baseURL
};

// 创建 API 客户端
var apiClient = createWechatApiClient({
  baseURL: config.baseURL,
  timeout: config.timeout,
  services: services,
  onAuthError: function () {
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
