# 智小记小程序

## 项目简介

本项目是一个基于微信原生框架开发的微信小程序，目前处于项目初始化阶段，尚未开始正式的功能开发。

## 技术栈

- **框架**：微信小程序原生框架
- **样式**：WXSS / CSS
- **逻辑**：JavaScript (ES6+)
- **配置**：JSON

## 项目结构

```
miniapp/
├── app.js                    # 小程序入口逻辑
├── app.json                  # 小程序全局配置
├── app.wxss                  # 小程序全局样式
├── project.config.json       # 项目配置文件
├── sitemap.json              # 站点地图配置
├── .eslintrc.js              # ESLint 配置
├── pages/                    # 页面目录
│   └── index/                # 首页
│       ├── index.js          # 页面逻辑
│       ├── index.json        # 页面配置
│       ├── index.wxml        # 页面结构
│       └── index.wxss        # 页面样式
├── components/               # 组件目录
│   └── navigation-bar/       # 自定义导航栏组件
│       ├── navigation-bar.js
│       ├── navigation-bar.json
│       ├── navigation-bar.wxml
│       └── navigation-bar.wxss
└── scripts/                  # 脚本工具
    └── logger/               # 日志模块
        ├── index.js
        └── package.json
```

## 当前状态

- 项目已完成基础目录结构搭建
- 包含一个默认首页 `pages/index/index`
- 包含一个自定义导航栏组件 `components/navigation-bar`
- 包含一个日志工具模块 `scripts/logger`
- 尚未开始业务功能开发

## 开发规范

1. 每次修改后需进行基本的语法错误检查
2. 协同开发，遵循团队约定的代码规范
3. 严格按照后端 SDK 文档进行接口调用
4. 后端 SDK 与文档不符时，以前端业务逻辑和文档为准，不强行适配后端问题

## 里程碑

| 里程碑 | 状态 |
|--------|------|
| 项目初始化 | 进行中 |
| 需求分析 | 未开始 |
| UI/UX 设计 | 未开始 |
| 核心功能开发 | 未开始 |
| 接口联调 | 未开始 |
| 测试与优化 | 未开始 |
| 上线发布 | 未开始 |
