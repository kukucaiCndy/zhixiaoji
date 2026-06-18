var knowledgeApi = require('../../../services/knowledge-api');
var { decorateIcon } = require('../../../utils/icon-helper');
var theme = require('../../../utils/theme');

var CHAPTER_ICON_BG_COLORS = ['#2D3E5F', '#B45309', '#4B5563', '#7C3AED', '#059669', '#DC2626', '#C8B496', '#2563EB', '#D97706', '#0891B2'];

var SUBJECT_STATUS_MAP = {
  'published': 'studying',
  'draft': 'locked'
};

Page({
  data: {
    theme: 'light',
    categoryId: '',
    categoryName: '',
    categoryIcon: '',
    categoryIconType: 'emoji',
    categoryDesc: '',
    subjectCount: 0,
    chapters: [],
    loading: true,
    error: false,
    errorMsg: ''
  },

  onLoad: function (options) {
    this.setData({ theme: theme.getEffectiveTheme() });
    var categoryId = options.id || '';
    var categoryName = options.name ? decodeURIComponent(options.name) : '分类详情';

    this.setData({
      categoryId: categoryId,
      categoryName: categoryName
    });
    this.loadCategoryDetail(categoryId);
  },

  onShow: function () {
    this.setData({ theme: theme.getEffectiveTheme() });
  },

  onThemeChange: function (effective) {
    this.setData({ theme: effective });
  },

  loadCategoryDetail: function (categoryId) {
    var self = this;
    self.setData({ loading: true, error: false });
    knowledgeApi.getCategoryDetail(categoryId).then(function (data) {
      var chapters = (data.subjects || []).map(function (subj, i) {
        var item = {
          id: subj.id,
          title: subj.name,
          icon: subj.icon || '📖',
          iconBg: CHAPTER_ICON_BG_COLORS[i % CHAPTER_ICON_BG_COLORS.length],
          sortOrder: subj.sortOrder,
          sectionCount: 0,
          summaryCount: 0,
          progressPercent: 0,
          status: SUBJECT_STATUS_MAP[subj.status] || 'locked'
        };
        decorateIcon(item, '📖');
        return item;
      });

      var iconHelper = require('../../../utils/icon-helper');
      var bannerIcon = data.icon || '📚';
      var bannerType = iconHelper.iconType(bannerIcon);
      if (bannerType === 'svg') {
        bannerIcon = iconHelper.svgToDataUri(bannerIcon);
        bannerType = 'image';
      }

      self.setData({
        categoryIcon: bannerIcon,
        categoryIconType: bannerType,
        categoryDesc: data.description || '',
        subjectCount: chapters.length,
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