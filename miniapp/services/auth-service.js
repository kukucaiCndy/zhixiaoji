/**
 * 认证服务层
 * 封装用户认证相关 API 调用
 */

const { auth, setToken, clearToken } = require('./api-client');
const storage = require('../utils/storage');
const { STORAGE_KEYS } = require('../utils/constants');

/**
 * 微信小程序登录
 */
async function miniappLogin(code) {
  try {
    const result = await auth.miniappLogin({ code });
    
    if (result.code === 0 && result.data) {
      const { accessToken, refreshToken, user } = result.data;
      
      setToken(accessToken);
      storage.setSync(STORAGE_KEYS.USER_INFO, user);
      storage.setSync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      
      return {
        success: true,
        data: result.data,
        message: '登录成功'
      };
    }
    
    return {
      success: false,
      data: null,
      message: result.message || '登录失败'
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      data: null,
      message: error.message || '网络错误，请重试'
    };
  }
}

/**
 * 刷新 Token
 */
async function refreshToken() {
  try {
    const refreshTokenVal = storage.getRefreshToken();
    
    if (!refreshTokenVal) {
      return { success: false, message: '无刷新令牌' };
    }
    
    const result = await auth.refreshToken({ refreshToken: refreshTokenVal });
    
    if (result.code === 0 && result.data) {
      const { accessToken, refreshToken: newRefreshToken } = result.data;
      setToken(accessToken);
      storage.setSync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      return { success: true, data: result.data };
    }
    
    return { success: false, message: result.message || '刷新失败' };
  } catch (error) {
    console.error('刷新 Token 失败:', error);
    return { success: false, message: error.message || '刷新失败' };
  }
}

/**
 * 获取当前用户信息
 */
async function getCurrentUser() {
  try {
    const result = await auth.getProfile();
    
    if (result.code === 0 && result.data) {
      storage.setSync(STORAGE_KEYS.USER_INFO, result.data);
      return { success: true, data: result.data };
    }
    
    return { success: false, data: null, message: result.message || '获取用户信息失败' };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return { success: false, data: null, message: error.message || '网络错误' };
  }
}

/**
 * 更新用户信息
 */
async function updateUser(userId, data) {
  try {
    const result = await auth.updateProfile(userId, data);
    
    if (result.code === 0) {
      storage.setSync(STORAGE_KEYS.USER_INFO, result.data);
      return { success: true, data: result.data, message: '更新成功' };
    }
    
    return { success: false, message: result.message || '更新失败' };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return { success: false, message: error.message || '网络错误' };
  }
}

/**
 * 退出登录
 */
async function logout() {
  // 先立即清理本地 token，防止 app.js 启动守卫重复调用
  clearToken();
  storage.removeSync(STORAGE_KEYS.USER_INFO);
  storage.removeSync(STORAGE_KEYS.REFRESH_TOKEN);
  
  try {
    // 再调用服务端 logout（可选，失败不影响本地退出）
    await auth.logout();
  } catch (error) {
    console.error('服务端登出接口调用失败:', error);
  }
  
  return { success: true, message: '已退出登录' };
}

/**
 * 检查登录状态
 */
async function checkLoginStatus() {
  try {
    var token = storage.getToken();
    if (!token) return false;
    const result = await auth.getProfile();
    return result.code === 0;
  } catch (error) {
    return false;
  }
}

/**
 * 上传头像
 * @param {string} filePath - 图片临时路径
 */
async function uploadAvatar(filePath, userId) {
  try {
    console.log('[Upload Avatar] 开始上传:', filePath);
    const result = await auth.uploadFile(filePath, 'avatar', userId);
    console.log('[Upload Avatar] 上传响应:', result);
    
    if (result.code === 0 && result.data) {
      var userInfo = storage.getSync(STORAGE_KEYS.USER_INFO);
      if (userInfo) {
        userInfo.avatarUrl = result.data.url;
        storage.setSync(STORAGE_KEYS.USER_INFO, userInfo);
      }
      return { 
        success: true, 
        data: result.data,
        message: '上传成功' 
      };
    }
    
    return { 
      success: false, 
      message: result.message || '上传失败' 
    };
  } catch (error) {
    console.error('[Upload Avatar] 上传失败:', error);
    return { 
      success: false, 
      message: error.message || '网络错误' 
    };
  }
}

module.exports = {
  miniappLogin,
  refreshToken,
  getCurrentUser,
  updateUser,
  logout,
  checkLoginStatus,
  uploadAvatar
};