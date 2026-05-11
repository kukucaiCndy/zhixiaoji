Page({
  data: {
    currentFilter: 'all',
    notes: []
  },

  onLoad() {
    this.loadNotes();
  },

  loadNotes() {
    const notes = [
      {
        id: 1,
        title: 'CSS Flexbox 布局核心概念笔记',
        summary: 'Flexbox 是一种一维布局模型，适用于需要在行或列方向上排列元素的场景。主轴和交叉轴的概念是理解 Flexbox 的关键...',
        tag1: 'CSS基础',
        tag2: '',
        auditStatus: 'passed',
        auditText: '✓ 已通过',
        time: '2小时前',
        source: 'CSS 布局篇'
      },
      {
        id: 2,
        title: 'JavaScript 闭包的应用场景',
        summary: '闭包是指能够访问自由变量的函数。在实际开发中，闭包常用于模块化、数据私有化、回调函数等场景...',
        tag1: 'JavaScript',
        tag2: '',
        auditStatus: 'reviewing',
        auditText: '⏳ 审核中',
        time: '昨天',
        source: 'JS 进阶篇'
      },
      {
        id: 3,
        title: '关于 Promise 的一些理解',
        summary: 'Promise 是异步编程的一种解决方案，主要用于解决回调地狱问题。它有三种状态：pending、fulfilled、rejected...',
        tag1: 'JavaScript',
        tag2: '',
        auditStatus: 'failed',
        auditText: '✗ 未通过',
        time: '3天前',
        source: '',
        reasonTap: 'onViewReason'
      },
      {
        id: 4,
        title: 'HTML5 语义化标签总结',
        summary: 'HTML5 引入了一系列语义化标签，如 header、nav、main、article、section、aside、footer 等，有助于 SEO 和可访问性...',
        tag1: 'HTML',
        tag2: '',
        auditStatus: 'passed',
        auditText: '✓ 已通过',
        time: '5天前',
        source: 'HTML 基础篇'
      },
      {
        id: 5,
        title: 'React Hooks 使用心得',
        summary: 'useState 用于管理组件内部状态，useEffect 用于处理副作用，useContext 用于跨组件传递数据...',
        tag1: '框架',
        tag2: 'React',
        auditStatus: 'passed',
        auditText: '✓ 已通过',
        time: '1周前',
        source: '框架篇'
      }
    ];

    this.setData({ notes });
  },

  onFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
  },

  onFilterToggle() {
    wx.showToast({ title: '筛选功能开发中', icon: 'none' });
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  onAddNote() {
    wx.navigateTo({ url: '/pages/note-edit/note-edit' });
  },

  onCardFab(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '笔记操作: ' + id, icon: 'none' });
  },

  onViewReason() {
    wx.showToast({ title: '查看审核不通过原因', icon: 'none' });
  },

  openNote(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/note-detail/note-detail?id=${id}` });
  },

  onTabChange(e) {
    const { index } = e.detail;
  }
});