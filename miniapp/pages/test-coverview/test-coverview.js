Page({
  data: {
    url: 'http://192.168.16.129:12302'
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
