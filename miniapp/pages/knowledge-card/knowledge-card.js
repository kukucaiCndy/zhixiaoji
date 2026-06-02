Page({
  data: {
    isFlipped: false,
    isFavorite: false,
    cardTitle: 'CSS Flexbox',
    cardData: {}
  },

  onLoad(options) {
    var cardId = options.cardId || '';
    if (cardId) {
      this.loadCardData(cardId);
    }
  },

  loadCardData(cardId) {
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
    wx.showToast({
      title: '翻转卡片',
      icon: 'none'
    });
  },

  onPrevCard() {
    wx.showToast({
      title: '上一张卡片',
      icon: 'none'
    });
  },

  onNextCard() {
    wx.showToast({
      title: '下一张卡片',
      icon: 'none'
    });
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
