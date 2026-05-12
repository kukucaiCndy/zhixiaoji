var authService = require('services/auth-service');
var storage = require('utils/storage');
var STORAGE_KEYS = require('utils/constants').STORAGE_KEYS;

App({
  globalData: {
    userInfo: null,
    systemInfo: null
  },

  onLaunch() {
    var that = this;
    var systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    storage.setSync(STORAGE_KEYS.SYSTEM_INFO, systemInfo);

    var token = storage.getToken();
    if (token) {
      authService.refreshToken().then(function (result) {
        if (result.success) {
          return authService.getCurrentUser();
        }
      }).then(function (userResult) {
        if (userResult && userResult.success) {
          that.globalData.userInfo = userResult.data;
          storage.setSync(STORAGE_KEYS.USER_INFO, userResult.data);
        } else {
          storage.clearTokens();
        }
      }).catch(function () {
        storage.clearTokens();
      });
    }
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    storage.setSync(STORAGE_KEYS.USER_INFO, userInfo);
  }
});