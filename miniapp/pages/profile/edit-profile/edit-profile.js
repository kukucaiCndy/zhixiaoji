var app = getApp();
var monkApi = require('../../../services/monk-api');

Page({
  data: {
    statusBarHeight: 20,
    avatarUrl: '',
    nickname: '',
    bio: '',
    saving: false
  },

  onLoad() {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight
    });
    this.loadUserInfo();
  },

  loadUserInfo() {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || '',
        nickname: userInfo.nickname || '',
        bio: userInfo.bio || ''
      });
    }
  },

  onChooseAvatar() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var tempPath = res.tempFilePaths[0];
        that.setData({ avatarUrl: tempPath });
      }
    });
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  onBioInput(e) {
    this.setData({ bio: e.detail.value });
  },

  onSave() {
    var that = this;
    var nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (nickname.length > 20) {
      wx.showToast({ title: '昵称不能超过20个字符', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...', mask: true });
    var userInfo = wx.getStorageSync('userInfo') || {};
    var userId = userInfo.id || '';
    monkApi.auth.updateProfile(userId, {
      nickname: nickname,
      avatarUrl: that.data.avatarUrl
    }).then(function (res) {
      wx.hideLoading();
      that.setData({ saving: false });
      if (res.code === 0) {
        var updatedInfo = Object.assign({}, userInfo, {
          nickname: nickname,
          avatarUrl: that.data.avatarUrl
        });
        wx.setStorageSync('userInfo', updatedInfo);
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(function () {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '保存失败', icon: 'none' });
      }
    }).catch(function (err) {
      wx.hideLoading();
      that.setData({ saving: false });
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      console.error('Update profile error:', err);
    });
  },

  onBack() {
    wx.navigateBack();
  }
});
