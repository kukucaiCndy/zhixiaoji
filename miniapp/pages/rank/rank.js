var theme = require('../../utils/theme');

Page({
  data: {
    theme: 'light',
    currentTab: 'score',
    myRank: {
      initial: 'J',
      name: 'Jesse',
      change: '较上周上升 3 名 ↑',
      score: '1,280'
    },
    rankList: []
  },

  onLoad() {
    this.setData({ theme: theme.getEffectiveTheme() });
    this.loadRankData('score');
  },

  onShow() {
    this.setData({ theme: theme.getEffectiveTheme() });
  },

  onThemeChange(effective) {
    this.setData({ theme: effective });
  },

  loadRankData(tab) {
    var mockData = {
      score: [
        { id: 1, pos: 1, initial: 'M', avatarBg: '#4F46E5', name: 'Ming', badge: 'VIP', badgeBg: '#FFF4E5', badgeColor: '#F59E0B', meta: 'Lv.8 · 学习 68 天', score: '4,280', trend: 'up', trendIcon: '↑' },
        { id: 2, pos: 2, initial: 'L', avatarBg: '#10B981', name: 'Lei', badge: 'Pro', badgeBg: '#EEF2FF', badgeColor: '#4F46E5', meta: 'Lv.7 · 学习 55 天', score: '3,650', trend: 'up', trendIcon: '↑' },
        { id: 3, pos: 3, initial: 'W', avatarBg: '#F59E0B', name: 'Wei', meta: 'Lv.7 · 学习 52 天', score: '3,120', trend: 'flat', trendIcon: '—' },
        { id: 4, pos: 4, initial: 'Z', avatarBg: '#06B6D4', name: 'Zhang', meta: 'Lv.6 · 学习 45 天', score: '2,860', trend: 'up', trendIcon: '↑' },
        { id: 5, pos: 5, initial: 'Y', avatarBg: '#8B5CF6', name: 'Yang', meta: 'Lv.6 · 学习 42 天', score: '2,540', trend: 'down', trendIcon: '↓' },
        { id: 6, pos: 6, initial: 'C', avatarBg: '#10B981', name: 'Chen', meta: 'Lv.5 · 学习 40 天', score: '2,240', trend: 'up', trendIcon: '↑' },
        { id: 7, pos: 7, initial: 'H', avatarBg: '#EC4899', name: 'Huang', meta: 'Lv.5 · 学习 36 天', score: '1,960', trend: 'up', trendIcon: '↑' },
        { id: 8, pos: 8, initial: 'S', avatarBg: '#F97316', name: 'Sun', meta: 'Lv.5 · 学习 33 天', score: '1,720', trend: 'down', trendIcon: '↓' },
        { id: 9, pos: 9, initial: 'X', avatarBg: '#6366F1', name: 'Xu', meta: 'Lv.5 · 学习 30 天', score: '1,520', trend: 'flat', trendIcon: '—' },
        { id: 10, pos: 10, initial: 'P', avatarBg: '#14B8A6', name: 'Peng', meta: 'Lv.5 · 学习 28 天', score: '1,340', trend: 'down', trendIcon: '↓' },
        { id: 11, pos: 11, initial: 'G', avatarBg: '#A855F7', name: 'Guo', meta: 'Lv.5 · 学习 26 天', score: '1,200', trend: 'up', trendIcon: '↑' },
        { id: 12, pos: 12, initial: 'J', avatarBg: '#4F46E5', name: 'Jesse（你）', meta: 'Lv.5 · 学习 24 天', score: '1,280', trend: 'up', trendIcon: '↑' }
      ],
      checkin: [],
      accuracy: [],
      favorite: [],
      duration: []
    };
    this.setData({
      rankList: mockData[tab] || []
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onMyRank() {
    wx.showToast({ title: '定位到你的排名', icon: 'none' });
  },

  onTabChange(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadRankData(tab);
  }
});