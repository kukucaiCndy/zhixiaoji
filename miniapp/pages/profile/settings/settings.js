var theme = require('../../../utils/theme');

Page({
  data: {
    theme: 'light',           // 实际生效主题（图片路径用）
    themeMode: 'auto',        // 用户设置的模式
    themeLabel: '跟随系统',    // 显示文字
    userInfo: {
      nickname: 'Jesse',
      userId: '10086',
      avatarUrl: ''
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.loadTheme();
  },

  onShow() {
    this.loadTheme();
  },

  /**
   * 主题变化钩子（由 theme.notifyPages 触发）
   */
  onThemeChange(effective) {
    this.setData({ theme: effective });
  },

  loadTheme() {
    var mode = theme.getUserTheme();
    var effective = theme.getEffectiveTheme();
    var labelMap = { auto: '跟随系统', light: '浅色', dark: '深色' };
    this.setData({
      theme: effective,
      themeMode: mode,
      themeLabel: labelMap[mode] || '跟随系统'
    });
  },

  loadUserInfo() {
    try {
      var app = getApp();
      if (app.globalData && app.globalData.userInfo) {
        var rawId = app.globalData.userInfo.id || '';
        var shortId = rawId.indexOf('-') !== -1 ? rawId.slice(rawId.lastIndexOf('-') + 1) : rawId;
        this.setData({
          userInfo: {
            nickname: app.globalData.userInfo.nickname || '',
            userId: shortId,
            avatarUrl: app.globalData.userInfo.avatarUrl || ''
          }
        });
      }
    } catch (e) {}
  },

  onBack() {
    wx.navigateBack();
  },

  onEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit-profile/edit-profile'
    });
  },

  onSetting(e) {
    var action = e.currentTarget.dataset.action;
    if (action === 'theme') {
      this.showThemePicker();
      return;
    }
    const routes = {};
    const url = routes[action];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  /**
   * 主题选择弹窗（三态）
   */
  showThemePicker() {
    var self = this;
    var current = this.data.themeMode;
    var items = ['跟随系统', '浅色', '深色'];
    wx.showActionSheet({
      itemList: items,
      success: function (res) {
        var map = ['auto', 'light', 'dark'];
        var mode = map[res.tapIndex];
        if (mode && mode !== current) {
          var effective = theme.setTheme(mode);
          var labelMap = { auto: '跟随系统', light: '浅色', dark: '深色' };
          self.setData({
            themeMode: mode,
            themeLabel: labelMap[mode],
            theme: effective
          });
        }
      }
    });
  }
});