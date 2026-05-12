var mockApi = require('../../services/monk-api');

Page({
  data: {
    username: 'Jesse',
    streak: 7,
    points: 1280,
    stats: {
      toLearn: 6,
      toReview: 3,
      mastered: 12,
      accuracy: 67
    },
    progress: [
      { name: 'HTML', percent: 85, color: 'purple' },
      { name: 'CSS', percent: 60, color: 'cyan' },
      { name: 'JavaScript', percent: 35, color: 'orange' },
      { name: '框架', percent: 20, color: 'red' }
    ],
    recommendations: [
      { id: 1, title: 'CSS Flexbox', desc: '彻底理解弹性布局', color: 'purple' },
      { id: 2, title: '闭包详解', desc: 'JavaScript 核心概念', color: 'cyan' },
      { id: 3, title: '原型链', desc: '面向对象编程基础', color: 'orange' }
    ]
  },

  onLoad() {
    this.loadHomeData();
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
    this.loadStudyData();
  },

  setUserInfo(user) {
    this.setData({
      username: user.nickname || 'Jesse',
      points: user.points || 1280,
      streak: (user.stats && user.stats.streakDays) || 7,
      stats: {
        toLearn: (user.stats && user.stats.toLearn) || 6,
        toReview: (user.stats && user.stats.toReview) || 3,
        mastered: (user.stats && user.stats.mastered) || 12,
        accuracy: (user.stats && user.stats.accuracy) || 67
      }
    });
  },

  async loadStudyData() {
    try {
      var studyProgress = await mockApi.getStudyProgress();
      this.setData({
        stats: {
          toLearn: studyProgress.data.toLearn || 6,
          toReview: studyProgress.data.toReview || 3,
          mastered: studyProgress.data.mastered || 12,
          accuracy: studyProgress.data.accuracy || 67
        }
      });
    } catch (error) {
      console.error('加载学习进度失败:', error);
    }
  },

  onTapCard(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/learn/learn?cardId=' + id
    });
  },

  onStartLearn() {
    wx.switchTab({
      url: '/pages/learn/learn'
    });
  },

  onStartReview() {
    wx.switchTab({
      url: '/pages/learn/learn'
    });
  }
});
