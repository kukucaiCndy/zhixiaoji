var { knowledge, apiClient } = require('./api-client');
var client = apiClient.client;
var { delay, success } = require('./monk-data');

var CHAPTER_ICONS = ['🌐', '🎨', '⚡', '🛠️', '🔧', '🚀'];
var CHAPTER_GRADIENTS = ['purple', 'cyan', 'orange', 'red', 'green', 'blue'];

function buildKnowledgeTree() {
  return knowledge.listKnowledgeSystems().then(function (res) {
    if (res.code === 0 && res.data && res.data.length > 0) {
      var systems = res.data;
      return Promise.all(systems.map(function (sys, i) {
        return knowledge.listChapters({ knowledgeSystemId: sys.id }).then(function (chRes) {
          var chapters = (chRes.code === 0 && chRes.data) ? chRes.data : [];
          var total = chapters.length;
          var doneCount = chapters.filter(function (c) { return c.status === 'completed'; }).length;
          var hasUnlocked = chapters.some(function (c) { return c.status !== 'locked'; });
          return {
            id: 'sys_' + sys.id,
            icon: sys.icon || CHAPTER_ICONS[i % CHAPTER_ICONS.length],
            name: sys.name,
            completed: doneCount,
            total: total,
            status: hasUnlocked ? 'studying' : 'locking',
            statusText: hasUnlocked ? '学习中' : '未解锁',
            percent: total > 0 ? Math.round(doneCount / total * 100) : 0,
            expanded: false,
            children: chapters.map(function (ch) {
              var badge;
              if (ch.status === 'completed') badge = '✓';
              else if (ch.status === 'locked') badge = '🔒';
              else if (ch.sectionCount) badge = String(ch.sectionCount);
              else badge = '···';
              return {
                name: ch.title,
                status: ch.status === 'completed' ? 'done' : (ch.status === 'locked' ? 'locked' : 'progress'),
                badge: badge,
                chapterId: ch.id
              };
            })
          };
        });
      }));
    }
    throw new Error('No data from API');
  }).catch(function (err) {
    console.log('[Knowledge] API unavailable, using mock:', err.message);
    return getKnowledgeTreeMock();
  });
}

function getKnowledgeTreeMock() {
  var tree = [
    {
      id: 'mock_1', icon: '🌐', name: 'HTML 基础',
      completed: 12, total: 15, status: 'studying', statusText: '学习中',
      percent: 80, expanded: false,
      children: [
        { name: 'HTML 文档结构', status: 'done', badge: '✓', chapterId: '' },
        { name: '标签与属性', status: 'done', badge: '✓', chapterId: '' },
        { name: '表单与输入', status: 'progress', badge: '3', chapterId: '' },
        { name: '语义化标签', status: 'locked', badge: '🔒', chapterId: '' },
        { name: 'HTML5 新特性', status: 'locked', badge: '🔒', chapterId: '' }
      ]
    },
    {
      id: 'mock_2', icon: '🎨', name: 'CSS 基础',
      completed: 8, total: 20, status: 'studying', statusText: '学习中',
      percent: 40, expanded: false,
      children: [
        { name: 'CSS 选择器', status: 'done', badge: '✓', chapterId: '' },
        { name: '盒模型', status: 'progress', badge: '5', chapterId: '' },
        { name: '弹性布局', status: 'progress', badge: '2', chapterId: '' },
        { name: '响应式设计', status: 'locked', badge: '🔒', chapterId: '' }
      ]
    },
    {
      id: 'mock_3', icon: '⚡', name: 'JavaScript 基础',
      completed: 3, total: 25, status: 'studying', statusText: '学习中',
      percent: 12, expanded: false,
      children: [
        { name: '变量与类型', status: 'done', badge: '✓', chapterId: '' },
        { name: '函数与作用域', status: 'progress', badge: '1', chapterId: '' },
        { name: 'DOM 操作', status: 'locked', badge: '🔒', chapterId: '' }
      ]
    },
    {
      id: 'mock_4', icon: '🛠️', name: '框架与工具',
      completed: 0, total: 18, status: 'locking', statusText: '未解锁',
      percent: 0, expanded: false,
      children: [
        { name: 'Vue.js', status: 'locked', badge: '🔒', chapterId: '' },
        { name: 'React', status: 'locked', badge: '🔒', chapterId: '' }
      ]
    },
    {
      id: 'mock_5', icon: '🔧', name: '工程化实践',
      completed: 0, total: 12, status: 'locking', statusText: '未解锁',
      percent: 0, expanded: false,
      children: [
        { name: 'Git 版本控制', status: 'locked', badge: '🔒', chapterId: '' },
        { name: 'Webpack', status: 'locked', badge: '🔒', chapterId: '' }
      ]
    },
    {
      id: 'mock_6', icon: '🚀', name: '进阶专题',
      completed: 0, total: 10, status: 'locking', statusText: '未解锁',
      percent: 0, expanded: false,
      children: [
        { name: '性能优化', status: 'locked', badge: '🔒', chapterId: '' },
        { name: '安全防护', status: 'locked', badge: '🔒', chapterId: '' }
      ]
    }
  ];
  return Promise.resolve(tree);
}

function getStudyStats() {
  return client.get('/knowledge/stats').then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response');
  }).catch(function (err) {
    console.log('[Knowledge] stats API unavailable:', err.message);
    return {
      toLearn: 8,
      toReview: 5,
      mastered: 42,
      accuracy: 67
    };
  });
}

function getStudyProgress() {
  return client.get('/knowledge/progress').then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response');
  }).catch(function (err) {
    console.log('[Knowledge] progress API unavailable:', err.message);
    return [
      { name: 'HTML', percent: 85, color: 'purple' },
      { name: 'CSS', percent: 60, color: 'cyan' },
      { name: 'JavaScript', percent: 35, color: 'orange' },
      { name: '框架', percent: 20, color: 'red' }
    ];
  });
}

