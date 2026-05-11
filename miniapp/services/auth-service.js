/**
 * 认证服务层
 * 封装用户认证相关 API 调用
 */

const { apiClient, auth, setToken, clearToken } = require('./api-client');

/**
 * 微信小程序登录
 * @param {string} code - 微信登录凭证
 * @returns {Promise<Object>} 登录结果
 */
async function miniappLogin(code) {
  try {
    const result = await auth.miniappLogin({ code });
    
    if (result.code === 0 && result.data) {
      const { accessToken, refreshToken, user } = result.data;
      
      // 保存 Token
      setToken(accessToken);
      
      // 保存用户信息到本地存储
      wx.setStorageSync('user_info', JSON.stringify(user));
      wx.setStorageSync('refresh_token', refreshToken);
      
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
 * @returns {Promise<Object>} 刷新结果
 */
async function refreshToken() {
  try {
    const refreshToken = wx.getStorageSync('refresh_token');
    
    if (!refreshToken) {
      return {
        success: false,
        message: '无刷新令牌'
      };
    }
    
    const result = await auth.refreshToken({ refreshToken });
    
    if (result.code === 0 && result.data) {
      const { accessToken, refreshToken: newRefreshToken } = result.data;
      
      // 更新 Token
      setToken(accessToken);
      wx.setStorageSync('refresh_token', newRefreshToken);
      
      return {
        success: true,
        data: result.data
      };
    }
    
    return {
      success: false,
      message: result.message || '刷新失败'
    };
  } catch (error) {
    console.error('刷新 Token 失败:', error);
    return {
      success: false,
      message: error.message || '刷新失败'
    };
  }
}

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 用户信息
 */
async function getCurrentUser() {
  try {
    const result = await auth.getProfile();
    
    if (result.code === 0 && result.data) {
      // 更新本地存储的用户信息
      wx.setStorageSync('user_info', JSON.stringify(result.data));
      
      return {
        success: true,
        data: result.data
      };
    }
    
    return {
      success: false,
      data: null,
      message: result.message || '获取用户信息失败'
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      success: false,
      data: null,
      message: error.message || '网络错误'
    };
  }
}

/**
 * 更新用户信息
 * @param {string} userId - 用户ID
 * @param {Object} data - 更新数据
 * @param {string} [data.nickname] - 昵称
 * @param {string} [data.avatarUrl] - 头像URL
 * @returns {Promise<Object>} 更新结果
 */
async function updateUser(userId, data) {
  try {
    const result = await auth.updateProfile(userId, data);
    
    if (result.code === 0) {
      // 更新本地存储的用户信息
      const userInfo = wx.getStorageSync('user_info');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        Object.assign(user, data);
        wx.setStorageSync('user_info', JSON.stringify(user));
      }
      
      return {
        success: true,
        message: '更新成功'
      };
    }
    
    return {
      success: false,
      message: result.message || '更新失败'
    };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      success: false,
      message: error.message || '网络错误'
    };
  }
}

/**
 * 退出登录
 * @returns {Promise<Object>} 登出结果
 */
async function logout() {
  try {
    // 调用后端登出接口
    await auth.logout();
  } catch (error) {
    console.error('登出接口调用失败:', error);
  } finally {
    // 清除本地 Token 和用户信息
    clearToken();
    wx.removeStorageSync('user_info');
    wx.removeStorageSync('refresh_token');
  }
  
  return {
    success: true,
    message: '已退出登录'
  };
}

/**
 * 检查登录状态
 * @returns {Promise<boolean>} 是否已登录
 */
async function checkLoginStatus() {
  try {
    const result = await auth.getProfile();
    return result.code === 0;
  } catch (error) {
    return false;
  }
}

module.exports = {
  miniappLogin,
  refreshToken,
  getCurrentUser,
  updateUser,
  logout,
  checkLoginStatus
};
