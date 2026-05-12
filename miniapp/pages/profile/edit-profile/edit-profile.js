var app = getApp();
var monkApi = require('../../../services/monk-api');
var authService = require('../../../services/auth-service');

Page({
  data: {
    avatarLetter: 'J',
    nickname: '',
    bio: '',
    gender: '',
    birthday: '',
    email: '',
    location: '',
    saving: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    var userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      avatarLetter: (userInfo.nickname || 'J')[0],
      nickname: userInfo.nickname || '',
      bio: userInfo.bio || '',
      gender: userInfo.gender || '',
      birthday: userInfo.birthday || '',
      email: userInfo.email || '',
      location: userInfo.location || ''
    });
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
        wx.showToast({ title: '头像已选择', icon: 'none' });
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
        that.setData({ gender: options[res.tapIndex] });
      }
    });
  },

  onEditBirthday() {
    var that = this;
    wx.showToast({ title: '请选择日期', icon: 'none' });
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

  onEditLocation() {
    var that = this;
    wx.showModal({
      title: '修改所在地',
      content: '',
      editable: true,
      placeholderText: '例如：广东深圳',
      success(res) {
        if (res.confirm && res.content) {
          that.setData({ location: res.content });
        }
      }
    });
  },

  onSave() {
    var that = this;
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...', mask: true });
    var userInfo = wx.getStorageSync('userInfo') || {};
    var data = {
      nickname: that.data.nickname,
      bio: that.data.bio,
      gender: that.data.gender,
      birthday: that.data.birthday,
      email: that.data.email,
      location: that.data.location
    };
    authService.updateUser(userInfo.id || '', data).then(function (res) {
      wx.hideLoading();
      that.setData({ saving: false });
      if (res.success) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(function () {
          wx.navigateBack();
        }, 1500);
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