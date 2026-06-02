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
    baseURL: 'http://192.168.16.129:12301/api/v1',
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

var services = {
  auth: config.baseURL,
  core: 'http://192.168.16.129:12302/api/v1',
  knowledge: 'http://192.168.16.129:12303/api/v1'
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
  knowledge: apiClient.knowledge,
  setToken: apiClient.setToken,
  clearToken: apiClient.clearToken
};
