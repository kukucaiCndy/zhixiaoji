Page({
  data: {
    hasUrl: false,
    url: '',
    statusBarHeight: 44
  },

  onLoad() {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onToggle() {
    if (this.data.hasUrl) {
      this.setData({ hasUrl: false, url: '' });
    } else {
      this.setData({ hasUrl: true, url: 'https://www.baidu.com' });
    }
  },

  onTap1() {
    wx.showToast({ title: '按钮1', icon: 'none' });
  },
  onTap2() {
    wx.showToast({ title: '按钮2', icon: 'none' });
  },
  onTap3() {
    wx.showToast({ title: '按钮3', icon: 'none' });
  }
});
