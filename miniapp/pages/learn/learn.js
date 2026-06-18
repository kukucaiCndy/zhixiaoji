var knowledgeApi = require('../../services/knowledge-api');
var theme = require('../../utils/theme');

Page({
  data: {
    theme: 'light',
    weekDays: [],
    courses: []
  },

  onLoad: function () {
    this.setData({ theme: theme.getEffectiveTheme() });
    this.initWeekDays();
    this.loadData();
  },

  onShow: function () {
    this.setData({ theme: theme.getEffectiveTheme() });
    this.loadData();
  },

  onThemeChange: function (effective) {
    this.setData({ theme: effective });
  },

  initWeekDays: function () {
    var labels = ['一', '二', '三', '四', '五', '六', '日'];
    var today = new Date().getDay(); // 0=Sun, 1=Mon...
    var todayIndex = today === 0 ? 6 : today - 1; // Make Mon=0
    var days = [];
    for (var i = 0; i < 7; i++) {
      days.push({
        label: labels[i],
        active: i < todayIndex,
        today: i === todayIndex
      });
    }
    this.setData({ weekDays: days });
  },

  loadData: function () {
    var self = this;
    knowledgeApi.listCategories({ status: 'visible' }).then(function (categories) {
      var courses = (categories || []).map(function (cat, i) {
        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || '📚',
          iconBg: i % 5,
          currentChapter: cat.doneCount ? cat.doneCount + 1 : 1,
          totalChapters: cat.chapterCount || 8,
          percent: cat.progressPercent || Math.floor(Math.random() * 60 + 20)
        };
      }).slice(0, 3);
      self.setData({ courses: courses });
    }).catch(function (err) {
      console.error('[Learn] loadData failed:', err);
    });
  },

  onCourseTap: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name || '';
    if (!id) return;
    wx.navigateTo({ url: '/pages/learn/categories/categories?id=' + id + '&name=' + encodeURIComponent(name) });
  },

  onBrowseAll: function () {
    wx.navigateTo({ url: '/pages/learn/categories/categories' });
  },

  onTabChange: function () {
    // tab-bar 组件自动处理切换
  }
});
