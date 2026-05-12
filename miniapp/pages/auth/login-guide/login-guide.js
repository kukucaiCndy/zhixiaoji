var authService = require('../../services/auth-service');
var STORAGE_KEYS = require('../../utils/constants').STORAGE_KEYS;

Page({
  data: {
    current: 0,
    logging: false
  },

  onLoad() {
    var guideShown = wx.getStorageSync(STORAGE_KEYS.GUIDE_SHOWN);
    if (guideShown) {
      this.goHome();
    }
  },

  onWechatLogin() {
    var that = this;
    this.setData({ logging: true });

    wx.login({
      success: function (res) {
        if (res.code) {
          authService.miniappLogin(res.code).then(function (result) {
            that.setData({ logging: false });
            if (result.success) {
              wx.setStorageSync(STORAGE_KEYS.GUIDE_SHOWN, true);
              that.goHome();
            } else {
              wx.showToast({ title: result.message || '登录失败', icon: 'none' });
            }
          }).catch(function () {
            that.setData({ logging: false });
            wx.showToast({ title: '网络异常，请重试', icon: 'none' });
          });
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
  },

  onGuestLogin() {
    wx.setStorageSync(STORAGE_KEYS.GUIDE_SHOWN, true);
    wx.setStorageSync(STORAGE_KEYS.USER_INFO, {
      nickname: '游客',
      isGuest: true
    });
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