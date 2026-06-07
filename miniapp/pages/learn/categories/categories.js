var knowledgeApi = require('../../../services/knowledge-api');

var CHAPTER_ICON_BG_COLORS = ['#EEF2FF', '#ECFEFF', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#E0F2FE', '#F0FDF4', '#FEF2F2'];

var CHAPTER_STATUS_MAP = {
  'studying': 'studying',
  'completed': 'completed',
  'locked': 'locked'
};

Page({
  data: {
    categoryId: '',
    categoryName: '',
    categoryIcon: '',
    categoryDesc: '',
    chapterCount: 0,
    sectionCount: 0,
    totalSummaryCount: 0,
    progressPercent: -1,
    chapters: [],
    loading: true,
    error: false,
    errorMsg: ''
  },

  onLoad: function (options) {
    var categoryId = options.id || '';
    var categoryName = options.name ? decodeURIComponent(options.name) : '分类详情';
    this.setData({
      categoryId: categoryId,
      categoryName: categoryName
    });
    this.loadCategoryDetail(categoryId);
  },

  loadCategoryDetail: function (categoryId) {
    var self = this;
    self.setData({ loading: true, error: false });
    knowledgeApi.getCategoryDetail(categoryId).then(function (data) {
      var chapters = (data.chapters || []).map(function (ch, i) {
        var total = ch.sectionCount || 0;
        var status = ch.status || 'studying';
        return {
          id: ch.id,
          title: ch.title,
          icon: '📖',
          iconBg: CHAPTER_ICON_BG_COLORS[i % CHAPTER_ICON_BG_COLORS.length],
          sortOrder: ch.sortOrder,
          sectionCount: total,
          sectionDoneCount: 0,
          summaryCount: 0,
          progressPercent: 0,
          status: status
        };
      });

      var chapterCount = data.chapterCount || chapters.length;
      var sectionCount = data.sectionCount || 0;

      self.setData({
        categoryIcon: data.icon || '📚',
        categoryDesc: data.difficulty ? (data.difficulty === 'beginner' ? '入门' : data.difficulty === 'intermediate' ? '进阶' : '高级') : '',
        chapterCount: chapterCount,
        sectionCount: sectionCount,
        totalSummaryCount: 0,
        progressPercent: -1,
        chapters: chapters,
        loading: false
      });
    }).catch(function (err) {
      console.error('[Categories] Failed to load:', err);
      self.setData({ loading: false, error: true, errorMsg: err.message || '加载失败' });
    });
  },

  onBack: function () {
    wx.navigateBack();
  },

  onChapterTap: function (e) {
    var chapter = e.currentTarget.dataset.chapter;
    if (!chapter || !chapter.id) return;
    wx.navigateTo({
      url: '/pages/learn/knowledge-chapters/knowledge-chapters?id=' + chapter.id
        + '&title=' + encodeURIComponent(chapter.title)
        + '&categoryName=' + encodeURIComponent(this.data.categoryName)
    });
  }
});