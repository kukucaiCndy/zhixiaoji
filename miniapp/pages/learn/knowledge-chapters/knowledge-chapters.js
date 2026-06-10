var knowledgeApi = require('../../../services/knowledge-api');
var progressStore = require('../../../utils/progress-store');

var CHAPTER_ICON_BG_COLORS = ['#EEF2FF', '#ECFEFF', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#E0F2FE', '#F0FDF4', '#FEF2F2'];
var CHAPTER_LOCKED_BG = '#F1F5F9';

Page({
  data: {
    subjectId: '',
    subjectTitle: '',
    subjectIcon: '📖',
    subjectIconType: 'emoji',
    subjectIconBg: '#EEF2FF',
    subjectDesc: '',
    subjectGoal: '',
    categoryName: '',
    chapterCount: 0,
    chapters: [],
    loading: true,
    lastStudiedChapterId: ''
  },

  onLoad: function (options) {
    var sysInfo = wx.getSystemInfoSync();
    var subjectId = options.id || '';
    var subjectTitle = options.title ? decodeURIComponent(options.title) : '科目';
    var categoryName = options.categoryName ? decodeURIComponent(options.categoryName) : '';
    this.setData({
      subjectId: subjectId,
      subjectTitle: subjectTitle,
      categoryName: categoryName,
      statusBarHeight: sysInfo.statusBarHeight || 44
    });
    this._loaded = false;
    this.loadSubjectDetail(subjectId);
  },

  onShow: function () {
    // 首次加载由 onLoad 处理
    if (!this._loaded) return;
    // 从 webview 返回后，刷新锁定状态和进度
    this.refreshLocksAndProgress();
  },

  refreshLocksAndProgress: function () {
    var chapters = this.data.chapters;
    if (!chapters || chapters.length === 0) return;

    // 重新计算章节锁定
    chapters = progressStore.computeChapterLocks(chapters);

    // 对每个已加载课程的章节，重新计算课程锁定和进度
    for (var i = 0; i < chapters.length; i++) {
      var ch = chapters[i];
      if (ch.lessons && ch.lessons.length > 0 && !ch.lessonsLoading) {
        ch.lessons = progressStore.computeLessonLocks(ch.lessons);
        var completedCount = 0;
        for (var j = 0; j < ch.lessons.length; j++) {
          if (progressStore.isLessonCompleted(ch.lessons[j].id)) completedCount++;
        }
        ch.progressPercent = Math.round(completedCount / ch.lessons.length * 100);
      }
    }

    this.setData({ chapters: chapters });
  },

  loadSubjectDetail: function (subjectId) {
    var self = this;
    self.setData({ loading: true });
    knowledgeApi.getKnowledgeChapterDetail(subjectId).then(function (data) {
      var chapters = (data.chapters || []).map(function (ch, i) {
        return {
          id: ch.id,
          title: ch.title,
          description: ch.description || '',
          goal: ch.goal || '',
          sortOrder: ch.sortOrder,
          unlockPoints: ch.unlockPoints || 0,
          expanded: false,
          lessons: [],
          lessonsLoading: false,
          progressPercent: 0,
          locked: false
        };
      });

      var iconHelper = require('../../../utils/icon-helper');
      var subjectIcon = data.icon || '📖';
      var subjectIconType = iconHelper.iconType(subjectIcon);
      if (subjectIconType === 'svg') {
        subjectIcon = iconHelper.svgToDataUri(subjectIcon);
        subjectIconType = 'image';
      }

      // 默认展开第一个未锁定的章节
      var lastStudiedChapterId = '';
      for (var i = 0; i < chapters.length; i++) {
        if (!chapters[i].locked) {
          chapters[i].expanded = true;
          lastStudiedChapterId = chapters[i].id;
          break;
        }
      }

      self.setData({
        subjectTitle: data.name || self.data.subjectTitle,
        subjectIcon: subjectIcon,
        subjectIconType: subjectIconType,
        subjectIconBg: CHAPTER_ICON_BG_COLORS[(data.sortOrder || 0) % CHAPTER_ICON_BG_COLORS.length],
        subjectDesc: data.description || '',
        categoryName: self.data.categoryName || data.categoryId || '',
        chapterCount: data.chapters ? data.chapters.length : chapters.length,
        chapters: chapters,
        lastStudiedChapterId: lastStudiedChapterId,
        loading: false
      });

      self._loaded = true;

      // 加载第一个未锁定章节的课程
      if (lastStudiedChapterId) {
        var firstUnlockedIdx = 0;
        for (i = 0; i < chapters.length; i++) {
          if (!chapters[i].locked) {
            firstUnlockedIdx = i;
            break;
          }
        }
        self.loadLessonsForChapter(chapters[firstUnlockedIdx], firstUnlockedIdx);
      }
    }).catch(function (err) {
      console.error('[KnowledgeChapters] Failed to load:', err);
      self.setData({ loading: false });
    });
  },

  loadLessonsForChapter: function (chapter, index) {
    var self = this;
    self.setData({
      ['chapters[' + index + '].lessonsLoading']: true
    });

    knowledgeApi.listLessons({ chapterId: chapter.id }).then(function (lessons) {
      var lessonsData = (lessons || []).map(function (ls, li) {
        return {
          id: ls.id,
          title: ls.title,
          number: ls.number || (li + 1),
          sortOrder: ls.sortOrder,
          unlockPoints: ls.unlockPoints || 0,
          locked: false
        };
      });

      // 计算课程锁定状态
      lessonsData = progressStore.computeLessonLocks(lessonsData);

      // 计算章节进度（完成课程数 / 总课程数）
      var completedCount = 0;
      for (var i = 0; i < lessonsData.length; i++) {
        if (progressStore.isLessonCompleted(lessonsData[i].id)) {
          completedCount++;
        }
      }
      var progressPercent = lessonsData.length > 0 ? Math.round(completedCount / lessonsData.length * 100) : 0;

      self.setData({
        ['chapters[' + index + '].lessons']: lessonsData,
        ['chapters[' + index + '].lessonsLoading']: false,
        ['chapters[' + index + '].progressPercent']: progressPercent
      });

      // 重新计算所有章节的锁定状态并回写
      var chapters = self.data.chapters;
      progressStore.computeChapterLocks(chapters);
      self.setData({ chapters: chapters });
    }).catch(function (err) {
      console.error('[KnowledgeChapters] Failed to load lessons:', err);
      self.setData({
        ['chapters[' + index + '].lessonsLoading']: false
      });
    });
  },

  onChapterTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var chapters = this.data.chapters;
    var chapter = chapters[index];
    if (!chapter) return;

    // 锁定的章节不可展开
    if (chapter.locked) {
      wx.showToast({ title: '请先完成上一章', icon: 'none' });
      return;
    }

    var willExpand = !chapter.expanded;

    // 折叠所有其他章节
    for (var i = 0; i < chapters.length; i++) {
      if (i !== index) {
        chapters[i].expanded = false;
      }
    }
    chapter.expanded = willExpand;

    this.setData({ chapters: chapters });

    // 如果展开且未加载过课程，则加载
    if (willExpand && chapter.lessons.length === 0) {
      this.loadLessonsForChapter(chapter, index);
    }
  },

  onLessonTap: function (e) {
    var chapterId = e.currentTarget.dataset.chapterId;
    var lessonIndex = e.currentTarget.dataset.lessonIndex;
    var chapterIndex = e.currentTarget.dataset.chapterIndex;
    if (!chapterId) return;

    var chapters = this.data.chapters;
    var chapter = chapters[chapterIndex];
    if (!chapter || !chapter.lessons || !chapter.lessons[lessonIndex]) return;

    var lesson = chapter.lessons[lessonIndex];
    if (lesson.locked) {
      wx.showToast({ title: '请先完成前一节', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: '/pages/knowledge-card/knowledge-card?chapterId=' + chapterId
        + '&currentLesson=' + (typeof lessonIndex === 'number' ? lessonIndex : 0)
    });
  },

  onBack: function () {
    wx.navigateBack();
  }
});
