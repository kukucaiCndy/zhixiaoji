var knowledgeApi = require('../../services/knowledge-api');

Page({
  data: {
    currentPath: 'main',
    knowledgeTree: []
  },

  onLoad() {
    this.loadKnowledgeTree();
  },

  loadKnowledgeTree() {
    knowledgeApi.buildKnowledgeTree().then(function (tree) {
      this.setData({ knowledgeTree: tree });
    }.bind(this)).catch(function (err) {
      console.error('[Learn] Failed to load knowledge tree:', err);
    });
  },

  switchPath(e) {
    var path = e.currentTarget.dataset.path;
    this.setData({ currentPath: path });
    this.loadKnowledgeTree();
  },

  toggleExpand(e) {
    var id = e.currentTarget.dataset.id;
    var tree = this.data.knowledgeTree.map(function (item) {
      if (item.id === id) {
        return Object.assign({}, item, { expanded: !item.expanded });
      }
      return item;
    });
    this.setData({ knowledgeTree: tree });
  },

  onExpandAll() {
    var allExpanded = this.data.knowledgeTree.every(function (item) { return item.expanded; });
    var tree = this.data.knowledgeTree.map(function (item) {
      return Object.assign({}, item, { expanded: !allExpanded });
    });
    this.setData({ knowledgeTree: tree });
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  onViewAll() {
    wx.navigateTo({ url: '/pages/learn/learn' });
  },

  onFeatureTap(e) {
    var type = e.currentTarget.dataset.type;
    var routes = {
      favorite: '/pages/favorites/favorites',
      wrong: '/pages/wrong-questions/wrong-questions',
      review: '/pages/review/review',
      stats: '/pages/stats/stats'
    };
    var url = routes[type];
    if (url) wx.navigateTo({ url });
  },

  onTabChange(e) {
    var index = e.detail.index;
  }
});
