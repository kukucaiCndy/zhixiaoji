var { knowledge, apiClient } = require('./api-client');
var client = apiClient.client;

var CATEGORY_ICONS = ['💻', '🖥️', '🔌', '📦', '🌐', '🎨', '⚡', '🛠️', '🔧', '🚀'];
var CATEGORY_BG_COLORS = ['#EEF2FF', '#ECFEFF', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#E0F2FE', '#F0FDF4', '#FEF2F2'];

// ========== 分类 API (SDK v0.13.1) ==========

/**
 * 获取分类列表
 * SDK: knowledge.listCategories(params)
 * 返回: Category[] { id, name, icon, description, sortOrder, status }
 */
function listCategories(params) {
  return knowledge.listCategories(params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取分类详情（含科目列表）
 * SDK: knowledge.getCategory(id)
 * 返回: CategoryDetail { ...Category, subjects: SubjectSummary[] }
 * SubjectSummary: { id, name, icon, difficulty, sortOrder, status }
 */
function getCategoryDetail(id) {
  return knowledge.getCategory(id).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

// ========== 科目 API（原知识章节）==========

/**
 * 获取科目列表（按分类筛选）
 * SDK: knowledge.listSubjects({ categoryId })
 * 返回: Subject[] { id, name, icon, description, categoryId, difficulty, sortOrder, status }
 */
function listKnowledgeChapters(params) {
  return knowledge.listSubjects(params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取科目详情（含章节列表）
 * SDK: knowledge.getSubject(id)
 * 返回: SubjectDetail { ...Subject, chapters: ChapterSummary[] }
 * ChapterSummary: { id, title, sortOrder, unlockPoints }
 */
function getKnowledgeChapterDetail(id) {
  return knowledge.getSubject(id).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

// ========== 章节 API（原小节）==========

/**
 * 获取章节列表（按科目筛选）
 * SDK: knowledge.listChapters({ subjectId })
 * 返回: Chapter[] { id, title, description, subjectId, goal, content, sortOrder, unlockPoints }
 */
function listSections(params) {
  return knowledge.listChapters(params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取章节详情（含课程列表）
 * SDK: knowledge.getChapter(id)
 * 返回: ChapterDetail { ...Chapter, lessons: LessonSummary[] }
 * LessonSummary: { id, title, number, sortOrder, unlockPoints }
 */
function getSectionDetail(id) {
  return knowledge.getChapter(id).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

// ========== 课程 API（原小节/新增）==========

/**
 * 获取课程列表（按章节筛选）
 * SDK: knowledge.listLessons({ chapterId })
 * 返回: Lesson[] { id, title, number, chapterId, knowledgePoint, sortOrder, unlockPoints, htmlUrl, latestHtmlContent }
 */
function listLessons(params) {
  return knowledge.listLessons(params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取课程详情
 * SDK: knowledge.getLesson(id)
 * 返回: Lesson { id, title, number, chapterId, knowledgePoint, sortOrder, unlockPoints, htmlUrl, latestHtmlContent }
 */
function getLessonDetail(id) {
  return knowledge.getLesson(id).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

// ========== 其他 API ==========

function getStudyStats() {
  return client.get('/knowledge/stats').then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response');
  });
}

function getStudyProgress() {
  return client.get('/knowledge/progress').then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response');
  });
}

function getRecommendations() {
  return client.get('/knowledge/recommendations').then(function (res) {
    if (res.code === 0 && res.data && res.data.list) return res.data.list;
    throw new Error('Invalid response');
  });
}

function getWrongQuestions(params) {
  return client.get('/knowledge/wrong-questions', params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response');
  });
}

module.exports = {
  listCategories: listCategories,
  getCategoryDetail: getCategoryDetail,
  listKnowledgeChapters: listKnowledgeChapters,
  getKnowledgeChapterDetail: getKnowledgeChapterDetail,
  listSections: listSections,
  getSectionDetail: getSectionDetail,
  listLessons: listLessons,
  getLessonDetail: getLessonDetail,
  getStudyStats: getStudyStats,
  getStudyProgress: getStudyProgress,
  getRecommendations: getRecommendations,
  getWrongQuestions: getWrongQuestions
};
