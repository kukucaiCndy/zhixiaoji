/**
 * Monk API 聚合服务
 * 统一的前端 API 入口，对接后端接口 + Mock 数据兜底
 *
 * 架构：
 *   userService       → /users          (用户资料、统计)
 *   studyService      → /study          (学习进度、卡片)
 *   noteService       → /notes          (笔记 CRUD)
 *   pointsService     → /points         (积分、商城)
 *   rankService       → /rank           (排行榜)
 *   achievementService → /achievements  (成就系统)
 *   stationeryService → /stationery     (文具系统)
 */

const { createService } = require('./business-api');
const { mockStore } = require('./monk-data');

// ==================== 用户服务 ====================
const userService = createService('/users', {
  get: function () { return mockStore.user; }
});

// ==================== 学习服务 ====================
const studyService = createService('/study', {
  get: function (path) {
    if (path === '/progress') return { status: '进行中', progress: 65, studiedCount: 13, totalCount: 20 };
    if (path === '/recommendations') return {
      list: [
        { id: 1, icon: '📐', title: '闭包详解', desc: 'JavaScript 核心概念', gradient: 'blue' },
        { id: 2, icon: '🎨', title: '原型链', desc: '面向对象编程基础', gradient: 'orange' },
        { id: 3, icon: '🚀', title: '异步编程', desc: 'Promise与Async/Await', gradient: 'purple' }
      ]
    };
    return null;
  }
});

// ==================== 笔记服务 ====================
const noteService = createService('/notes');

// ==================== 积分服务 ====================
const pointsService = createService('/points');

// ==================== 排行榜服务 ====================
const rankService = createService('/rank');

// ==================== 成就服务 ====================
const achievementService = createService('/achievements');

// ==================== 文具服务 ====================
const stationeryService = createService('/stationery');

// ==================== 聚合导出 ====================
module.exports = {
  // 用户
  getUserInfo: function () {
    return userService.get('/profile');
  },
  getStudyProgress: function () {
    return studyService.get('/progress');
  },
  getRecommendations: function () {
    return studyService.get('/recommendations');
  },

  // 学习
  study: studyService,
  // 笔记
  notes: noteService,
  // 积分
  points: pointsService,
  // 排行榜
  rank: rankService,
  // 成就
  achievements: achievementService,
  // 文具
  stationery: stationeryService
};