---
description: 
alwaysApply: true
enabled: true
updatedAt: 2026-06-18T04:47:14.044Z
provider: 
---

# 知晓记小程序 - 组件使用指南

> 本文档记录项目所有弹窗/组件的使用场景和引入方式。

---

## 一、组件体系架构

```
基础层:     base-modal.wxss (公共样式基座)
               │
核心层:     unified-modal (统一弹窗，覆盖全部6种模式)
               │
特殊层:     toast-direct-unlock (独立Toast结构)
            modal-xxx (少量独立结构组件)
```

全部组件从设计稿 21 个合并为 **4 个核心组件**：

| 组件 | 说明 | 文件数 |
|------|------|:------:|
| [unified-modal](file:///f:/work/software/zhixiaoji/miniapp/components/unified-modal) | 统一弹窗，配置驱动，覆盖 90% 场景 | 4 |
| [toast-direct-unlock](file:///f:/work/software/zhixiaoji/miniapp/components/toast-direct-unlock) | Toast 轻提示，2秒自动消失 | 4 |
| [base-modal](file:///f:/work/software/zhixiaoji/miniapp/components/base-modal) | Slot 插槽基础组件，用于自定义布局 | 4 |
| [base-modal.wxss](file:///f:/work/software/zhixiaoji/miniapp/components/base-modal.wxss) | 公共样式基座 | 1 |

---

## 二、unified-modal 统一弹窗（首选）

### 使用方式

```json
{
  "usingComponents": {
    "unified-modal": "/components/unified-modal/unified-modal"
  }
}
```

### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | Boolean | false | 显示/隐藏 |
| icon | String | '' | Emoji 图标 |
| iconBg | Boolean | false | 是否金色圆形背景 |
| title | String | '' | 弹窗标题 |
| desc | String | '' | 描述文字 |
| score | String | '' | 大号数字（36px） |
| scoreLabel | String | '' | 数字下方说明 |
| scoreColor | String | #F59E0B | 数字颜色 |
| richText | Array | [] | 富文本片段[{text, color, bold}] |
| primaryText | String | '' | 主按钮文字 |
| primaryType | String | primary | 按钮样式(primary/warning/danger) |
| secondaryText | String | '' | 次按钮文字 |
| singleBtn | Boolean | false | 仅显示一个按钮居中 |
| maskClosable | Boolean | false | 遮罩可点击关闭 |
| rarity | String | '' | 稀有度(common/advanced/high/legend) |
| contentName | String | '' | 内容名称(紫色高亮) |

### 事件

| 事件 | 说明 |
|------|------|
| bind:primary | 主按钮点击 |
| bind:secondary | 次按钮/遮罩关闭 |

### 各场景用法

```xml
<!-- 网络异常：单按钮，遮罩不可关 -->
<unified-modal show="{{show}}" icon="⚠️" title="网络异常"
  desc="请检查网络连接后重试" singleBtn="{{true}}"
  primaryText="重新连接" bind:primary="onRetry" />

<!-- 学习完成 -->
<unified-modal show="{{show}}" icon="🎉" title="学习完成"
  desc="今日学习目标已完成！"
  primaryText="继续学习" secondaryText="返回首页"
  bind:primary="onContinue" bind:secondary="onGoHome" />

<!-- 获得积分：金色圆形背景图标 -->
<unified-modal show="{{show}}" icon="⭐" iconBg="{{true}}"
  title="获得积分" score="+30"
  desc="观看激励视频任务"
  primaryText="去查看" primaryType="warning"
  secondaryText="知道了" bind:primary="onView" />

<!-- 答题结果：富文本含颜色 -->
<unified-modal show="{{show}}" title="答题结果"
  score="{{score}}分" scoreColor="#F59E0B"
  richText="{{quizRichText}}"
  primaryText="再测一次" secondaryText="查看解析" />

<!-- 复习提醒：大数字 -->
<unified-modal show="{{show}}" icon="🔔" title="复习提醒"
  score="{{reviewCount}}" scoreLabel="个知识点待复习"
  primaryText="开始复习" secondaryText="稍后再说" />

<!-- 删除确认：红色警告按钮 -->
<unified-modal show="{{show}}" icon="⚠️" title="确认删除"
  desc="删除后无法恢复"
  primaryText="确认删除" primaryType="danger"
  secondaryText="取消" />

<!-- 文具掉落：稀有度+内容名 -->
<unified-modal show="{{show}}" icon="📦" title="获得文具"
  rarity="{{rarity}}" contentName="{{stationeryName}}"
  primaryText="查看书桌" secondaryText="知道了" />

<!-- 解锁成功 -->
<unified-modal show="{{show}}" icon="✨" title="解锁成功"
  contentName="{{contentName}}" desc="开始学习吧！"
  primaryText="开始学习" secondaryText="知道了" />

<!-- 成就达成 -->
<unified-modal show="{{show}}" icon="🏆" title="成就达成"
  contentName="{{achievementName}}" desc="{{achievementDesc}}"
  primaryText="查看成就" secondaryText="知道了" />

<!-- 幸运解锁：警告色按钮 -->
<unified-modal show="{{show}}" icon="🍀" title="幸运解锁"
  desc="30%概率免费解锁"
  primaryText="试试手气" primaryType="warning"
  secondaryText="积分解锁" />

<!-- 合成成功 -->
<unified-modal show="{{show}}" icon="✨" title="合成成功"
  rarity="{{rarity}}" contentName="{{stationeryName}}"
  primaryText="查看文具" secondaryText="知道了" />

<!-- 合成失败 -->
<unified-modal show="{{show}}" icon="💔" title="合成失败"
  desc="下次一定成功！" singleBtn="{{true}}"
  primaryText="知道了" />

<!-- 笔记审核中 -->
<unified-modal show="{{show}}" icon="📝" title="笔记审核中"
  desc="你的笔记已提交审核" singleBtn="{{true}}"
  primaryText="知道了" />

<!-- 邀请好友 -->
<unified-modal show="{{show}}" icon="🎁" title="邀请好友"
  desc="邀请好友即可获得限定道具"
  primaryText="生成海报" secondaryText="稍后再说" />

<!-- 邀请进度 -->
<unified-modal show="{{show}}" icon="📊" title="邀请进度"
  score="{{invitedCount}}" scoreLabel="已邀请好友数"
  desc="继续邀请可获得限定道具"
  primaryText="继续邀请" secondaryText="知道了" />

<!-- 获得限定道具 -->
<unified-modal show="{{show}}" icon="🎊" title="获得限定道具"
  rarity="{{rarity}}" contentName="{{itemName}}"
  primaryText="查看道具" secondaryText="知道了" />

<!-- 限定道具预览 -->
<unified-modal show="{{show}}" icon="👑" title="限定道具预览"
  rarity="{{rarity}}" contentName="{{itemName}}"
  desc="{{condition}}" singleBtn="{{true}}"
  primaryText="我知道了" />
```

---

## 三、特殊组件

### toast-direct-unlock

独立 Toast 结构，2 秒自动消失，无按钮交互。

```xml
<toast-direct-unlock show="{{showToast}}" />
```

### base-modal

Slot 插槽模式，用于特殊布局的自定义弹窗。

```xml
<base-modal visible="{{show}}" title="自定义标题"
  showCancel="{{false}}" confirmText="知道了">
  <view class="custom-content">自定义内容</view>
</base-modal>
```

---

## 四、组件选用决策树

```
需要弹窗提示
    │
    ├── 仅需轻量提示，自动消失 → toast-direct-unlock
    │
    ├── 需要完全自定义布局内容 → base-modal (slot)
    │
    └── 通用弹窗场景 → unified-modal (配置驱动)
            │
            ├── 单按钮+遮罩不可关: singleBtn maskClosable
            ├── 大数字展示: score scoreLabel scoreColor
            ├── 富文本含颜色标记: richText
            ├── 稀有度+内容名: rarity contentName
            ├── 警告/危险操作: primaryType=warning/danger
            └── 金色图标背景: iconBg
```

---

## 五、开发规范

### 文件结构

```
component-name/
├── component-name.wxml    # 模板
├── component-name.wxss    # 样式（@import 公共基座）
├── component-name.js      # 逻辑
└── component-name.json    # 配置
```

### 样式规范

- 必须 `@import "../base-modal.wxss"` 引用公共样式基座
- 新组件样式使用前缀 `.modal-` 或 `.unified-`

### JS 规范

- 显示控制属性统一命名 `show`（Boolean）
- 事件名统一小写英文，多个单词连续（如 `startreview`）

---

## 六、目录索引

```
components/
├── base-modal.wxss              # 公共样式基座（所有弹窗共享）
├── base-modal/                  # Slot 插槽组件（自定义布局用）
├── unified-modal/               # 统一弹窗（配置驱动，90%场景）
└── toast-direct-unlock/         # Toast 轻提示（独特结构）
```

---

*本文档记录于 2026-05-09，随组件库演进持续更新。*