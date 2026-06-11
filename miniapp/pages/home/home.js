var knowledgeApi = require('../../services/knowledge-api');

Page({
  data: {
    username: '',
    avatarUrl: '',
    streak: 0,
    points: 0,
    stats: {
      toLearn: 0,
      toReview: 0,
      mastered: 0,
      accuracy: 0
    },
    progress: [],
    overallPercent: 0,
    recommendations: [],
    continueTitle: '',
    continueDesc: ''
  },

  onLoad() {
    this.loadHomeData();
  },

  onShow() {
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserInfo(app.globalData.userInfo);
    }
  },

  loadHomeData() {
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setUserInfo(app.globalData.userInfo);
    }
    app.loadUserInfo().then(function (user) {
      if (user) {
        this.setUserInfo(user);
      }
    }.bind(this));

    knowledgeApi.getStudyStats().then(function (stats) {
      this.setData({ stats: stats });
    }.bind(this)).catch(function (err) {
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

        var activeItems = progress.filter(function (item) {
          return item.percent > 0 && item.percent < 100;
        });
        if (activeItems.length > 0) {
          activeItems.sort(function (a, b) { return b.percent - a.percent; });
          continueTitle = activeItems[0].name;
          continueDesc = '已完成 ' + activeItems[0].percent + '%，继续加油';
        } else if (progress[0]) {
          continueTitle = progress[0].name;
          continueDesc = progress[0].percent === 100 ? '已完成，探索新内容吧' : '开始你的第一节课';
        }
      }

      this.setData({
        progress: progress,
        overallPercent: overallPercent,
        continueTitle: continueTitle,
        continueDesc: continueDesc
      });
    }.bind(this)).catch(function (err) {
      console.error('[Home] Failed to load progress:', err);
    });

    knowledgeApi.getRecommendations().then(function (recommendations) {
      this.setData({ recommendations: recommendations });
    }.bind(this)).catch(function (err) {
      console.error('[Home] Failed to load recommendations:', err);
    });
  },

  setUserInfo(user) {
    this.setData({
      username: user.nickname || '',
      avatarUrl: user.avatarUrl || '',
      points: user.points || 0,
      streak: (user.stats && user.stats.streakDays) || 0
    });
  },

  /* ---- 顶部状态栏 ---- */
  onProfileTap() {
    wx.switchTab({ url: '/pages/profile/index' });
  },

  onMallTap() {
    wx.navigateTo({ url: '/pages/mall/index' });
  },

  /* ---- 核心CTA ---- */
  onContinueLearn() {
    wx.switchTab({ url: '/pages/learn/index' });
  },

  /* ---- 快捷入口 ---- */
  onChallenge() {
    wx.navigateTo({ url: '/pages/learn/daily-challenge/index' });
  },

  onStartReview() {
    wx.navigateTo({ url: '/pages/learn/review/index' });
  },

  onAchievementTap() {
    wx.navigateTo({ url: '/pages/achievement/index' });
  },

  onRankTap() {
    wx.navigateTo({ url: '/pages/rank/index' });
  },

  /* ---- 学习进度 ---- */
  onViewDetail() {
    wx.switchTab({ url: '/pages/learn/index' });
  },

  /* ---- 推荐内容 ---- */
  onMore() {
    wx.switchTab({ url: '/pages/learn/index' });
  },

  onRecommendTap(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/learn/knowledge-chapters/knowledge-chapters?id=' + id
    });
  },

  /* ---- Tab栏 ---- */
  onTabChange(e) {
    var index = e.detail;
    var urls = [
      '/pages/home/home',
      '/pages/learn/index',
      '/pages/note/index',
      '/pages/profile/index'
    ];
    if (index >= 0 && index < urls.length) {
      wx.switchTab({ url: urls[index] });
    }
  }
});
