var authService = require('services/auth-service');
var storage = require('utils/storage');
var theme = require('utils/theme');

/**
 * 解码 JWT 获取过期时间
 */
function decodeJwt(token) {
  try {
    var parts = token.split('.');
    if (parts.length !== 3) return null;
    var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');

    var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = '';
    var i = 0;
    while (i < payload.length) {
      var enc1 = base64Chars.indexOf(payload.charAt(i++));
      var enc2 = base64Chars.indexOf(payload.charAt(i++));
      var enc3 = base64Chars.indexOf(payload.charAt(i++));
      var enc4 = base64Chars.indexOf(payload.charAt(i++));
      var chr1 = (enc1 << 2) | (enc2 >> 4);
      var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      var chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 !== 64) output += String.fromCharCode(chr2);
      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }
    return JSON.parse(output);
  } catch (e) {
    return null;
  }
}

App({
  globalData: {
    userInfo: null,
    systemInfo: null,
    theme: 'auto',           // 用户设置的主题模式：auto/light/dark
    effectiveTheme: 'light'  // 实际生效主题：light/dark
  },

  onLaunch() {
    var that = this;
    var systemInfo = wx.getSystemInfoSync();
    that.globalData.systemInfo = systemInfo;

    // 初始化主题
    theme.init(that);

    var token = storage.getToken();
    if (token) {
      var cachedUser = storage.getUserInfo();
      if (cachedUser) {
        that.globalData.userInfo = cachedUser;
      }
      // 启动时主动检查 Token 是否即将过期（5分钟内），提前刷新
      that.checkAndRefreshToken(token).then(function () {
        that.loadUserInfo();
      });
    }
  },

  checkAndRefreshToken(token) {
    var that = this;
    try {
      var payload = decodeJwt(token);
      if (!payload || !payload.exp) return Promise.resolve();

      var nowSec = Math.floor(Date.now() / 1000);
      var expiresIn = payload.exp - nowSec;

      // 如果还有超过 5 分钟有效期，直接返回
      if (expiresIn > 300) return Promise.resolve();

      console.log('[App] Token 即将过期 (剩余' + expiresIn + 's)，提前刷新...');
      var refreshTokenVal = storage.getRefreshToken();
      if (!refreshTokenVal) return Promise.resolve();

      return authService.refreshToken().then(function (res) {
        if (res.success) {
          console.log('[App] Token 提前刷新成功');
        }
      });
    } catch (e) {
      return Promise.resolve();
    }
  },

  loadUserInfo() {
    var that = this;
    return authService.getCurrentUser().then(function (res) {
      if (res.success && res.data) {
        that.globalData.userInfo = res.data;
        return res.data;
      }
      return null;
    }).catch(function () {
      console.error('获取用户信息失败，使用缓存数据');
      return that.globalData.userInfo;
    });
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    storage.setUserInfo(userInfo);
  }
});
