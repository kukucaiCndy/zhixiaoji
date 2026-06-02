var HTML_BASE = 'http://192.168.16.129:12302';

Page({
  data: {
    url: '',
    chapterId: '',
    currentSection: 0,
    totalSections: 0,
    statusBarHeight: 44,
    sectionDots: []
  },

  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    var statusBarHeight = sysInfo.statusBarHeight || 44;
    var htmlId = options.htmlId || '';
    var chapterId = options.chapterId || '';
    var currentSection = parseInt(options.currentSection) || 0;
    var totalSections = parseInt(options.totalSections) || 0;
    var sectionDots = [];
    for (var i = 0; i < totalSections; i++) {
      sectionDots.push(i);
    }

    this.setData({
      chapterId: chapterId,
      currentSection: currentSection,
      totalSections: totalSections,
      statusBarHeight: statusBarHeight,
      sectionDots: sectionDots
    });

    var url = HTML_BASE + '/html-pages/' + htmlId + '.html'
      + '?chapterId=' + chapterId
      + '&currentSection=' + currentSection
      + '&totalSections=' + totalSections;

    this.setData({ url: url });
  },

  onPrevCard() {
    if (this.data.currentSection <= 0) {
      wx.showToast({ title: '已是第一节', icon: 'none' });
      return;
    }
    var idx = this.data.currentSection - 1;
    this.setData({ currentSection: idx });
    this.reloadHtml(idx);
  },

  onNextCard() {
    if (this.data.currentSection >= this.data.totalSections - 1) {
      wx.showToast({ title: '已是最后一节', icon: 'none' });
      return;
    }
    var idx = this.data.currentSection + 1;
    this.setData({ currentSection: idx });
    this.reloadHtml(idx);
  },

  reloadHtml(sectionIdx) {
    var newUrl = this.data.url.replace(/currentSection=\d+/, 'currentSection=' + sectionIdx);
    this.setData({ url: newUrl });
  },

  onUnderstood() {
    wx.showToast({ title: '已标记为理解', icon: 'none' });
    console.log('[ActionBar] 标记理解:', this.data.chapterId, this.data.currentSection);
  },

  onHard() {
    wx.showToast({ title: '已标记为有点难', icon: 'none' });
    console.log('[ActionBar] 标记困难:', this.data.chapterId, this.data.currentSection);
  },

  onNote() {
    wx.navigateTo({ url: '/pages/note/note' });
  },

  onMessage(e) {
    var data = e.detail.data;
    if (!data || !data.length) return;
    var msg = data[data.length - 1];
    var action = msg.action;

    if (action === 'note') {
      wx.navigateTo({ url: '/pages/note/note' });
    } else if (action === 'markUnderstood') {
      console.log('[WebView] 标记为理解:', msg.chapterId, msg.sectionIndex);
    } else if (action === 'markHard') {
      console.log('[WebView] 标记为有点难:', msg.chapterId, msg.sectionIndex);
    } else if (action === 'back') {
      wx.navigateBack({ delta: 1 });
    }
  }
});
