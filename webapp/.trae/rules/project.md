# 知晓记管理后台 - 项目文档

> **项目名称**：知晓记运营管理后台（Web 端）
> **创建日期**：2026-05-04
> **当前阶段**：项目初始化

---

## 一、项目概述

### 1.1 项目简介

本项目是「知晓记」小程序的 **Web 端运营管理后台**，为运营人员提供一站式内容管理与运营配置平台。通过可视化的操作界面，让非技术人员也能高效管理小程序的知识内容、用户数据及运营策略。

### 1.2 关联项目

| 项目 | 平台 | 说明 |
|------|------|------|
| **知晓记小程序** | 微信小程序 | 面向终端用户的 AI 编程入门学习工具 |
| **知晓记管理后台**（本项目） | Web 端 | 面向运营人员的内容管理与运营配置平台 |

### 1.3 技术定位

- **项目类型**：纯粹的前端项目（Web SPA）
- **目标浏览器**：Chrome 90+、Firefox 88+、Edge 90+、Safari 14+
- **推荐分辨率**：1920×1080

### 1.4 核心功能模块

| 模块 | 功能描述 |
|------|----------|
| **数据看板** | 核心指标监控、用户趋势分析、内容消费数据、学习转化漏斗 |
| **内容管理** | 知识体系建设、知识卡片 CRUD、题目管理、AI 内容生成、上下架控制 |
| **用户管理** | 用户列表与详情、笔记管理与审核、学习记录、积分记录 |
| **运营管理** | 广告位管理、页面装饰、积分规则、文具管理、等级体系、成就系统、排行榜、限定道具、消息推送 |
| **系统配置** | 账号设置、复习规则配置、日志审计 |

### 1.5 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 小程序 PRD | [doc/PRD.md](doc/PRD.md) | 知晓记小程序产品需求文档 |
| 管理后台 PRD | [doc/Admin-PRD.md](doc/Admin-PRD.md) | 管理后台产品需求文档 |
| 交互设计文档 | [doc/交互设计文档.md](doc/交互设计文档.md) | 管理后台交互设计规格说明 |
| 技术方案设计文档 | [doc/技术方案设计文档.md](doc/技术方案设计文档.md) | 技术选型、架构设计、目录结构、AI 工作流方案 |
| 代码开发规范 | [.trae/rules/code_rule.md](.trae/rules/code_rule.md) | Vue 3 + TypeScript 编码规范、命名规范、组件规范 |

---

## 二、项目开发里程碑

| 里程碑 | 阶段 | 交付内容 | 状态 |
|--------|------|----------|------|
| **M0** | 项目初始化 | 项目搭建、基础配置、UI 框架选型、目录结构设计 | 🟢 已完成（技术方案与开发规范已输出） |
| **M1** | 基础框架 | 登录模块、整体布局（顶栏+侧边栏+主内容区）、路由设计、权限控制框架 | 🔴 未开始 |
| **M2** | 数据看板 | 核心指标卡片、用户增长趋势图、活跃用户留存、内容消费数据、学习转化漏斗、热门内容排行 | 🔴 未开始 |
| **M3** | 内容管理 | 知识体系管理（篇章/章节 CRUD 拖拽排序）、知识卡片 CRUD（富文本编辑器）、题目管理（单选/多选/判断、批量导入导出）、AI 内容生成页面 | 🔴 未开始 |
| **M4** | 用户管理 | 用户列表与详情、笔记管理与审核、学习记录查看、积分记录与调整 | 🔴 未开始 |
| **M5** | 运营管理 | 广告位管理、页面装饰（Banner/主题色/首页模块排序）、积分规则、文具管理、等级体系、成就系统、排行榜、限定道具、消息推送 | 🔴 未开始 |
| **M6** | 系统配置 | 账号设置、复习规则配置、日志审计 | 🔴 未开始 |
| **M7** | 联调测试 | 整体联调、UAT 测试、Bug 修复、性能优化 | 🔴 未开始 |
| **M8** | 上线发布 | 正式上线、运营培训、文档完善 | 🔴 未开始 |

---

## 三、强制开发要求

### 3.1 工作流程要求

1. **加载 project.md**：每次开发会话开始时，必须在上下文中加载本文件（project.md），确保对项目全局有清晰认知。
2. **意图确认**：每次接收到任务后，需仔细分析用户意图。若有不理解或认为意图模糊之处，必须先反问用户确认意图后再执行。
3. **Agent 协同**：执行任务时，需在合适的 Agent 配置中选取 Agent 调用。若能同时协同多个 Agent，则协同调用多个 Agent 完成任务，提升任务效率。
4. **Git 提交**：每次修改完成后，必须提交代码修改记录到本地仓库。
5. **禁止擅自推送**：用户未主动要求时，不得擅自将代码提交到远程仓库。
6. **README 维护**：在工作目录维护一个 [README.md](README.md) 文件，说明该目录下项目内容的情况。

### 3.2 核心原则：前端先行、接口以文档为准

这是一个**纯粹的前端项目**，在后端接口对接时必须遵循以下原则：

1. **以文档为先**：调用后端 API 时，必须严格按照后端 SDK/API 文档进行调用。
2. **接口问题归因**：若发现后端 SDK 实际行为与文档定义不符，直接返回问题原因在后端，**不得**强行改变前端业务逻辑来适配后端。
   - 举例：后端 SDK 文档中对某个 API 的定义与后端提供的 SDK 实际不符合时，必须坚持以文档为主，不得直接使用后端 SDK 中提供的不符合规范的 SDK 实现。
