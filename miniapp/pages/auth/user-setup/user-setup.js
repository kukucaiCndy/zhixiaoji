var STORAGE_KEYS = require('../../../utils/constants').STORAGE_KEYS;
var theme = require('../../../utils/theme');

var TAG_DATA = [
  { name: 'Python', color: 'blue' },
  { name: 'JavaScript', color: 'warm' },
  { name: 'TypeScript', color: 'blue' },
  { name: 'React', color: 'blue' },
  { name: 'Vue', color: 'green' },
  { name: '前端开发', color: 'blue' },
  { name: 'CSS', color: 'purple' },
  { name: 'HTML', color: 'warm' },
  { name: '后端开发', color: 'gray' },
  { name: '计算机基础', color: 'gray' },
  { name: '算法', color: 'purple' },
  { name: '数据结构', color: 'gray' },
  { name: 'SQL', color: 'green' },
  { name: 'Git', color: 'purple' },
  { name: 'Node.js', color: 'green' },
  { name: 'Go', color: 'blue' },
  { name: 'Rust', color: 'warm' },
  { name: 'Java', color: 'warm' },
  { name: '机器学习', color: 'purple' },
  { name: 'AI', color: 'purple' },
  { name: '云计算', color: 'gray' },
  { name: '测试', color: 'green' },
  { name: 'Docker', color: 'blue' },
  { name: 'Linux', color: 'gray' },
  { name: '网络安全', color: 'warm' }
];

// 预计算标签位置（椭圆形分布）
function buildTagPositions() {
  var cx = 327;  // cloud center x (rpx)
  var cy = 340;  // cloud center y (rpx)
  var rx = 280;  // ellipse radius x
  var ry = 260;  // ellipse radius y

  var tags = [];
  for (var i = 0; i < TAG_DATA.length; i++) {
    var angle = (i / TAG_DATA.length) * Math.PI * 2 - Math.PI / 2;
    // 添加一些随机偏移
    var jitter = (Math.random() - 0.5) * 60;
    var x = cx + Math.cos(angle) * rx + jitter;
    var y = cy + Math.sin(angle) * ry + (Math.random() - 0.5) * 40;
    // 将标签中心对齐
    x = Math.round(x - 60);
    y = Math.round(y - 30);

    tags.push({
      name: TAG_DATA[i].name,
      color: TAG_DATA[i].color,
      x: Math.max(0, Math.min(x, 550)),
      y: Math.max(0, Math.min(y, 680)),
      selected: false
    });
  }
  return tags;
}

Page({
  data: {
    theme: 'light',
    tags: [],
    selectedCount: 0
  },

  _selectedNames: {},

  onLoad() {
    this.setData({ theme: theme.getEffectiveTheme() });
    var saved;
    try { saved = wx.getStorageSync(STORAGE_KEYS.USER_PREFERENCES); } catch (e) {}
    if (!saved || !saved.length) saved = ['Python'];
    var sel = {};
    saved.forEach(function (k) { sel[k] = true; });
    this._selectedNames = sel;

    var tags = buildTagPositions();
    for (var i = 0; i < tags.length; i++) {
      if (sel[tags[i].name]) {
        tags[i].selected = true;
      }
    }
    this.setData({ tags: tags });
    this.updateCount();
  },

  onShow() {
    this.setData({ theme: theme.getEffectiveTheme() });
  },

  onThemeChange(effective) {
    this.setData({ theme: effective });
  },

  onTagTap(e) {
    var index = e.currentTarget.dataset.index;
    var name = TAG_DATA[index].name;
    if (this._selectedNames[name]) {
      delete this._selectedNames[name];
    } else {
      this._selectedNames[name] = true;
    }

    var tags = this.data.tags;
    tags[index].selected = !tags[index].selected;
    this.setData({ tags: tags });
    this.updateCount();

    var sel = [];
    for (var k in this._selectedNames) {
      if (this._selectedNames[k]) sel.push(k);
    }
    wx.setStorageSync(STORAGE_KEYS.USER_PREFERENCES, sel);
  },

  updateCount() {
    var count = 0;
    for (var k in this._selectedNames) {
      if (this._selectedNames[k]) count++;
    }
    this.setData({ selectedCount: count });
  },

  onSkip() {
    wx.setStorageSync(STORAGE_KEYS.GUIDE_SHOWN, true);
    wx.reLaunch({ url: '/pages/home/home' });
  },

  onStart() {
    var sel = [];
    for (var k in this._selectedNames) {
      if (this._selectedNames[k]) sel.push(k);
    }
    wx.setStorageSync(STORAGE_KEYS.USER_PREFERENCES, sel);
    wx.setStorageSync(STORAGE_KEYS.GUIDE_SHOWN, true);
    wx.reLaunch({ url: '/pages/home/home' });
  }
});
