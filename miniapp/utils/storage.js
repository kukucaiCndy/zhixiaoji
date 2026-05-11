/**
 * 本地存储封装
 * 统一封装 wx.storage，支持同步/异步操作
 */

const { STORAGE_KEYS } = require('./constants');

/**
 * 同步获取存储数据
 * @param {string} key - 存储键名
 * @returns {any} 存储的数据
 */
function getSync(key) {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    console.error('Storage getSync error:', e);
    return null;
  }
}

/**
 * 同步设置存储数据
 * @param {string} key - 存储键名
 * @param {any} data - 要存储的数据
 */
function setSync(key, data) {
  try {
    wx.setStorageSync(key, data);
  } catch (e) {
    console.error('Storage setSync error:', e);
  }
}

/**
 * 同步移除存储数据
 * @param {string} key - 存储键名
 */
function removeSync(key) {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('Storage removeSync error:', e);
  }
}

/**
 * 同步清空所有存储
 */
function clearSync() {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('Storage clearSync error:', e);
  }
}

/**
 * 异步获取存储数据
 * @param {string} key - 存储键名
 * @returns {Promise<any>}
 */
function get(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success: (res) => resolve(res.data),
      fail: (err) => {
        console.error('Storage get error:', err);
        resolve(null);
      }
    });
  });
}

/**
 * 异步设置存储数据
 * @param {string} key - 存储键名
 * @param {any} data - 要存储的数据
 * @returns {Promise<void>}
 */
function set(key, data) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key,
      data,
      success: () => resolve(),
      fail: (err) => {
        console.error('Storage set error:', err);
        reject(err);
      }
    });
  });
}

/**
 * 异步移除存储数据
 * @param {string} key - 存储键名
 * @returns {Promise<void>}
 */
function remove(key) {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key,
      success: () => resolve(),
      fail: (err) => {
        console.error('Storage remove error:', err);
        reject(err);
      }
    });
  });
}

// ==================== Token 相关 ====================

/**
 * 获取 Access Token
 * @returns {string|null}
 */
function getToken() {
  return getSync(STORAGE_KEYS.TOKEN);
}

/**
 * 设置 Access Token
 * @param {string} token
 */
function setToken(token) {
  setSync(STORAGE_KEYS.TOKEN, token);
}

/**
 * 获取 Refresh Token
 * @returns {string|null}
 */
function getRefreshToken() {
  return getSync(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * 设置 Refresh Token
 * @param {string} token
 */
function setRefreshToken(token) {
  setSync(STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * 清除所有 Token
 */
function clearTokens() {
  removeSync(STORAGE_KEYS.TOKEN);
  removeSync(STORAGE_KEYS.REFRESH_TOKEN);
}

// ==================== 用户信息相关 ====================

/**
 * 获取用户信息
 * @returns {Object|null}
 */
function getUserInfo() {
  return getSync(STORAGE_KEYS.USER_INFO);
}

/**
 *