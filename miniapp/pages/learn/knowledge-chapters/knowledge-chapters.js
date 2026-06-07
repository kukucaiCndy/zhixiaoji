var knowledgeApi = require('../../../services/knowledge-api');

var CHAPTER_ICON_BG_COLORS = ['#EEF2FF', '#ECFEFF', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#E0F2FE', '#F0FDF4', '#FEF2F2'];

var STATUS_LABEL_MAP = {
  'completed': '✅ 已完成',
  'studying': '🔄 学习中',
  'locked': '🔒 未解锁'
};

var STATUS_TEXT_MAP = {
  'completed': '已完成',
  'studying': '学习中',
  'locked': '需解锁'
};

Page({
  data: {
    chapterId: '',
    chapterTitle: '',
    chapterIcon: '📖',
    chapterIconBg: '#EEF2FF',
    chapterDesc: '',
    chapterGoal: '',
    categoryName: '',
    sectionCount: 0,
    totalCardCount: 0,
    sectionDoneCount: 0,
    progressPercent: 0,
    sections: [],
    loading: true
  },

  onLoad: function (options) {
    var chapterId = options.id || '';
    var chapterTitle = options.title ? decodeURIComponent(options.title) : '知识章节';
    var categoryName = options.categoryName ? decodeURIComponent(options.categoryName) : '';
    this.setData({
      chapterId: chapterId,
      chapterTitle: chapterTitle,
      categoryName: categoryName
    });
    this.loadChapterDetail(chapterId);
  },

  loadChapterDetail: function (chapterId) {
    var self = this;
    self.setData({ loading: true });
    knowledgeApi.getKnowledgeChapterDetail(chapterId).then(function (data) {
      var sections = (data.sections || []).map(function (sec) {
        var status = sec.status || 'locked';
        return {
          id: sec.id,
          title: sec.title,
          sortOrder: sec.sortOrder,
          cardCount: sec.cardCount || 0,
          status: status,
          statusText: STATUS_TEXT_MAP[status] || '未知',
          statusLabel: STATUS_LABEL_MAP[status] || status,
          knowledgePoint: sec.knowledgePoint || ''
        };
      });

      var doneCount = sections.filter(function (s) { return s.status === 'completed'; }).length;
      var total = sections.length;
      var totalCardCount = sections.reduce(function (sum, s) {
        return sum + (s.cardCount || 0);
      }, 0);

      self.setData({
        chapterTitle: data.title || self.data.chapterTitle,
        chapterIcon: data.icon || '📖',
        chapterIconBg: CHAPTER_ICON_BG_COLORS[(data.sortOrder || 0) % CHAPTER_ICON_BG_COLORS.length],
        chapterDesc: data.description || '',
        chapterGoal: data.goal || '',
        categoryName: self.data.categoryName || data.knowledgeSystemId || '',
        sectionCount: data.sectionCount || total,
        totalCardCount: totalCardCount,
        sectionDoneCount: data.sectionDoneCount || doneCount,
        progressPercent: total > 0 ? Math.round(doneCount / total * 100) : 0,
        sections: sections,
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

  onSectionTap: function (e) {
    var section = e.currentTarget.dataset.section;
    var index = e.currentTarget.dataset.index;
    if (!section || !section.id) return;
    if (section.status === 'locked') {
      wx.showToast({ title: '请先完成前面的章节', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/knowledge-card/knowledge-card?chapterId=' + this.data.chapterId
        + '&currentSection=' + (typeof index === 'number' ? index : 0)
    });
  }
});