const mockApi = require('../../services/monk-api');

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

  async loadHomeData() {
    try {
      const userInfo = await mockApi.getUserInfo();
      const studyProgress = await mockApi.getStudyProgress();
      
      this.setData({
        username: userInfo.data.nickname || 'Jesse',
        points: userInfo.data.points || 1280,
        stats: {
          toLearn: studyProgress.data.toLearn || 6,
          toReview: studyProgress.data.toReview || 3,
          mastered: studyProgress.data.mastered || 12,
          accuracy: studyProgress.data.accuracy || 67
        }
      });
    } catch (error) {
      console.error('加载首页数据失败:', error);
    }
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  onChallenge() {
    wx.navigateTo({ url: '/pages/challenge/challenge' });
  },

  onViewAll() {
    wx.navigateTo({ url: '/pages/learn/learn' });
  },

  onViewDetail() {
    wx.navigateTo({ url: '/pages/progress/progress' });
  },

  onMore() {
    wx.navigateTo({ url: '/pages/learn/learn' });
  },

  onRecommendTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/card-detail/card-detail?id=${id}`
    });
  },

  onTabChange(e) {
    const { index } = e.detail;
    console.log('切换到 Tab:', index);
  }
});
