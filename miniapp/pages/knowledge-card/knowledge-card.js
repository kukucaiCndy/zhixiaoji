var knowledgeApi = require('../../services/knowledge-api');
var HTML_BASE = 'http://192.168.16.129:12302';

Page({
  data: {
    url: '',
    chapterId: '',
    currentLesson: 0,
    totalLessons: 0,
    statusBarHeight: 44,
    lessonDots: [],
    lessons: []
  },

  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    var chapterId = options.chapterId || '';
    var currentLesson = parseInt(options.currentLesson) || 0;

    this.setData({
      chapterId: chapterId,
      currentLesson: currentLesson,
      statusBarHeight: sysInfo.statusBarHeight || 44
    });

    if (chapterId) {
      this.loadLessons(chapterId, currentLesson);
    }
  },

  loadLessons(chapterId, currentLesson) {
    var self = this;
    knowledgeApi.listLessons({ chapterId: chapterId }).then(function (lessons) {
      if (lessons && lessons.length > 0) {
        var total = lessons.length;
        var idx = Math.min(currentLesson, total - 1);
        var lesson = lessons[idx];
        var htmlUrl = lesson.htmlUrl || '';

        var lessonDots = [];
        for (var i = 0; i < total; i++) {
          lessonDots.push(i);
        }

        self.setData({
          lessons: lessons,
          totalLessons: total,
          currentLesson: idx,
          lessonDots: lessonDots
        });

        if (htmlUrl) {
          self.buildUrl(htmlUrl, chapterId, idx, total);
        }
      } else {
        wx.showToast({ title: '暂无内容', icon: 'none' });
      }
    }).catch(function (err) {
      console.error('[KnowledgeCard] 加载课程失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  buildUrl(htmlUrl, chapterId, lessonIdx, total) {
    var url = htmlUrl;
    if (htmlUrl.indexOf('http') !== 0) {
      url = HTML_BASE + (htmlUrl.indexOf('/') === 0 ? '' : '/') + htmlUrl;
    }
    if (url.indexOf('?') === -1) {
      url += '?chapterId=' + chapterId + '&currentLesson=' + lessonIdx + '&totalLessons=' + total;
    }
    this.setData({ url: url });
  },

  switchLesson(idx) {
    if (!this.data.lessons.length) return;
    var lesson = this.data.lessons[idx];
    if (!lesson) return;
    var htmlUrl = lesson.htmlUrl || '';
    if (!htmlUrl) return;
    this.setData({ currentLesson: idx });
    this.buildUrl(htmlUrl, this.data.chapterId, idx, this.data.totalLessons);
  },

  onPrevLesson() {
    if (this.data.currentLesson <= 0) {
      wx.showToast({ title: '已是第一节', icon: 'none' });
      return;
    }
    this.switchLesson(this.data.currentLesson - 1);
  },

  onNextLesson() {
    if (this.data.currentLesson >= this.data.totalLessons - 1) {
      wx.showToast({ title: '已是最后一节', icon: 'none' });
      return;
    }
    this.switchLesson(this.data.currentLesson + 1);
  },

  onUnderstood() {
    wx.showToast({ title: '已标记为理解', icon: 'none' });
    console.log('[KnowledgeCard] 标记理解:', this.data.chapterId, this.data.currentLesson);
  },

  onHard() {
    wx.showToast({ title: '已标记为有点难', icon: 'none' });
    console.log('[KnowledgeCard] 标记困难:', this.data.chapterId, this.data.currentLesson);
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
      console.log('[WebView] 标记为理解:', msg.chapterId, msg.lessonIndex);
    } else if (action === 'markHard') {
      console.log('[WebView] 标记为有点难:', msg.chapterId, msg.lessonIndex);
    } else if (action === 'back') {
      wx.navigateBack({ delta: 1 });
    }
  }
});
