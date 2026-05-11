var mockStore = {
  user: {
    id: 'mock_user_001',
    nickname: '小知同学',
    avatarUrl: 'https://img.zhixiaoji.com/avatars/default.png',
    level: 5,
    points: 1280,
    learnedCards: 47,
    createdAt: '2026-01-15T08:30:00.000Z',
    lastActiveAt: new Date().toISOString()
  },
  tokens: {
    accessToken: 'mock_access_token_eyJhbGciOiJIUzI1NiJ9',
    refreshToken: 'mock_refresh_token_eyJhbGciOiJIUzI1NiJ9',
    expiresIn: 7200
  }
};

function delay() {
  var ms = Math.floor(Math.random() * 300);
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function success(data) {
  return {
    code: 0,
    data: data,
    message: 'success'
  };
}

function fail(message) {
  return {
    code: -1,
    data: null,
    message: message || 'error'
  };
}

function setMockData(key, value) {
  mockStore[key] = value;
}

function getMockData(key) {
  return mockStore[key];
}

module.exports = {
  delay: delay,
  success: success,
  fail: fail,
  setMockData: setMockData,
  getMockData: getMockData,
  mockStore: mockStore
};
