var knowledgeApi = require('../../services/knowledge-api');

Page({
  data: {
    currentFilter: 'all',
    wrongQuestions: [],
    pendingCount: 0
  },

  _allQuestions: [],

  onLoad() {
    this.loadWrongQuestions();
  },

  loadWrongQuestions() {
    knowledgeApi.getWrongQuestions().then(function (questions) {
      var list = Array.isArray(questions) ? questions : (questions.list || []);
      this._allQuestions = list;
      this.setData({
        totalWrong: list.length
      });
      this.applyFilter('all');
    }.bind(this)).catch(function (err) {
      console.error('[WrongQuestions] Failed to load:', err);
    });
  },

  applyFilter(filter) {
    var questions = this._allQuestions;
    if (filter === 'pending') {
      questions = this._allQuestions.filter(function (q) { return !q.practiced; });
    } else if (filter === 'mastered') {
      questions = this._allQuestions.filter(function (q) { return q.practiced; });
    } else if (filter !== 'all') {
      questions = this._allQuestions.filter(function (q) { return q.category === filter; });
    }
    var pending = questions.filter(function (q) { return !q.practiced; }).length;
    var mastered = questions.filter(function (q) { return q.practiced; }).length;
    var newWrong = this._allQuestions.filter(function (q) { return !q.practiced && !q.retryCount; }).length;
    this.setData({
      wrongQuestions: questions,
      pendingCount: pending,
      masteredCount: mastered,
      newWrongCount: newWrong
    });
  },

  onFilter(e) {
    var filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.applyFilter(filter);
  },

  onWeaknessAnalysis() {
    wx.navigateTo({
      url: '/pages/weakness-analysis/weakness-analysis'
    });
  },

  onBack() {
    wx.navigateBack({
      delta: 1,
      fail: function () {
        wx.switchTab({ url: '/pages/home/home' });
      }
    });
  },

  onRetryQuestion(e) {
    var id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '开始练习',
      icon: 'none'
    });
  },

  onStartRetry() {
    var pending = this.data.wrongQuestions.filter(function (q) { return !q.practiced; });
    if (pending.length === 0) {
      wx.showToast({
        title: '没有待练习的错题',
        icon: 'none'
      });
      return;
    }
    wx.showToast({
      title: '开始重练 ' + pending.length + ' 道错题',
      icon: 'none'
    });
  }
});
