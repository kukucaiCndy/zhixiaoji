var theme = require('../../utils/theme');

Page({
  data: {
    theme: 'light',
    userInfo: { nickname: '', userId: '', avatar: '', points: 0 }
  },

  onLoad() {
    this.setData({ theme: theme.getEffectiveTheme() });
    this.loadUserProfile();
  },

  onShow() {
    this.setData({ theme: theme.getEffectiveTheme() });
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserData(app.globalData.userInfo);
    }
  },

  onThemeChange(effective) {
    this.setData({ theme: effective });
  },

  loadUserProfile() {
    var self = this;
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserData(app.globalData.userInfo);
    }
    app.loadUserInfo().then(function (user) {
      if (user) self.setUserData(user);
    });
  },

  setUserData(data) {
    var rawId = data.id || '';
    var shortId = rawId.indexOf('-') !== -1 ? rawId.slice(rawId.lastIndexOf('-') + 1) : rawId;
    this.setData({
      userInfo: {
        nickname: data.nickname || '',
        userId: shortId,
        avatar: data.avatarUrl || '',
        points: data.points || 0
      }
    });
  },

  onEditProfile() {
    wx.navigateTo({ url: '/pages/profile/edit-profile/edit-profile' });
  },

  onMenuItem(e) {
    var action = e.currentTarget.dataset.action;
    if (action === 'achievements') {
      wx.showToast({ title: '成就功能即将上线', icon: 'none' });
    } else if (action === 'favorites') {
      wx.showToast({ title: '收藏功能即将上线', icon: 'none' });
    }
  },

  onSetting(e) {
    var action = e.currentTarget.dataset.action;
    if (action === 'settings') {
      wx.navigateTo({ url: '/pages/profile/settings/settings' });
    } else if (action === 'about') {
      wx.showToast({ title: '知小记 v1.2.0', icon: 'none' });
    } else if (action === 'preferences') {
      wx.showToast({ title: '学习偏好设置', icon: 'none' });
    }
  },

  onTabChange() {}
});
