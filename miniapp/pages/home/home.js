Page({
  data: {
    username: '',
    streak: 0,
    points: 0,
    stats: {
      toLearn: 0,
      toReview: 0,
      mastered: 0,
      accuracy: 0
    },
    progress: [],
    recommendations: []
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
  },

  setUserInfo(user) {
    this.setData({
      username: user.nickname || '',
      points: user.points || 0,
      streak: (user.stats && user.stats.streakDays) || 0
    });
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
