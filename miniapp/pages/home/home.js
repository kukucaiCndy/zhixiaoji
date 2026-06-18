var knowledgeApi = require('../../services/knowledge-api');
var STORAGE_KEYS = require('../../utils/constants').STORAGE_KEYS;
var theme = require('../../utils/theme');

Page({
  data: {
    theme: 'light',
    username: '',
    avatarUrl: '',
    points: 0,
    stats: { toLearn: 0, toReview: 0, mastered: 0, accuracy: 0 },
    progress: [],
    overallPercent: 0,
    recommendations: [],
    continueTitle: '',
    continueDesc: ''
  },

  onLoad() {
    this.setData({ theme: theme.getEffectiveTheme() });
    this.loadHomeData();
  },

  onShow() {
    this.setData({ theme: theme.getEffectiveTheme() });
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserInfo(app.globalData.userInfo);
    }
  },

  /**
   * 主题变化钩子（由 theme.notifyPages 触发）
   */
  onThemeChange(effective) {
    this.setData({ theme: effective });
  },

  loadHomeData() {
    var self = this;
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserInfo(app.globalData.userInfo);
    }
    app.loadUserInfo().then(function (user) {
      if (user) self.setUserInfo(user);
    });

    knowledgeApi.getStudyStats().then(function (stats) {
      self.setData({ stats: stats });
    }).catch(function (err) {
      console.error('[Home] Failed to load stats:', err);
    });

    knowledgeApi.getStudyProgress().then(function (progress) {
      var overallPercent = 0;
      var continueTitle = '';
      var continueDesc = '';
      if (progress && progress.length > 0) {
        var totalPercent = 0;
        for (var i = 0; i < progress.length; i++) {
          totalPercent += (progress[i].percent || 0);
        }
        overallPercent = Math.round(totalPercent / progress.length);
        var active = progress.filter(function (p) { return p.percent > 0 && p.percent < 100; });
        if (active.length > 0) {
          active.sort(function (a, b) { return b.percent - a.percent; });
          continueTitle = active[0].name;
          continueDesc = '已完成 ' + active[0].percent + '%，继续加油';
        } else if (progress[0]) {
          continueTitle = progress[0].name;
          continueDesc = progress[0].percent === 100 ? '已完成，探索新内容吧' : '开始你的第一节课';
        }
      }
      self.setData({ progress: progress, overallPercent: overallPercent, continueTitle: continueTitle, continueDesc: continueDesc });
    }).catch(function (err) {
      console.error('[Home] Failed to load progress:', err);
    });

    knowledgeApi.getRecommendations().then(function (recs) {
      if (recs && recs.length > 0) {
        self.setData({ recommendations: recs });
      } else {
        self.setDefaultRecommendations();
      }
    }).catch(function (err) {
      console.error('[Home] Failed to load recommendations:', err);
      self.setDefaultRecommendations();
    });
  },

  setDefaultRecommendations() {
    this.setData({
      recommendations: [
        { id: 'python', title: 'Python', desc: '12 个知识点', icon: '🐍', iconType: 'emoji' },
        { id: 'javascript', title: 'JavaScript', desc: '18 个知识点', icon: '📜', iconType: 'emoji' }
      ]
    });
  },

  setUserInfo(user) {
    this.setData({
      username: user.nickname || '',
      avatarUrl: user.avatarUrl || '',
      points: user.points || 0
    });
  },

  onContinueLearn() {
    wx.switchTab({ url: '/pages/learn/learn' });
  },

  onChallenge() {
    wx.navigateTo({ url: '/pages/learn/knowledge-chapters/knowledge-chapters' });
  },

  onStartReview() {
    wx.navigateTo({ url: '/pages/wrong-questions/wrong-questions' });
  },

  onRankTap() {
    wx.navigateTo({ url: '/pages/rank/rank' });
  },

  onAchievementTap() {
    wx.showToast({ title: '成就功能即将上线', icon: 'none' });
  },

  onViewDetail() {
    wx.switchTab({ url: '/pages/learn/learn' });
  },

  onMore() {
    wx.switchTab({ url: '/pages/learn/learn' });
  },

  onRecommendTap(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/learn/knowledge-chapters/knowledge-chapters?id=' + id });
  },

  onTabChange(e) {
    var index = e.detail;
    var urls = [
      '/pages/home/home',
      '/pages/learn/learn',
      '/pages/profile/profile'
    ];
    if (index >= 0 && index < urls.length) {
      wx.switchTab({ url: urls[index] });
    }
  }
});
