const mockApi = require('../../services/monk-api');

Page({
  data: {
    currentPath: 'main',
    knowledgeTree: []
  },

  onLoad() {
    this.loadKnowledgeTree();
  },

  loadKnowledgeTree() {
    const tree = [
      {
        id: 1, icon: '🌐', name: 'HTML 基础',
        completed: 12, total: 15, status: 'studying', statusText: '学习中',
        percent: 80, expanded: true,
        children: [
          { name: 'HTML 文档结构', status: 'done', badge: '✓' },
          { name: '标签与属性', status: 'done', badge: '✓' },
          { name: '表单与输入', status: 'progress', badge: '3' },
          { name: '语义化标签', status: 'locked', badge: '🔒' },
          { name: 'HTML5 新特性', status: 'locked', badge: '🔒' }
        ]
      },
      {
        id: 2, icon: '🎨', name: 'CSS 基础',
        completed: 8, total: 20, status: 'studying', statusText: '学习中',
        percent: 40, expanded: false,
        children: [
          { name: 'CSS 选择器', status: 'done', badge: '✓' },
          { name: '盒模型', status: 'progress', badge: '5' },
          { name: '弹性布局', status: 'progress', badge: '2' },
          { name: '响应式设计', status: 'locked', badge: '🔒' }
        ]
      },
      {
        id: 3, icon: '⚡', name: 'JavaScript 基础',
        completed: 3, total: 25, status: 'studying', statusText: '学习中',
        percent: 12, expanded: false,
        children: [
          { name: '变量与类型', status: 'done', badge: '✓' },
          { name: '函数与作用域', status: 'progress', badge: '1' },
          { name: 'DOM 操作', status: 'locked', badge: '🔒' }
        ]
      },
      {
        id: 4, icon: '🛠️', name: '框架与工具',
        completed: 0, total: 18, status: 'locking', statusText: '未解锁',
        percent: 0, expanded: false,
        children: [
          { name: 'Vue.js', status: 'locked', badge: '🔒' },
          { name: 'React', status: 'locked', badge: '🔒' }
        ]
      },
      {
        id: 5, icon: '🔧', name: '工程化实践',
        completed: 0, total: 12, status: 'locking', statusText: '未解锁',
        percent: 0, expanded: false,
        children: [
          { name: 'Git 版本控制', status: 'locked', badge: '🔒' },
          { name: 'Webpack', status: 'locked', badge: '🔒' }
        ]
      },
      {
        id: 6, icon: '🚀', name: '进阶专题',
        completed: 0, total: 10, status: 'locking', statusText: '未解锁',
        percent: 0, expanded: false,
        children: [
          { name: '性能优化', status: 'locked', badge: '🔒' },
          { name: '安全防护', status: 'locked', badge: '🔒' }
        ]
      }
    ];

    this.setData({ knowledgeTree: tree });
  },

  switchPath(e) {
    const path = e.currentTarget.dataset.path;
    this.setData({ currentPath: path });
    this.loadKnowledgeTree();
  },

  toggleExpand(e) {
    const id = e.currentTarget.dataset.id;
    const tree = this.data.knowledgeTree.map(item => {
      if (item.id === id) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });
    this.setData({ knowledgeTree: tree });
  },

  onExpandAll() {
    const allExpanded = this.data.knowledgeTree.every(item => item.expanded);
    const tree = this.data.knowledgeTree.map(item => ({
      ...item,
      expanded: !allExpanded
    }));
    this.setData({ knowledgeTree: tree });
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  onViewAll() {
    wx.navigateTo({ url: '/pages/learn/learn' });
  },

  onFeatureTap(e) {
    const type = e.currentTarget.dataset.type;
    const routes = {
      favorite: '/pages/favorites/favorites',
      wrong: '/pages/wrong-questions/wrong-questions',
      review: '/pages/review/review',
      stats: '/pages/stats/stats'
    };
    const url = routes[type];
    if (url) wx.navigateTo({ url });
  },

  onTabChange(e) {
    const { index } = e.detail;
  }
});