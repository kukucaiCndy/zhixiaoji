Page({
  data: {
    isFlipped: false,
    isFavorite: false,
    cardTitle: 'CSS Flexbox',
    chapterId: '',
    currentSection: 0,
    totalSections: 0,
    sectionDots: [],
    cardData: {}
  },

  onLoad(options) {
    var chapterId = options.chapterId || '';
    var title = options.title ? decodeURIComponent(options.title) : '';
    var currentSection = parseInt(options.currentSection) || 0;
    var totalSections = parseInt(options.totalSections) || 0;
    var sectionDots = [];
    for (var i = 0; i < totalSections; i++) {
      sectionDots.push(i);
    }

    this.setData({
      chapterId: chapterId,
      cardTitle: title || 'CSS Flexbox',
      currentSection: currentSection,
      totalSections: totalSections,
      sectionDots: sectionDots
    });

    if (chapterId) {
      this.loadCardData(chapterId);
    }
  },

  loadCardData(chapterId) {
    var knowledgeApi = require('../../services/knowledge-api');
    var self = this;
    knowledgeApi.getStudyStats().catch(function () {
      return null;
    });
  },

  onBack() {
    wx.navigateBack({
      delta: 1,
      fail: function () {
        wx.switchTab({ url: '/pages/learn/learn' });
      }
    });
  },

  onFavorite() {
    this.setData({
      isFavorite: !this.data.isFavorite
    });
    wx.showToast({
      title: this.data.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
  },

  onFlipCard() {
    this.setData({
      isFlipped: !this.data.isFlipped
    });
  },

  onPrevCard() {
    if (this.data.currentSection > 0) {
      this.setData({
        currentSection: this.data.currentSection - 1
      });
      wx.showToast({ title: '上一节', icon: 'none' });
    } else {
      wx.showToast({ title: '已是第一节', icon: 'none' });
    }
  },

  onNextCard() {
    if (this.data.currentSection < this.data.totalSections - 1) {
      this.setData({
        currentSection: this.data.currentSection + 1
      });
      wx.showToast({ title: '下一节', icon: 'none' });
    } else {
      wx.showToast({ title: '已是最后一节', icon: 'none' });
    }
  },

  onUnderstood() {
    wx.showToast({
      title: '已标记为理解',
      icon: 'none'
    });
  },

  onHard() {
    wx.showToast({
      title: '已标记为有点难',
      icon: 'none'
    });
  },

  onNote() {
    wx.navigateTo({
      url: '/pages/note/note'
    });
  },

  onExtendTap(e) {
    var id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '跳转至延伸阅读',
      icon: 'none'
    });
  }
});
