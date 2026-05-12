/**
 * 业务 API 基础封装
 * 复用 SDK HttpClient 的认证和能力，为各业务模块提供统一调用入口
 */

const { apiClient } = require('./api-client');
const { delay, success, fail } = require('./monk-data');

// 复用 SDK HttpClient（已配置 baseURL、Token 注入、Auth 错误处理）
const client = apiClient.client;

/**
 * 统一的业务 API 请求封装
 * 带 Mock 兜底：当接口不可达时回退到 mock 数据
 */
function createService(basePath, mockHandlers) {
  return {
    get(path, params) {
      return client.get(basePath + path, params).catch(function () {
        if (mockHandlers && mockHandlers.get) {
          return delay().then(function () { return success(mockHandlers.get(path, params)); });
        }
        return fail('请求失败');
      });
    },
    post(path, body) {
      return client.post(basePath + path, body).catch(function () {
        if (mockHandlers && mockHandlers.post) {
          return delay().then(function () { return success(mockHandlers.post(path, body)); });
        }
        return fail('请求失败');
      });
    },
    patch(path, body) {
      return client.patch(basePath + path, body).catch(function () {
        if (mockHandlers && mockHandlers.patch) {
          return delay().then(function () { return success(mockHandlers.patch(path, body)); });
        }
        return fail('请求失败');
      });
    },
    del(path) {
      return client.delete(basePath + path).catch(function () {
        if (mockHandlers && mockHandlers.del) {
          return delay().then(function () { return success(mockHandlers.del(path)); });
        }
        return fail('请求失败');
      });
    }
  };
}

module.exports = {
  client,
  createService
};