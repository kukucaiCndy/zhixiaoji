var authService = require('services/auth-service');
var storage = require('utils/storage');

App({
  globalData: {
    userInfo: null,
    systemInfo: null
  },

  onLaunch() {
    var that = this;
    var systemInfo = wx.getSystemInfoSync();
    that.globalData.systemInfo = systemInfo;

    var token = storage.getToken();
    if (token) {
      var cachedUser = storage.getUserInfo();
      if (cachedUser) {
        that.globalData.userInfo = cachedUser;
      }
      that.loadUserInfo();
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
