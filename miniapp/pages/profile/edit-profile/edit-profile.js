var authService = require('../../../services/auth-service');

var GENDER_MAP = { male: '男', female: '女', other: '保密' };
var GENDER_VALUES = { '男': 'male', '女': 'female', '保密': 'other' };

Page({
  data: {
    avatarLetter: 'J',
    nickname: '',
    bio: '',
    gender: '',
    genderDisplay: '',
    birthday: '',
    email: '',
    address: '',
    addressRegion: [],
    maxDate: '2099-12-31',
    saving: false,
    statusBarHeight: 0,
    navBarHeight: 0
  },

  onLoad() {
    this.initNavBar();
    this.loadUserInfo();
  },

  initNavBar() {
    var systemInfo = wx.getSystemInfoSync();
    var menuButton = wx.getMenuButtonBoundingClientRect();
    var statusBarHeight = systemInfo.statusBarHeight;
    var navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
    this.setData({
      statusBarHeight: statusBarHeight,
      navBarHeight: navBarHeight
    });
  },

  loadUserInfo() {
    var that = this;
    getApp().loadUserInfo().then(function (user) {
      if (user) {
        that.setData({
          avatarLetter: (user.nickname || 'J')[0],
          nickname: user.nickname || '',
          bio: user.bio || '',
          gender: user.gender || '',
          genderDisplay: GENDER_MAP[user.gender] || '',
          birthday: user.birthday || '',
          email: user.email || '',
          address: user.address || ''
        });
      }
    }).catch(function () {
      var userInfo = wx.getStorageSync('userInfo') || {};
      var oldGender = userInfo.gender || '';
      var genderValue = GENDER_VALUES[oldGender] || oldGender || '';
      that.setData({
        avatarLetter: (userInfo.nickname || 'J')[0],
        nickname: userInfo.nickname || '',
        bio: userInfo.bio || '',
        gender: genderValue,
        genderDisplay: GENDER_MAP[genderValue] || oldGender || '',
        birthday: userInfo.birthday || '',
        email: userInfo.email || '',
        address: userInfo.address || userInfo.location || ''
      });
    });
  },

  onChooseAvatar() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(chooseRes) {
        var tempPath = chooseRes.tempFilePaths[0];
        wx.showLoading({ title: '上传中...', mask: true });
        authService.uploadAvatar(tempPath).then(function (uploadRes) {
          wx.hideLoading();
          if (uploadRes.success) {
            that.setData({ avatarUrl: uploadRes.data.url });
            wx.showToast({ title: '头像已更新', icon: 'success' });
          } else {
            wx.showToast({ title: uploadRes.message || '上传失败', icon: 'none' });
          }
        }).catch(function () {
          wx.hideLoading();
          wx.showToast({ title: '头像上传失败', icon: 'none' });
        });
      }
    });
  },

  onEditNickname() {
    var that = this;
    wx.showModal({
      title: '修改昵称',
      content: '',
      editable: true,
      placeholderText: '请输入昵称',
      success(res) {
        if (res.confirm && res.content) {
          that.setData({ nickname: res.content, avatarLetter: res.content[0] });
        }
      }
    });
  },

  onEditBio() {
    var that = this;
    wx.showModal({
      title: '修改个性签名',
      content: '',
      editable: true,
      placeholderText: '一句话介绍自己',
      success(res) {
        if (res.confirm && res.content) {
          that.setData({ bio: res.content });
        }
      }
    });
  },

  onEditGender() {
    var that = this;
    wx.showActionSheet({
      itemList: ['男', '女', '保密'],
      success(res) {
        var options = ['男', '女', '保密'];
        var display = options[res.tapIndex];
        that.setData({
          genderDisplay: display,
          gender: GENDER_VALUES[display]
        });
      }
    });
  },

  onBirthdayChange(e) {
    this.setData({ birthday: e.detail.value });
  },

  onEditEmail() {
    var that = this;
    wx.showModal({
      title: '修改邮箱',
      content: '',
      editable: true,
      placeholderText: '请输入邮箱地址',
      success(res) {
        if (res.confirm && res.content) {
          that.setData({ email: res.content });
        }
      }
    });
  },

  onLocationChange(e) {
    var region = e.detail.value;
    var address = region[0].replace('省', '') + region[1].replace('市', '');
    this.setData({
      address: address,
      addressRegion: region
    });
  },

  onSave() {
    var that = this;
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...', mask: true });
    var userInfo = getApp().globalData.userInfo || {};
    var userId = userInfo.id || userInfo._id || userInfo.userId || '';
    if (!userId) {
      wx.hideLoading();
      that.setData({ saving: false });
      wx.showToast({ title: '用户信息异常，请重新登录', icon: 'none' });
      return;
    }
    var data = {
      nickname: that.data.nickname,
      bio: that.data.bio,
      gender: that.data.gender,
      birthday: that.data.birthday,
      email: that.data.email,
      address: that.data.address
    };
    authService.updateUser(userId, data).then(function (res) {
      wx.hideLoading();
      that.setData({ saving: false });
      if (res.success) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        getApp().loadUserInfo().then(function () {
          wx.navigateBack();
        });
      } else {
        wx.showToast({ title: res.message || '保存失败', icon: 'none' });
      }
    }).catch(function () {
      wx.hideLoading();
      that.setData({ saving: false });
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    });
  },

  onBack() {
    wx.navigateBack();
  }
});
