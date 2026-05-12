var authService = require('../../../services/auth-service');
var storage = require('../../../utils/storage');
var STORAGE_KEYS = require('../../../utils/constants').STORAGE_KEYS;

Page({
  data: {
    current: 0,
    logging: false,
    // 授权弹窗相关
    showAuthModal: false,
    avatarUrl: '',
    nickname: '',
    canConfirm: false,
    tempCode: '' // 存储微信登录临时 code
  },

  onLoad() {
    var guideShown = wx.getStorageSync(STORAGE_KEYS.GUIDE_SHOWN);
    if (guideShown) {
      this.goHome();
    }
  },

  // 点击微信登录按钮 - 触发 chooseAvatar
  onChooseAvatar(e) {
    // 获取临时头像 URL
    const avatarUrl = e.detail.avatarUrl;
    this.setData({
      avatarUrl: avatarUrl,
      showAuthModal: true
    });
    
    // 先获取微信登录 code
    this.getWxLoginCode();
  },

  // 获取微信登录 code
  getWxLoginCode() {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          that.setData({ tempCode: res.code });
        }
      }
    });
  },

  // 弹窗内选择头像
  onAvatarChange(e) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({
      avatarUrl: avatarUrl
    });
    this.checkCanConfirm();
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    });
    this.checkCanConfirm();
  },

  // 检查是否可以确认
  checkCanConfirm() {
    const { nickname, avatarUrl } = this.data;
    this.setData({
      canConfirm: nickname.trim().length > 0 || avatarUrl.length > 0
    });
  },

  // 确认授权
  onConfirmAuth() {
    const { nickname, avatarUrl, tempCode } = this.data;
    
    if (!nickname.trim() && !avatarUrl) {
      wx.showToast({ title: '请至少填写一项', icon: 'none' });
      return;
    }

    this.setData({ logging: true, showAuthModal: false });
    this.doLogin(tempCode, nickname.trim(), avatarUrl);
  },

  // 跳过授权
  onSkipAuth() {
    const { tempCode } = this.data;
    this.setData({ showAuthModal: false, logging: true });
    // 跳过时不传昵称和头像，后端会使用默认值
    this.doLogin(tempCode, '', '');
  },

  // 关闭弹窗
  onCloseAuth() {
    this.setData({ showAuthModal: false });
  },

  // 执行登录
  doLogin(code, nickname, avatarUrl) {
    var that = this;

    if (!code) {
      // 如果没有 code，重新获取
      wx.login({
        success: function (res) {
          if (res.code) {
            that.processLogin(res.code, nickname, avatarUrl);
          } else {
            that.setData({ logging: false });
            wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
          }
        },
        fail: function () {
          that.setData({ logging: false });
          wx.showToast({ title: '微信登录失败', icon: 'none' });
        }
      });
    } else {
      this.processLogin(code, nickname, avatarUrl);
    }
  },

  // 处理登录流程
  processLogin(code, nickname, avatarUrl) {
    var that = this;
    
    // 构建登录数据
    var loginData = { code: code };
    if (nickname) loginData.nickname = nickname;
    if (avatarUrl) loginData.avatar = avatarUrl;

    authService.miniappLogin(code).then(function (result) {
      if (result.success) {
        if (nickname) {
          var userInfo = storage.getUserInfo();
          var userId = userInfo && userInfo.id;
          if (userId) {
            return authService.updateUser(userId, { nickname: nickname });
          }
        }
        return { success: true };
      }
      return result;
    }).then(function (updateResult) {
      that.setData({ logging: false });
      if (updateResult.success) {
        wx.setStorageSync(STORAGE_KEYS.GUIDE_SHOWN, true);
        getApp().loadUserInfo().then(function () {
          that.goHome();
        });
      } else {
        wx.showToast({ title: updateResult.message || '登录失败', icon: 'none' });
      }
    }).catch(function () {
      that.setData({ logging: false });
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    });
  },

  onGuestLogin() {
    wx.setStorageSync(STORAGE_KEYS.GUIDE_SHOWN, true);
    var guestInfo = { nickname: '游客', isGuest: true };
    getApp().setUserInfo(guestInfo);
    this.goHome();
  },

  goHome() {
    wx.reLaunch({ url: '/pages/home/home' });
  },

  onTapAgreement() {
    wx.showToast({ title: '用户协议', icon: 'none' });
  },

  onTapPrivacy() {
    wx.showToast({ title: '隐私政策', icon: 'none' });
  }
});
