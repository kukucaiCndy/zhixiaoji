/**
 * 本地学习进度管理
 * 
 * 规则：
 * - 只有第一章第一节默认解锁
 * - 课程必须按顺序学习
 * - 完成一课解锁下一课
 * - 完成一章最后一课解锁下一章第一节
 */

var storage = require('./storage');
var STORAGE_KEY = 'learning_progress';

/**
 * 获取全部学习进度
 * @returns {Object} { completedLessonIds: string[] }
 */
function getProgress() {
  var data = storage.getSync(STORAGE_KEY);
  if (!data) return { completedLessonIds: [] };
  try {
    return JSON.parse(data);
  } catch (e) {
    return { completedLessonIds: [] };
  }
}

/**
 * 保存学习进度
 */
function saveProgress(progress) {
  storage.setSync(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * 标记课程为已完成
 */
function markLessonCompleted(lessonId) {
  var progress = getProgress();
  var ids = progress.completedLessonIds || [];
  if (ids.indexOf(lessonId) === -1) {
    ids.push(lessonId);
    progress.completedLessonIds = ids;
    saveProgress(progress);
  }
}

/**
 * 判断课程是否已完成
 */
function isLessonCompleted(lessonId) {
  var progress = getProgress();
  return (progress.completedLessonIds || []).indexOf(lessonId) !== -1;
}

/**
 * 计算课程列表的锁定状态
 * 
 * 规则：只有第一节默认解锁，其余依次跟随前一节完成状态解锁
 * 
 * @param {Array} lessons - 课程列表 [{id, ...}]
 * @returns {Array} 添加了 locked 字段的课程列表
 */
function computeLessonLocks(lessons) {
  if (!lessons || !lessons.length) return lessons;
  var completedIds = getProgress().completedLessonIds || [];
  return lessons.map(function (lesson, i) {
    if (i === 0) {
      // 第一节始终解锁
      lesson.locked = false;
    } else {
      // 前一节完成则解锁
      var prevLessonId = lessons[i - 1].id;
      lesson.locked = completedIds.indexOf(prevLessonId) === -1;
    }
    return lesson;
  });
}

/**
 * 计算章节列表的锁定状态
 * 
 * 规则：只有第一章解锁，后续章节依次跟随前一章最后一节完成状态解锁
 * 
 * @param {Array} chapters - 章节列表 [{id, lessons: [{id}]}]
 * @returns {Array} 添加了 locked 字段的章节列表
 */
function computeChapterLocks(chapters) {
  if (!chapters || !chapters.length) return chapters;
  var completedIds = getProgress().completedLessonIds || [];
  return chapters.map(function (chapter, i) {
    if (i === 0) {
      chapter.locked = false;
    } else {
      // 前一章的所有课程都完成则解锁
      var prevChapter = chapters[i - 1];
      var prevLessons = prevChapter.lessons || [];
      if (prevLessons.length === 0) {
        // 前一章无课程，也解锁
        chapter.locked = false;
      } else {
        var lastLessonId = prevLessons[prevLessons.length - 1].id;
        chapter.locked = completedIds.indexOf(lastLessonId) === -1;
      }
    }
    return chapter;
  });
}

/**
 * 获取下一个可学习的课程索引
 * @param {Array} lessons - 已加锁的课程列表
 * @returns {number} 第一个未锁定的课程索引
 */
function getNextUnlockedLessonIndex(lessons) {
  if (!lessons || !lessons.length) return 0;
  for (var i = 0; i < lessons.length; i++) {
    if (!lessons[i].locked) return i;
  }
  return 0;
}

module.exports = {
  getProgress: getProgress,
  saveProgress: saveProgress,
  markLessonCompleted: markLessonCompleted,
  isLessonCompleted: isLessonCompleted,
  computeLessonLocks: computeLessonLocks,
  computeChapterLocks: computeChapterLocks,
  getNextUnlockedLessonIndex: getNextUnlockedLessonIndex
};
