# SDK 新增接口需求文档

> 提供给后端 SDK 团队，用于在 `@zhixiaoji/api-sdk-wechat` 的 `KnowledgeApi` 类中新增以下方法。

---

## 1. 学习统计

### 接口说明
获取用户的学习统计数据，用于首页顶部展示。

### SDK 方法签名
```typescript
class KnowledgeApi {
  getStudyStats(): Promise<ApiResponse<StudyStats>>;
}
```

### 响应数据结构
```typescript
interface StudyStats {
  toLearn: number;        // 待学习卡片数
  toReview: number;       // 待复习卡片数
  mastered: number;       // 已掌握卡片数
  accuracy: number;       // 正确率（百分比，如 86）
}
```

### HTTP 路径
```
GET /knowledge/stats
```

### 前端消费
[pages/home/home.js](file:///f:/work/software/zhixiaoji/miniapp/pages/home/home.js) — `data.stats` 对象展示

---

## 2. 学习进度

### 接口说明
获取用户在各知识体系中的学习进度列表。

### SDK 方法签名
```typescript
class KnowledgeApi {
  getStudyProgress(): Promise<ApiResponse<StudyProgressItem[]>>;
}
```

### 响应数据结构
```typescript
interface StudyProgressItem {
  categoryId: string;       // 分类 ID
  categoryName: string;     // 分类名称
  totalLessons: number;     // 总课程数
  completedLessons: number; // 已完成课程数
}
```

### HTTP 路径
```
GET /knowledge/progress
```

### 前端消费
[pages/home/home.js](file:///f:/work/software/zhixiaoji/miniapp/pages/home/home.js) — `data.progress` 数组展示

---

## 3. 推荐内容

### 接口说明
获取用户的推荐学习内容，用于首页"继续学习"区域。

### SDK 方法签名
```typescript
class KnowledgeApi {
  getRecommendations(): Promise<ApiResponse<RecommendationItem[]>>;
}
```

### 响应数据结构
```typescript
interface RecommendationItem {
  id: string;           // 推荐内容 ID（如科目 ID）
  title: string;        // 推荐标题
  icon: string;         // Emoji/图片/SVG 图标
  description?: string; // 推荐描述
  type: 'subject' | 'chapter' | 'lesson';  // 推荐类型
  targetId: string;     // 跳转目标 ID
}
```

### HTTP 路径
```
GET /knowledge/recommendations
```

### 前端消费
[pages/learn/learn.js](file:///f:/work/software/zhixiaoji/miniapp/pages/learn/learn.js) — 首页"继续学习"卡片

---

## 4. 错题列表

### 接口说明
获取用户的错题列表，支持筛选。

### SDK 方法签名
```typescript
class KnowledgeApi {
  getWrongQuestions(params?: WrongQuestionQueryParams): Promise<ApiResponse<WrongQuestion[]>>;
}

interface WrongQuestionQueryParams {
  status?: 'pending' | 'mastered'; // 筛选状态
  category?: string;                // 按分类筛选
}
```

### 响应数据结构
```typescript
interface WrongQuestion {
  id: string;
  question: string;      // 题目内容
  answer: string;        // 正确答案
  userAnswer: string;    // 用户错误答案
  category: string;      // 所属分类
  categoryName: string;  // 分类名称
  practiced: boolean;    // 是否已重练
  retryCount: number;    // 重练次数
  wrongCount: number;    // 错误次数
  lastWrongAt: string;   // 最后错误时间
}
```

### HTTP 路径
```
GET /knowledge/wrong-questions
```

### 前端消费
[pages/wrong-questions/wrong-questions.js](file:///f:/work/software/zhixiaoji/miniapp/pages/wrong-questions/wrong-questions.js) — 错题本页面

---

## 优先级建议

| 接口 | 优先级 | 说明 |
|------|--------|------|
| 学习统计 | P0 | 首页核心数据，影响首屏体验 |
| 推荐内容 | P0 | 首页"继续学习"功能依赖 |
| 学习进度 | P1 | 首页次要数据，无数据不影响使用 |
| 错题列表 | P1 | 二级页面，可后置 |

## 对接规范

1. 所有接口路径统一使用 `/knowledge/` 前缀，core-service 代理转发到 knowledge-service
2. 新增方法统一挂载到 `KnowledgeApi` 类
3. 响应格式统一为 `ApiResponse<T>` (code + data + message)
4. 认证头通过 SDK 的 `HttpClient` 自动携带，无需额外处理
