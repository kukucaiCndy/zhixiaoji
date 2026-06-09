var knowledgeApi = require('../../../services/knowledge-api');

var CHAPTER_ICON_BG_COLORS = ['#EEF2FF', '#ECFEFF', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#E0F2FE', '#F0FDF4', '#FEF2F2'];

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
    this.loadSubjectDetail(subjectId);
  },

  loadSubjectDetail: function (subjectId) {
    var self = this;
    self.setData({ loading: true });
    knowledgeApi.getKnowledgeChapterDetail(subjectId).then(function (data) {
      var chapters = (data.chapters || []).map(function (ch, i) {
        return {
          id: ch.id,
          title: ch.title,
          sortOrder: ch.sortOrder,
          unlockPoints: ch.unlockPoints || 0,
          expanded: false,
          lessons: [],
          lessonsLoading: false,
          progressPercent: 0
        };
      });

      var iconHelper = require('../../../utils/icon-helper');
      var subjectIcon = data.icon || '📖';
      var subjectIconType = iconHelper.iconType(subjectIcon);
      if (subjectIconType === 'svg') {
        subjectIcon = iconHelper.svgToDataUri(subjectIcon);
        subjectIconType = 'image';
      }

      // 默认展开第一个章节
      var lastStudiedChapterId = '';
      if (chapters.length > 0) {
        chapters[0].expanded = true;
        lastStudiedChapterId = chapters[0].id;
        // 加载第一个章节的课程列表
        self.loadLessonsForChapter(chapters[0], 0);
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
    }).catch(function (err) {
      console.error('[KnowledgeChapters] Failed to load:', err);
      self.setData({ loading: false });
    });
  },

  loadLessonsForChapter: function (chapter, index) {
    var self = this;
    var chapters = this.data.chapters;
    chapters[index].lessonsLoading = true;
    self.setData({ chapters: chapters });

    knowledgeApi.listLessons({ chapterId: chapter.id }).then(function (lessons) {
      chapters[index].lessons = (lessons || []).map(function (ls, li) {
        return {
          id: ls.id,
          title: ls.title,
          number: ls.number || (li + 1),
          sortOrder: ls.sortOrder,
          unlockPoints: ls.unlockPoints || 0
        };
      });
      chapters[index].lessonsLoading = false;
      chapters[index].progressPercent = 100;
      self.setData({ chapters: chapters });
    }).catch(function (err) {
      console.error('[KnowledgeChapters] Failed to load lessons:', err);
      chapters[index].lessonsLoading = false;
      self.setData({ chapters: chapters });
    });
  },

  onChapterTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var chapters = this.data.chapters;
    var chapter = chapters[index];
    if (!chapter) return;

    // 如果已展开则折叠，否则展开
    var willExpand = !chapter.expanded;

    // 折叠所有其他章节
    for (var i = 0; i < chapters.length; i++) {
      if (i !== index) {
        chapters[i].expanded = false;
      }
    }

    chapter.expanded = willExpand;

    // 如果展开且未加载过课程，则加载
    if (willExpand && chapter.lessons.length === 0) {
      this.loadLessonsForChapter(chapter, index);
    }

    this.setData({ chapters: chapters });
  },

  onLessonTap: function (e) {
    var chapterId = e.currentTarget.dataset.chapterId;
    var lessonIndex = e.currentTarget.dataset.lessonIndex;
    if (!chapterId) return;
    wx.navigateTo({
      url: '/pages/knowledge-card/knowledge-card?chapterId=' + chapterId
        + '&currentLesson=' + (typeof lessonIndex === 'number' ? lessonIndex : 0)
    });
  },

  onBack: function () {
    wx.navigateBack();
  }
});
