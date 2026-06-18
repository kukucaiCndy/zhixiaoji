/**
 * 主题状态管理模块
 *
 * 三态模式：light / dark / auto（跟随系统）
 * - 用户设置存本地，effectiveTheme 为实际生效值（light/dark）
 * - auto 模式监听 wx.onThemeChange，系统切换时同步
 * - 全局状态保存在 app.globalData.theme / app.globalData.effectiveTheme
 *
 * 用法：
 *   const theme = require('utils/theme');
 *   theme.init(app);                 // app.js onLaunch
 *   theme.setTheme('dark');          // 设置页切换
 *   theme.getEffectiveTheme();       // 页面 onShow 取值
 */

const { STORAGE_KEYS, THEME_MODE } = require('./constants');
const storage = require('./storage');

/**
 * 解析系统当前主题偏好
 * @returns {string} 'light' | 'dark'
 */
function getSystemTheme() {
  try {
    var info = wx.getSystemInfoSync();
    // 新版本用 theme，旧版本 fallback 到亮色
    if (info && (info.theme === 'dark' || info.theme === 'light')) {
      return info.theme;
    }
  } catch (e) {}
  return 'light';
}

/**
 * 读取用户设置的主题模式（本地存储）
 * @returns {string} 'auto' | 'light' | 'dark'
 */
function getUserTheme() {
  var saved = storage.getSync(STORAGE_KEYS.THEME);
  if (saved === THEME_MODE.LIGHT || saved === THEME_MODE.DARK || saved === THEME_MODE.AUTO) {
    return saved;
  }
  return THEME_MODE.AUTO; // 默认跟随系统
}

/**
 * 计算实际生效主题
 * @param {string} userTheme 用户设置的模式
 * @returns {string} 'light' | 'dark'
 */
function resolveEffectiveTheme(userTheme) {
  if (userTheme === THEME_MODE.LIGHT) return 'light';
  if (userTheme === THEME_MODE.DARK) return 'dark';
  return getSystemTheme(); // auto
}

/**
 * 获取当前生效主题
 * @returns {string} 'light' | 'dark'
 */
function getEffectiveTheme() {
  var app = getApp();
  if (app && app.globalData && app.globalData.effectiveTheme) {
    return app.globalData.effectiveTheme;
  }
  return resolveEffectiveTheme(getUserTheme());
}

/**
 * 获取用户设置的主题模式
 * @returns {string} 'auto' | 'light' | 'dark'
 */
function getUserThemeSync() {
  var app = getApp();
  if (app && app.globalData && app.globalData.theme) {
    return app.globalData.theme;
  }
  return getUserTheme();
}

/**
 * 应用主题到全局状态
 * @param {string} userTheme 'auto' | 'light' | 'dark'
 * @param {Object} app app实例
 */
function applyTheme(userTheme, app) {
  var effective = resolveEffectiveTheme(userTheme);
  app.globalData = app.globalData || {};
  app.globalData.theme = userTheme;
  app.globalData.effectiveTheme = effective;
  return effective;
}

/**
 * 初始化主题（app.js onLaunch 调用）
 * @param {Object} app app实例
 */
function init(app) {
  var userTheme = getUserTheme();
  applyTheme(userTheme, app);

  // 监听系统主题变化（仅 auto 模式响应）
  if (typeof wx.onThemeChange === 'function') {
    wx.onThemeChange(function (res) {
      var current = getUserThemeSync();
      if (current === THEME_MODE.AUTO) {
        var effective = res.theme === 'dark' ? 'dark' : 'light';
        app.globalData = app.globalData || {};
        app.globalData.effectiveTheme = effective;
        // 通知所有打开的页面刷新
        notifyPages(effective);
      }
    });
  }
}

/**
 * 设置主题（设置页调用）
 * @param {string} mode 'auto' | 'light' | 'dark'
 * @returns {string} 实际生效主题
 */
function setTheme(mode) {
  var app = getApp();
  var valid = (mode === THEME_MODE.LIGHT || mode === THEME_MODE.DARK || mode === THEME_MODE.AUTO);
  if (!valid) mode = THEME_MODE.AUTO;

  storage.setSync(STORAGE_KEYS.THEME, mode);
  var effective = applyTheme(mode, app);
  notifyPages(effective);
  return effective;
}

/**
 * 通知所有打开的页面刷新主题
 * 通过 getCurrentPages 遍历，调用页面的 onThemeChange 钩子（如有）
 * @param {string} effective 'light' | 'dark'
 */
function notifyPages(effective) {
  var pages = getCurrentPages();
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    // 优先调用页面自定义的 onThemeChange
    if (typeof page.onThemeChange === 'function') {
      page.onThemeChange(effective);
    } else {
      // 默认行为：更新 data.theme
      if (page.setData) {
        page.setData({ theme: effective });
      }
    }
  }
}

module.exports = {
  init: init,
  setTheme: setTheme,
  getEffectiveTheme: getEffectiveTheme,
  getUserTheme: getUserThemeSync,
  getSystemTheme: getSystemTheme
};
