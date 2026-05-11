const mockAuth = {
  async getProfile() {
    return {
      code: 0,
      data: {
        id: 'mock_user_001',
        nickname: '小知同学',
        avatarUrl: 'https://img.zhixiaoji.com/avatars/default.png',
        level: 5,
        points: 1280,
        stats: {
          learnDays: 36,
          learnedCards: 47,
          accuracy: 82
        },
        token: 'mock_token_' + Date.now()
      }
    };
  },

  async miniappLogin(code) {
    return {
      code: 0,
      data: {
        accessToken: 'mock_access_' + Date.now(),
        refreshToken: 'mock_refresh_' + Date.now(),
        user: {
          id: 'mock_user_001',
          nickname: '测试用户',
          avatarUrl: ''
        }
      }
    };
  },

  async refreshToken(refreshToken) {
    return {
      code: 0,
      data: {
        accessToken: 'mock_access_' + Date.now(),
        refreshToken: 'mock_refresh_' + Date.now()
      }
    };
  },

  async logout() {
    return { code: 0, message: '登出成功' };
  },

  async updateProfile(userId, data) {
    return { code: 0, message: '更新成功' };
  }
};

// 首页相关 Mock API
const mockHome = {
  async getUserInfo() {
    return {
      code: 0,
      data: {
        nickname: '小知同学',
        userId: '10086',
        avatarUrl: 'https://img.zhixiaoji.com/avatars/default.png',
        level: 5,
        levelTitle: '知识探索者',
        nextLevelExp: 320,
        points: 1280,
        stats: {
          streakDays: 12,
          completedCards: 156,
          accuracy: '67%',
          learnDays: 42,
          wrongCount: 23,
          favoriteCount: 15,
          stationeryCount: 8,
          pendingAchievements: '6项未达成'
        }
      }
    };
  },

  async getStudyProgress() {
    return {
      code: 0,
      data: {
        status: '进行中',
        progress: 65,
        studiedCount: 13,
        totalCount: 20
      }
    };
  },

  async getRecommendations() {
    return {
      code: 0,
      data: {
        list: [
          {
            id: 1,
            icon: '📐',
            title: '闭包详解',
            desc: 'JavaScript 核心概念',
            gradient: 'blue'
          },
          {
            id: 2,
            icon: '🎨',
            title: '原型链',
            desc: '面向对象编程基础',
            gradient: 'orange'
          },
          {
            id: 3,
            icon: '🚀',
            title: '异步编程',
            desc: 'Promise与Async/Await',
            gradient: 'purple'
          }
        ]
      }
    };
  }
};

module.exports = {
  auth: mockAuth,
  getUserInfo: mockHome.getUserInfo,
  getStudyProgress: mockHome.getStudyProgress,
  getRecommendations: mockHome.getRecommendations
};