function getRecommendations() {
  return client.get('/knowledge/recommendations').then(function (res) {
    if (res.code === 0 && res.data && res.data.list) return res.data.list;
    throw new Error('Invalid response');
  }).catch(function (err) {
    console.log('[Knowledge] recommendations API unavailable:', err.message);
    return [
      { id: 1, icon: '📐', title: '闭包详解', desc: 'JavaScript 核心概念', gradient: 'blue' },
      { id: 2, icon: '🎨', title: '原型链', desc: '面向对象编程基础', gradient: 'orange' },
      { id: 3, icon: '🚀', title: '异步编程', desc: 'Promise与Async/Await', gradient: 'purple' }
    ];
  });
}

function getWrongQuestions(params) {
  return client.get('/knowledge/wrong-questions', params).then(function (res) {
    if (res.code === 0 && res.data) return res.data;
    throw new Error('Invalid response');
  }).catch(function (err) {
    console.log('[Knowledge] wrong-questions API unavailable:', err.message);
    return getWrongQuestionsMock();
  });
}

function getWrongQuestionsMock() {
  var all = [
    { id: 1, date: '5天前 16:20', question: 'Flexbox 中，align-items: center 的作用是什么？', wrongAnswer: '主轴居中', correctAnswer: '交叉轴居中', knowledgeTags: ['CSS Flexbox', '布局'], practiced: true, retryCount: 2, accuracy: 50, category: 'css' },
    { id: 2, date: '1周前 10:15', question: 'JavaScript 中，typeof null 的返回值是什么？', wrongAnswer: '"null"', correctAnswer: '"object"', knowledgeTags: ['JavaScript 基础', '数据类型'], practiced: true, retryCount: 1, accuracy: 100, category: 'js' },
    { id: 3, date: '3天前 14:30', question: '在 Vue3 中，ref() 和 reactive() 的主要区别是什么？', wrongAnswer: '没有区别', correctAnswer: 'ref 用于基本类型，reactive 用于对象类型', knowledgeTags: ['Vue3', '响应式'], practiced: false, retryCount: 0, accuracy: 0, category: 'framework' },
    { id: 4, date: '2周前 09:00', question: '以下哪个 HTML 标签用于定义导航链接区域？', wrongAnswer: 'div', correctAnswer: 'nav', knowledgeTags: ['HTML 基础', '语义化标签'], practiced: true, retryCount: 1, accuracy: 100, category: 'html' },
    { id: 5, date: '4天前 16:45', question: '在 CSS 中，以下哪个属性用于设置元素的圆角？', wrongAnswer: 'border-radius: 50%', correctAnswer: 'border-radius: 8px', knowledgeTags: ['CSS 基础', '盒子模型'], practiced: false, retryCount: 0, accuracy: 0, category: 'css' },
    { id: 6, date: '1周前 11:20', question: 'CSS 中，position: sticky 的作用是什么？', wrongAnswer: '固定在视口最顶端', correctAnswer: '在滚动到指定位置后固定', knowledgeTags: ['CSS', '定位'], practiced: false, retryCount: 0, accuracy: 0, category: 'css' },
    { id: 7, date: '6天前 08:30', question: 'Flexbox 中，align-items: center 的作用是什么？', wrongAnswer: '主轴居中', correctAnswer: '交叉轴居中', knowledgeTags: ['CSS Flexbox', '布局'], practiced: true, retryCount: 2, accuracy: 50, category: 'css' },
    { id: 8, date: '3天前 20:00', question: 'JavaScript 中，以下哪个方法可以将类数组对象转换为数组？', wrongAnswer: 'Array.join()', correctAnswer: 'Array.from()', knowledgeTags: ['JavaScript', 'ES6'], practiced: false, retryCount: 0, accuracy: 0, category: 'js' },
    { id: 9, date: '5天前 15:40', question: 'TypeScript 中 interface 和 type 的主要区别是什么？', wrongAnswer: '完全一样', correctAnswer: 'interface 支持声明合并，type 不支持', knowledgeTags: ['TypeScript', '类型系统'], practiced: true, retryCount: 1, accuracy: 100, category: 'js' },
    { id: 10, date: '1周前 17:00', question: 'React 中，useEffect 的依赖数组为空时表示什么？', wrongAnswer: '每次渲染都执行', correctAnswer: '只在组件挂载时执行一次', knowledgeTags: ['React', 'Hooks'], practiced: false, retryCount: 0, accuracy: 0, category: 'framework' },
    { id: 11, date: '2天前 13:15', question: 'Node.js 中，以下哪个模块用于文件系统操作？', wrongAnswer: 'http', correctAnswer: 'fs', knowledgeTags: ['Node.js', '模块'], practiced: false, retryCount: 0, accuracy: 0, category: 'js' },
    { id: 12, date: '1天前 19:30', question: 'Promise.all 和 Promise.race 的区别是什么？', wrongAnswer: 'Promise.all 获取最快的结果', correctAnswer: 'Promise.all 等待全部完成，Promise.race 获取最快结果', knowledgeTags: ['JavaScript', 'Promise'], practiced: false, retryCount: 0, accuracy: 0, category: 'js' }
  ];
  var list = params && params.list ? { list: all } : all;
  return list;
}

module.exports = {
  buildKnowledgeTree: buildKnowledgeTree,
  getKnowledgeTreeMock: getKnowledgeTreeMock,
  getStudyStats: getStudyStats,
  getStudyProgress: getStudyProgress,
  getRecommendations: getRecommendations,
  getWrongQuestions: getWrongQuestions
};
