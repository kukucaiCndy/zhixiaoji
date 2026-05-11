var app = getApp();

Page({
  data: {
    themeColor: '#4F46E5',
    remindEnabled: true,
    fontSize: '标准',
    cacheSize: '0KB'
  },

  onLoad() {
    this.getCacheSize();
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo: userInfo });
    }
  },

  onShow() {
    this.getCacheSize();
  },

  getCacheSize() {
    var that = this;
    wx.getStorageInfo({
      success(res) {
        var size = res.currentSize;
        var cacheStr = '0KB';
        if (size >= 1024) {
          cacheStr = (size / 1024).toFixed(1) + 'MB';
        } else {
          cacheStr = size + 'KB';
        }
        that.setData({ cacheSize: cacheStr });
      },
      fail() {
        that.setData({ cacheSize: '0KB' });
      }
    });
  },

  onTheme() {
    wx.navigateTo({ url: '/pages/profile/theme-settings/theme-settings' });
  },

  onRemindChange(e) {
    this.setData({ remindEnabled: e.detail.value });
    wx.showToast({
      title: e.detail.value ? '已开启学习提醒' : '已关闭学习提醒',
      icon: 'none'
    });
  },

  onFontSize() {
    wx.navigateTo({ url: '/pages/profile/font-size/font-size' });
  },

  onClearCache() {
    var that = this;
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync();
          that.getCacheSize();
          wx.showToast({ title: '已清除缓存', icon: 'success' });
        }
      }
    });
  },

  onAbout() {
    wx.showToast({ title: '智小记 v1.0.0', icon: 'none' });
  },

  onCheckUpdate() {
    wx.showToast({ title: '已是最新版本', icon: 'none' });
  },

  onLogout() {
    var that = this;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？退出后需重新登录。',
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync('accessToken');
          wx.removeStorageSync('refreshToken');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('isGuest');
          wx.reLaunch({ url: '/pages/auth/login-guide/login-guide' });
        }
      }
    });
  }
});
