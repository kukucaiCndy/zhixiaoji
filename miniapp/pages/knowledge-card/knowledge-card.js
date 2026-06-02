var { knowledge } = require('../../services/api-client');
var HTML_BASE = 'http://192.168.16.129:12302';

Page({
  data: {
    url: '',
    chapterId: '',
    currentSection: 0,
    totalSections: 0,
    statusBarHeight: 44,
    sectionDots: [],
    sections: []
  },

  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    var chapterId = options.chapterId || '';
    var currentSection = parseInt(options.currentSection) || 0;

    this.setData({
      chapterId: chapterId,
      currentSection: currentSection,
      statusBarHeight: sysInfo.statusBarHeight || 44
    });

    if (chapterId) {
      this.loadSections(chapterId, currentSection);
    }
  },

  loadSections(chapterId, currentSection) {
    var self = this;
    knowledge.listSections({ chapterId: chapterId }).then(function (res) {
      if (res.code === 0 && res.data && res.data.length > 0) {
        var sections = res.data;
        var total = sections.length;
        var idx = Math.min(currentSection, total - 1);
        var section = sections[idx];
        var htmlUrl = section.htmlUrl || '';

        var sectionDots = [];
        for (var i = 0; i < total; i++) {
          sectionDots.push(i);
        }

        self.setData({
          sections: sections,
          totalSections: total,
          currentSection: idx,
          sectionDots: sectionDots
        });

        if (htmlUrl) {
          self.buildUrl(htmlUrl, chapterId, idx, total);
        }
      } else {
        wx.showToast({ title: '暂无内容', icon: 'none' });
      }
    }).catch(function (err) {
      console.error('[KnowledgeCard] 加载章节失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  buildUrl(htmlUrl, chapterId, sectionIdx, total) {
    var url = htmlUrl;
    if (htmlUrl.indexOf('http') !== 0) {
      url = HTML_BASE + (htmlUrl.indexOf('/') === 0 ? '' : '/') + htmlUrl;
    }
    if (url.indexOf('?') === -1) {
      url += '?chapterId=' + chapterId + '&currentSection=' + sectionIdx + '&totalSections=' + total;
    }
    this.setData({ url: url });
  },

  switchSection(idx) {
    if (!this.data.sections.length) return;
    var section = this.data.sections[idx];
    if (!section) return;
    var htmlUrl = section.htmlUrl || '';
    if (!htmlUrl) return;
    this.setData({ currentSection: idx });
    this.buildUrl(htmlUrl, this.data.chapterId, idx, this.data.totalSections);
  },

  onPrevCard() {
    if (this.data.currentSection <= 0) {
      wx.showToast({ title: '已是第一节', icon: 'none' });
      return;
    }
    this.switchSection(this.data.currentSection - 1);
  },

  onNextCard() {
    if (this.data.currentSection >= this.data.totalSections - 1) {
      wx.showToast({ title: '已是最后一节', icon: 'none' });
      return;
    }
    this.switchSection(this.data.currentSection + 1);
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
