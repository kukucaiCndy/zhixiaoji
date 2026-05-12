var STORAGE_KEYS = require('../utils/constants').STORAGE_KEYS;

Page({
  data: {
    countdown: 5,
    timer: null
  },

  onLoad() {
    this.startCountdown();
  },

  onUnload() {
    this.clearTimer();
  },

  startCountdown() {
    this.data.timer = setInterval(() => {
      const count = this.data.countdown - 1;
      if (count <= 0) {
        this.clearTimer();
        this.goToNextPage();
      } else {
        this.setData({ countdown: count });
      }
    }, 1000);
  },

  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
  },

  onSkip() {
    this.clearTimer();
    this.goToNextPage();
  },

  onAdClick() {
    this.clearTimer();
    wx.showToast({ title: '跳转广告页面', icon: 'none' });
  },

  goToNextPage() {
    const guideShown = wx.getStorageSync(STORAGE_KEYS.GUIDE_SHOWN);
    
    if (!guideShown) {
      wx.reLaunch({ url: '/pages/auth/login-guide/login-guide' });
    } else {
      wx.reLaunch({ url: '/pages/home/home' });
    }
  }
});
