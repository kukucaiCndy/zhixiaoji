var STORAGE_KEYS = require('../../utils/constants').STORAGE_KEYS;
var theme = require('../../utils/theme');

Page({
  data: {
    theme: 'light',
    loadProgress: 0
  },

  _timer: null,

  onLoad() {
    this.setData({ theme: theme.getEffectiveTheme() });
    this.animateLoad();
  },

  onThemeChange(effective) {
    this.setData({ theme: effective });
  },

  animateLoad() {
    var self = this;
    var progress = 0;
    self._timer = setInterval(function () {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(self._timer);
        self.setData({ loadProgress: 100 });
        setTimeout(function () {
          self.navigateNext();
        }, 300);
      } else {
        self.setData({ loadProgress: Math.min(progress, 100) });
      }
    }, 200);
  },

  navigateNext() {
    var guideShown = false;
    try { guideShown = wx.getStorageSync(STORAGE_KEYS.GUIDE_SHOWN); } catch (e) {}
    if (guideShown) {
      wx.reLaunch({ url: '/pages/home/home' });
    } else {
      wx.reLaunch({ url: '/pages/auth/login-guide/login-guide' });
    }
  }
});
