Page({
  data: {
    current: 0
  },

  onLoad() {
    const guideShown = wx.getStorageSync('guide_shown');
    if (guideShown) {
      wx.reLaunch({ url: '/pages/home/home' });
    }
  },

  onWechatLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.setStorageSync('token', 'mock_token_' + res.code);
          wx.setStorageSync('guide_shown', true);
          wx.setStorageSync('isLoggedIn', true);
          wx.reLaunch({ url: '/pages/home/home' });
        }
      }
    });
  },

  onGuestLogin() {
    wx.setStorageSync('guide_shown', true);
    wx.setStorageSync('isLoggedIn', false);
    wx.reLaunch({ url: '/pages/home/home' });
  },

  onTapAgreement() {
    wx.showToast({ title: '用户协议', icon: 'none' });
  },

  onTapPrivacy() {
    wx.showToast({ title: '隐私政策', icon: 'none' });
  }
});
