/**
 * 图标辅助工具
 * 支持三种图标类型：Emoji、图片 URL（PNG/SVG）、内联 SVG
 */

/**
 * 判断是否为图片 URL（以 http/https 开头）
 */
function isImageUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return /^https?:\/\//.test(value);
}

/**
 * 判断是否为内联 SVG（以 <svg 开头）
 */
function isInlineSvg(value) {
  if (!value || typeof value !== 'string') return false;
  return value.indexOf('<svg') === 0;
}

/**
 * 将内联 SVG 转为 data URI
 */
function svgToDataUri(svgString) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}

/**
 * 判断图标类型
 * @param {string} value - 图标值
 * @returns {string} 'emoji' | 'image' | 'svg'
 */
function iconType(value) {
  if (!value) return 'emoji';
  if (isInlineSvg(value)) return 'svg';
  if (isImageUrl(value)) return 'image';
  return 'emoji';
}

/**
 * 为图标对象添加 iconType 字段
 * 内联 SVG 会自动转为 data URI，iconType 设为 'image' 以复用 <image> 渲染
 * @param {Object} item - 包含 icon 字段的对象
 * @param {string} item.icon - 图标值
 * @param {string} [fallback] - 默认 Emoji 图标
 * @returns {Object} 原对象（已变异）
 */
function decorateIcon(item, fallback) {
  if (!item.icon) {
    item.icon = fallback || '📚';
  }

  var type = iconType(item.icon);

  // 内联 SVG 转为 data URI，走 <image> 渲染
  if (type === 'svg') {
    item.icon = svgToDataUri(item.icon);
    type = 'image';
  }

  item.iconType = type;
  return item;
}

module.exports = {
  isImageUrl: isImageUrl,
  isInlineSvg: isInlineSvg,
  svgToDataUri: svgToDataUri,
  iconType: iconType,
  decorateIcon: decorateIcon
};
