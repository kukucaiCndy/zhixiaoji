/**
 * API 客户端配置
 * 使用 @zhixiaoji/api-sdk 创建微信小程序专用客户端
 */

// 注意：小程序中不能使用 npm 包直接导入，需要通过构建 npm 或复制文件
// 这里使用相对路径引用 SDK（假设 SDK 文件已复制到项目中）
// 实际使用时需要根据 SDK 的集成方式调整

const { createWechatApiClient } = require('../node_modules/@zhixiaoji/api-sdk/dist/index.js');

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
    // Token 失效时自动跳转登录页
    console.log('认证失败，跳转登录页');
    wx.reLaunch({
      url: '/pages/auth/login-guide/index'
    });
  }
});

module.exports = {
  apiClient,
  auth: apiClient.auth,
  setToken: apiClient.setToken,
  clearToken: apiClient.clearToken
};
