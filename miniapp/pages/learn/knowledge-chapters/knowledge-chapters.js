var knowledgeApi = require('../../../services/knowledge-api');
var { decorateIcon } = require('../../../utils/icon-helper');

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
    loading: true
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
          unlockPoints: ch.unlockPoints || 0
        };
      });

      var iconHelper = require('../../../utils/icon-helper');
      var subjectIcon = data.icon || '📖';
      var subjectIconType = iconHelper.iconType(subjectIcon);
      if (subjectIconType === 'svg') {
        subjectIcon = iconHelper.svgToDataUri(subjectIcon);
        subjectIconType = 'image';
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
        loading: false
      });
    }).catch(function (err) {
      console.error('[KnowledgeChapters] Failed to load:', err);
      self.setData({ loading: false });
    });
  },

  onBack: function () {
    wx.navigateBack();
  },

  onChapterTap: function (e) {
    var chapter = e.currentTarget.dataset.chapter;
    var index = e.currentTarget.dataset.index;
    if (!chapter || !chapter.id) return;
    // 跳转到课程学习页面
    wx.navigateTo({
      url: '/pages/knowledge-card/knowledge-card?chapterId=' + chapter.id
        + '&currentLesson=' + (typeof index === 'number' ? index : 0)
    });
  }
});