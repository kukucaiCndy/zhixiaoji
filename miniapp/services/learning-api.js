/**
 * 学习进度 API 封装层
 * SDK: @zhixiaoji/api-sdk-wechat (v0.13.5+) LearningApi
 */

var { learning } = require('./api-client');

/**
 * 标记课程已完成学习
 * @param {string} lessonId - 课程 ID
 * @param {number} studyMinutes - 学习时长（分钟）
 * SDK: learning.markLearned(lessonId, studyMinutes)
 */
function markLearned(lessonId, studyMinutes) {
  return learning.markLearned(lessonId, studyMinutes).then(function (res) {
    if (res.code === 0) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取学习进度
 * @param {string} [subjectId] - 科目 ID（可选）
 * SDK: learning.getProgress(subjectId)
 */
function getProgress(subjectId) {
  return learning.getProgress(subjectId).then(function (res) {
    if (res.code === 0) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取继续学习推荐
 * SDK: learning.getContinueLearning()
 */
function getContinueLearning() {
  return learning.getContinueLearning().then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取学习统计
 * SDK: learning.getStats()
 */
function getStats() {
  return learning.getStats().then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

module.exports = {
  markLearned: markLearned,
  getProgress: getProgress,
  getContinueLearning: getContinueLearning,
  getStats: getStats
};
