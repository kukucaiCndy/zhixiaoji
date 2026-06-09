var knowledgeApi = require('../../services/knowledge-api');
var { decorateIcon } = require('../../utils/icon-helper');

var CATEGORY_BG_COLORS = ['#EEF2FF', '#ECFEFF', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#E0F2FE', '#F0FDF4', '#FEF2F2'];

Page({
  data: {
    userName: '小明同学',
    userLevel: 'Lv.12 编程学徒',
    streakDays: 15,
    learnedCards: 128,
    accuracy: 86,
    points: 2560,
    categories: [],
    continueLearning: null
  },

  onLoad: function () {
    this.loadCategories();
  },

  onShow: function () {
    // 每次显示时刷新数据
    this.loadCategories();
  },

  loadCategories: function () {
    var self = this;
    knowledgeApi.listCategories({ status: 'visible' }).then(function (categories) {
      var processed = (categories || []).map(function (cat, i) {
        var item = {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || '📚',
          description: cat.description || '',
          bgColor: CATEGORY_BG_COLORS[i % CATEGORY_BG_COLORS.length],
          chapterCount: 0,
          sectionCount: 0,
          doneCount: 0,
          progressPercent: 0
        };
        decorateIcon(item, '📚');
        return item;
      });
      self.setData({ categories: processed });
    }).catch(function (err) {
      console.error('[Learn] Failed to load categories:', err);
    });
  },

  onSearch: function () {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  onCategoryTap: function (e) {
    var category = e.currentTarget.dataset.category;
    if (!category || !category.id) return;
    wx.navigateTo({
      url: '/pages/learn/categories/categories?id=' + category.id + '&name=' + encodeURIComponent(category.name)
    });
  },

  onTabChange: function (e) {
    // tab-bar 组件自动处理切换
  }
});