3. **不自行修正**：遇到后端接口问题，应当明确记录并反馈，而不是尝试在前端侧做额外适配来掩盖后端问题。

---

## 四、私有依赖说明

### 4.1 私有 npm 仓库

本项目的 npm 依赖分为两部分：公网包（Vue / Element Plus 等，从 npmmirror.com 安装）和私有 SDK 包（`@zhixiaoji/*`，从内网 npm 仓库安装）。

| 配置项 | 值 |
|--------|-----|
| 仓库地址 | `http://192.168.16.129:4873` |
| 仓库范围 | `@zhixiaoji` |
| 仓库页面 | [http://192.168.16.129:4873/-/web/detail/@zhixiaoji/api-sdk-web](http://192.168.16.129:4873/-/web/detail/@zhixiaoji/api-sdk-web) |

### 4.2 SDK 包列表

| 包名 | 最新版本 | 用途 | 目标平台 |
|------|----------|------|----------|
| `@zhixiaoji/api-sdk-web` | 0.1.1 | Web 管理后台 API 客户端 | Vue 3 / 浏览器 |
| `@zhixiaoji/api-sdk-wechat` | 0.7.1 | 微信小程序 API 客户端 | 微信小程序 |

### 4.3 安装方式

#### 方式一：npm 直接安装（仓库可用时）

```bash
# 配置 @zhixiaoji scope 指向私有仓库
npm config set @zhixiaoji:registry http://192.168.16.129:4873

# Web 管理后台
cd webapp
npm install @zhixiaoji/api-sdk-web@0.1.1

# 小程序
cd miniapp
npm install @zhixiaoji/api-sdk-wechat@0.7.1
```

#### 方式二：离线 tarball 安装（仓库不可用时）

```bash
# 1. 用 curl 下载 tarball（注意使用 --noproxy '*' 绕过代理）
curl --noproxy '*' -L -o sdk.tgz "http://192.168.16.129:4873/@zhixiaoji/api-sdk-web/-/api-sdk-web-0.1.1.tgz"

# 2. 从本地 tarball 安装
cd webapp
npm install ./sdk.tgz
```

> **注意**：离线安装后 `package.json` 中会记录 `"file:..."` 路径，如果仓库恢复可用，建议改用方式一重新安装以获取更友好的依赖声明。

#### 方式三：直接复用已安装的 SDK

如果 `miniapp/node_modules/@zhixiaoji/` 下已有所需的 SDK 包，可以直接复制到 webapp：

```bash
cp -r miniapp/node_modules/@zhixiaoji/api-sdk-web webapp/node_modules/@zhixiaoji/
```

> **注意**：此方式不会写入 `package.json`，需要手动添加依赖声明。

### 4.4 SDK API 概览

详见 SDK 仓库页面：[http://192.168.16.129:4873/-/web/detail/@zhixiaoji/api-sdk-web](http://192.168.16.129:4873/-/web/detail/@zhixiaoji/api-sdk-web)

| 方法 | 说明 |
|------|------|
| `createApiClient(config)` | 创建通用 API 客户端 |
| `createVue3ApiClient(options)` | 创建 Vue 3 + Pinia 集成客户端 |
| `auth.adminLogin(data)` | 管理后台登录 |
| `auth.refreshToken(data)` | 刷新 JWT Token |
| `auth.logout()` | 退出登录 |
| `auth.getProfile()` | 获取当前用户信息 |
| `auth.getAdminProfile()` | 获取当前管理员信息 |
| `auth.updateProfile(userId, data)` | 更新用户信息 |
| `auth.getUsers(params)` | 获取用户列表（后台） |
| `auth.updateUserStatus(userId, data)` | 禁用/启用用户 |
| `setToken(token)` | 设置 JWT Token |
| `clearToken()` | 清除 Token |
| `setLogEnabled(enabled)` | 开启/关闭调试日志 |

### 4.5 本项目 SDK 初始化

SDK 客户端初始化在 [src/api/sdk-client.ts](src/api/sdk-client.ts)：

```typescript
import { createApiClient, localStorageAdapter } from '@zhixiaoji/api-sdk-web'

const api = createApiClient({
  baseURL: 'http://192.168.16.129:3001/api/v1',
  storage: localStorageAdapter,
  onAuthError: () => {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  },
  enableLog: true
})
```

Token 存储 key 统一为 `accessToken`，由 SDK `localStorageAdapter` 自动管理。

---

## 五、目录结构

```
webapp/
├── doc/                      # 项目文档
│   ├── PRD.md                # 小程序产品需求文档
│   ├── Admin-PRD.md          # 管理后台产品需求文档
│   └── 交互设计文档.md         # 管理后台交互设计文档
├── project.md                # 项目总览文档（本文件）
└── README.md                 # 项目说明
```

---

> **文档修订记录**
>
> | 版本 | 日期 | 修订人 | 修订内容 |
> |------|------|--------|----------|
> | V1.0 | 2026-05-04 | 开发团队 | 初始版本，完成项目总览与里程碑定义 |
> | V1.1 | 2026-05-15 | 开发团队 | 新增第四章"私有依赖说明"，记录 SDK 安装方式与 API 概览 |
