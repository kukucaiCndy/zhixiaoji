/**
 * 图标辅助工具
 * 支持三种图标类型：Emoji、PNG 图片、SVG 图片
 */

/**
 * 判断是否为图片 URL（以 http/https 开头）
 */
function isImageUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return /^https?:\/\//.test(value);
}

/**
 * 判断图标类型
 * @param {string} value - 图标值
 * @returns {string} 'emoji' | 'image'
 */
function iconType(value) {
  if (!value) return 'emoji';
  if (isImageUrl(value)) return 'image';
  return 'emoji';
}

/**
 * 为图标对象添加 iconType 字段
 * @param {Object} item - 包含 icon 字段的对象
 * @param {string} item.icon - 图标值
 * @param {string} [fallback] - 默认 Emoji 图标
 * @returns {Object} 原对象（已变异）
 */
function decorateIcon(item, fallback) {
  if (!item.icon) {
    item.icon = fallback || '📚';
  }
  item.iconType = iconType(item.icon);
  return item;
}

module.exports = {
  isImageUrl: isImageUrl,
  iconType: iconType,
  decorateIcon: decorateIcon
};
