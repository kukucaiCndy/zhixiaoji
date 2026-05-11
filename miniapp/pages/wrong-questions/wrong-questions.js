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
    const allQuestions = [
      {
        id: 1,
        date: '5天前 16:20',
        question: 'Flexbox 中，align-items: center 的作用是什么？',
        wrongAnswer: '主轴居中',
        correctAnswer: '交叉轴居中',
        knowledgeTags: ['CSS Flexbox', '布局'],
        practiced: true,
        retryCount: 2,
        accuracy: 50,
        category: 'css'
      },
      {
        id: 2,
        date: '1周前 10:15',
        question: 'JavaScript 中，typeof null 的返回值是什么？',
        wrongAnswer: '"null"',
        correctAnswer: '"object"',
        knowledgeTags: ['JavaScript 基础', '数据类型'],
        practiced: true,
        retryCount: 1,
        accuracy: 100,
        category: 'js'
      },
      {
        id: 3,
        date: '3天前 14:30',
        question: '在 Vue3 中，ref() 和 reactive() 的主要区别是什么？',
        wrongAnswer: '没有区别',
        correctAnswer: 'ref 用于基本类型，reactive 用于对象类型',
        knowledgeTags: ['Vue3', '响应式'],
        practiced: false,
        retryCount: 0,
        accuracy: 0,
        category: 'framework'
      },
      {
        id: 4,
        date: '2周前 09:00',
        question: '以下哪个 HTML 标签用于定义导航链接区域？',
        wrongAnswer: 'div',
        correctAnswer: 'nav',
        knowledgeTags: ['HTML 基础', '语义化标签'],
        practiced: true,
        retryCount: 1,
        accuracy: 100,
        category: 'html'
      },
      {
        id: 5,
        date: '4天前 16:45',
        question: '在 CSS 中，以下哪个属性用于设置元素的圆角？',
        wrongAnswer: 'border-radius: 50%',
        correctAnswer: 'border-radius: 8px',
        knowledgeTags: ['CSS 基础', '盒子模型'],
        practiced: false,
        retryCount: 0,
        accuracy: 0,
        category: 'css'
      },
      {
        id: 6,
        date: '1周前 11:20',
        question: 'CSS 中，position: sticky 的作用是什么？',
        wrongAnswer: '固定在视口最顶端',
        correctAnswer: '在滚动到指定位置后固定',
        knowledgeTags: ['CSS', '定位'],
        practiced: false,
        retryCount: 0,
        accuracy: 0,
        category: 'css'
      },
      {
        id: 7,
        date: '6天前 08:30',
        question: 'Flexbox 中，align-items: center 的作用是什么？',
        wrongAnswer: '主轴居中',
        correctAnswer: '交叉轴居中',
        knowledgeTags: ['CSS Flexbox', '布局'],
        practiced: true,
        retryCount: 2,
        accuracy: 50,
        category: 'css'
      },
      {
        id: 8,
        date: '3天前 20:00',
        question: 'JavaScript 中，以下哪个方法可以将类数组对象转换为数组？',
        wrongAnswer: 'Array.join()',
        correctAnswer: 'Array.from()',
        knowledgeTags: ['JavaScript', 'ES6'],
        practiced: false,
        retryCount: 0,
        accuracy: 0,
        category: 'js'
      },
      {
        id: 9,
        date: '5天前 15:40',
        question: 'TypeScript 中 interface 和 type 的主要区别是什么？',
        wrongAnswer: '完全一样',
        correctAnswer: 'interface 支持声明合并，type 不支持',
        knowledgeTags: ['TypeScript', '类型系统'],
        practiced: true,
        retryCount: 1,
        accuracy: 100,
        category: 'js'
      },
      {
        id: 10,
        date: '1周前 17:00',
        question: 'React 中，useEffect 的依赖数组为空时表示什么？',
        wrongAnswer: '每次渲染都执行',
        correctAnswer: '只在组件挂载时执行一次',
        knowledgeTags: ['React', 'Hooks'],
        practiced: false,
        retryCount: 0,
        accuracy: 0,
        category: 'framework'
      },
      {
        id: 11,
        date: '2天前 13:15',
        question: 'Node.js 中，以下哪个模块用于文件系统操作？',
        wrongAnswer: 'http',
        correctAnswer: 'fs',
        knowledgeTags: ['Node.js', '模块'],
        practiced: false,
        retryCount: 0,
        accuracy: 0,
        category: 'js'
      },
      {
        id: 12,
        date: '1天前 19:30',
        question: 'Promise.all 和 Promise.race 的区别是什么？',
        wrongAnswer: 'Promise.all 获取最快的结果',
        correctAnswer: 'Promise.all 等待全部完成，Promise.race 获取最快结果',
        knowledgeTags: ['JavaScript', 'Promise'],
        practiced: false,
        retryCount: 0,
        accuracy: 0,
        category: 'js'
      }
    ];

    this._allQuestions = allQuestions;
    this.setData({
      totalWrong: allQuestions.length
    });
    this.applyFilter('all');
  },

  applyFilter(filter) {
    var questions = this._allQuestions;
    if (filter === 'pending') {
      questions = this._allQuestions.filter(q => !q.practiced);
    } else if (filter === 'mastered') {
      questions = this._allQuestions.filter(q => q.practiced);
    } else if (filter !== 'all') {
      questions = this._allQuestions.filter(q => q.category === filter);
    }
    var pending = questions.filter(q => !q.practiced).length;
    var mastered = questions.filter(q => q.practiced).length;
    var newWrong = this._allQuestions.filter(q => !q.practiced && !q.retryCount).length;
    this.setData({
      wrongQuestions: questions,
      pendingCount: pending,
      masteredCount: mastered,
      newWrongCount: newWrong
    });
  },

  onFilter(e) {
    const filter = e.currentTarget.dataset.filter;
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
      fail() {
        wx.switchTab({ url: '/pages/home/home' });
      }
    });
  },

  onRetryQuestion(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '开始练习',
      icon: 'none'
    });
  },

  onStartRetry() {
    const pending = this.data.wrongQuestions.filter(q => !q.practiced);
    if (pending.length === 0) {
      wx.showToast({
        title: '没有待练习的错题',
        icon: 'none'
      });
      return;
    }
    wx.showToast({
      title: `开始重练 ${pending.length} 道错题`,
      icon: 'none'
    });
  }
});