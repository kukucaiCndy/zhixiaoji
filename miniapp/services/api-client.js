/**
 * API 客户端配置
 * 使用 @zhixiaoji/api-sdk-wechat 创建微信小程序专用客户端
 * 需先在开发者工具中执行: 工具 → 构建 npm
 *
 * SDK v0.13.3 使用 host 参数指向 core-service（12302），
 * 所有 API 请求统一由 core-service 代理转发到对应微服务。
 */

const { createWechatApiClient, setLoggerEnabled } = require('@zhixiaoji/api-sdk-wechat');

// 调试阶段开启 SDK 日志
setLoggerEnabled(true);

// 环境配置（host 指向 core-service，SDK 自动拼接 /api/v1）
var ENV_CONFIG = {
  development: {
    host: 'http://192.168.16.129:12302',
    timeout: 10000
  },
  test: {
    host: 'https://api-test.zhixiaoji.com',
    timeout: 10000
  },
  production: {
    host: 'https://api.zhixiaoji.com',
    timeout: 10000
  }
};

// 当前环境
var CURRENT_ENV = 'development';
var config = ENV_CONFIG[CURRENT_ENV];

// 创建 API 客户端（SDK 自动拼接 host + /api/v1）
var apiClient = createWechatApiClient({
  host: config.host,
  timeout: config.timeout,
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
  learning: apiClient.learning,
  setToken: apiClient.setToken,
  clearToken: apiClient.clearToken
};
