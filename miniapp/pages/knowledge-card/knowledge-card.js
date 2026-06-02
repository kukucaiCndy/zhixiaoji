var HTML_BASE = 'http://192.168.16.129:12302';

Page({
  data: {
    url: ''
  },

  onLoad(options) {
    var htmlId = options.htmlId || '';
    var chapterId = options.chapterId || '';
    var currentSection = options.currentSection || '0';
    var totalSections = options.totalSections || '0';

    var url = HTML_BASE + '/html-pages/' + htmlId + '.html'
      + '?chapterId=' + chapterId
      + '&currentSection=' + currentSection
      + '&totalSections=' + totalSections;

    this.setData({ url: url });
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
