var { knowledge, apiClient } = require('./api-client');
var client = apiClient.client;

var CATEGORY_ICONS = ['💻', '🖥️', '🔌', '📦', '🌐', '🎨', '⚡', '🛠️', '🔧', '🚀'];
var CATEGORY_BG_COLORS = ['#EEF2FF', '#ECFEFF', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#E0F2FE', '#F0FDF4', '#FEF2F2'];

// ========== 知识体系（分类）API ==========

/**
 * 获取知识体系列表
 * SDK: knowledge.listKnowledgeSystems(params)
 * 返回: KnowledgeSystem[] { id, name, icon, difficulty, sortOrder, chapterCount, sectionCount, status }
 */
function listCategories(params) {
  return knowledge.listKnowledgeSystems(params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取知识体系详情（含知识章节列表）
 * SDK: knowledge.getKnowledgeSystem(id)
 * 返回: KnowledgeSystemDetail { ...KnowledgeSystem, chapters: ChapterSummary[] }
 * ChapterSummary: { id, title, sortOrder, difficulty, sectionCount, status }
 */
function getCategoryDetail(id) {
  return knowledge.getKnowledgeSystem(id).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

// ========== 知识章节 API ==========

/**
 * 获取知识章节列表（按知识体系筛选）
 * SDK: knowledge.listChapters({ knowledgeSystemId })
 * 返回: Chapter[] { id, title, description, goal, knowledgeSystemId, difficulty, sortOrder, status, sectionCount }
 */
function listKnowledgeChapters(params) {
  return knowledge.listChapters(params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取知识章节详情（含小节列表）
 * SDK: knowledge.getChapter(id)
 * 返回: ChapterDetail { ...Chapter, sections: SectionSummary[] }
 * SectionSummary: { id, title, sortOrder, difficulty, knowledgePoint, cardCount, status }
 */
function getKnowledgeChapterDetail(id) {
  return knowledge.getChapter(id).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

// ========== 小节 API ==========

/**
 * 获取小节列表
 * SDK: knowledge.listSections({ chapterId })
 * 返回: Section[] { id, title, chapterId, difficulty, sortOrder, prerequisiteSectionIds, unlockPoints, htmlUrl, knowledgePoint, status }
 */
function listSections(params) {
  return knowledge.listSections(params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response: ' + JSON.stringify(res));
  });
}

/**
 * 获取小节详情
 * SDK: knowledge.getSection(id)
 * 返回: Section { id, title, chapterId, difficulty, sortOrder, prerequisiteSectionIds, unlockPoints, htmlUrl, latestHtmlContent, knowledgePoint, status }
 */
function getSectionDetail(id) {
  return knowledge.getSection(id).then(function (res) {
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
  getStudyStats: getStudyStats,
  getStudyProgress: getStudyProgress,
  getRecommendations: getRecommendations,
  getWrongQuestions: getWrongQuestions
};