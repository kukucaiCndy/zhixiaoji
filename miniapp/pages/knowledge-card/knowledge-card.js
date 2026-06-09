var knowledgeApi = require('../../services/knowledge-api');
var learningApi = require('../../services/learning-api');
var HTML_BASE = 'http://192.168.16.129:12302';

var STUDY_THRESHOLD_SECONDS = 90; // 学习完成阈值（秒）

Page({
  data: {
    url: '',
    chapterId: '',
    currentLesson: 0,
    totalLessons: 0,
    statusBarHeight: 44,
    lessonDots: [],
    lessons: [],
    loading: true,
    currentLessonId: '',
    studySeconds: 0,
    lessonLearned: false
  },

  // 学习计时器
  _studyTimer: null,
  _studyStartTime: 0,

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

  onUnload() {
    this.stopStudyTimer();
    // 离开时若有学习时长且未上报，上报
    if (this.data.studySeconds >= STUDY_THRESHOLD_SECONDS && !this.data.lessonLearned) {
      this.reportLearned();
    }
  },

  onHide() {
    this.stopStudyTimer();
  },

  onShow() {
    // 如果已经在学习且计时器已停止但未完成，恢复计时
    if (this.data.currentLessonId && !this._studyTimer && !this.data.lessonLearned) {
      this.startStudyTimer();
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
          currentLessonId: lesson.id || '',
          lessonDots: lessonDots,
          loading: false
        });

        if (htmlUrl) {
          self.buildUrl(htmlUrl, chapterId, idx, total);
          // 开始学习计时
          self.startStudyTimer();
        } else {
          console.log('[KnowledgeCard] htmlUrl is empty for lesson:', lesson);
          wx.showToast({ title: '该课程暂无可访问的页面', icon: 'none' });
        }
      } else {
        wx.showToast({ title: '暂无内容', icon: 'none' });
        self.setData({ loading: false });
      }
    }).catch(function (err) {
      console.error('[KnowledgeCard] 加载课程失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      self.setData({ loading: false });
    });
  },

  startStudyTimer() {
    var self = this;
    this.stopStudyTimer();
    this._studyStartTime = Date.now();
    this.setData({ studySeconds: 0, lessonLearned: false });

    this._studyTimer = setInterval(function () {
      var elapsed = Math.floor((Date.now() - self._studyStartTime) / 1000);
      self.setData({ studySeconds: elapsed });

      if (elapsed >= STUDY_THRESHOLD_SECONDS && !self.data.lessonLearned) {
        // 达到学习阈值，自动标记完成
        self.reportLearned();
        self.stopStudyTimer();
      }
    }, 1000);
  },

  stopStudyTimer() {
    if (this._studyTimer) {
      clearInterval(this._studyTimer);
      this._studyTimer = null;
    }
  },

  reportLearned() {
    var lessonId = this.data.currentLessonId;
    if (!lessonId || this.data.lessonLearned) return;

    var minutes = Math.ceil(this.data.studySeconds / 60) || 1;
    this.setData({ lessonLearned: true });

    learningApi.markLearned(lessonId, minutes).then(function () {
      console.log('[KnowledgeCard] 学习已上报:', lessonId, minutes + '分钟');
      wx.showToast({ title: '学习完成 ✓', icon: 'success', duration: 1500 });
    }).catch(function (err) {
      console.error('[KnowledgeCard] 上报学习失败:', err);
      // 上报失败不影响本地状态
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

    // 停止旧计时
    this.stopStudyTimer();

    // 如果上一课学够了但未上报，上报
    if (this.data.studySeconds >= STUDY_THRESHOLD_SECONDS && !this.data.lessonLearned) {
      this.reportLearned();
    }

    this.setData({
      currentLesson: idx,
      currentLessonId: lesson.id || '',
      studySeconds: 0,
      lessonLearned: false
    });

    this.buildUrl(htmlUrl, this.data.chapterId, idx, this.data.totalLessons);
    this.startStudyTimer();
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
    var lessonId = this.data.currentLessonId;
    if (!lessonId) return;

    this.stopStudyTimer();
    var minutes = Math.max(Math.ceil(this.data.studySeconds / 60), 1);

    this.setData({ lessonLearned: true });

    learningApi.markLearned(lessonId, minutes).then(function () {
      console.log('[KnowledgeCard] 标记理解已上报:', lessonId, minutes + '分钟');
      wx.showToast({ title: '已标记为理解', icon: 'success' });
    }).catch(function (err) {
      console.error('[KnowledgeCard] 标记理解上报失败:', err);
    });
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
      this.onUnderstood();
    } else if (action === 'markHard') {
      this.onHard();
    } else if (action === 'back') {
      wx.navigateBack({ delta: 1 });
    }
  }
});
