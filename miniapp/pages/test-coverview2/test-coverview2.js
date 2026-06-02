Page({
  data: {
    url: 'https://www.baidu.com',
    show: false
  },

  onReady() {
    // 延迟1秒弹出 cover-view 按钮，确保 web-view 加载完成
    var self = this;
    setTimeout(function () {
      self.setData({ show: true });
    }, 1000);
  },

  /** 测试 cover-view 的 bindtap 点击 */
  onCvTap1() {
    wx.showToast({ title: 'cover-view绑tap: 按钮1', icon: 'none' });
  },
  onCvTap2() {
    wx.showToast({ title: 'cover-view绑tap: 按钮2', icon: 'none' });
  },

  /** 测试 button 点击（文章建议用button代替cover-view点击） */
  onBtnTap() {
    wx.showToast({ title: 'button被点击了', icon: 'none' });
  }
});
