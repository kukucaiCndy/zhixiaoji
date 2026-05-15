import { success, fail, delay, paginate, randomId } from './base'

// ==================== Types ====================

export interface ICategory {
  id: number
  name: string
  icon: string
  description: string
  sortOrder: number
  chapterCount: number
  status: string
}

export interface IChapter {
  id: number
  categoryId: number
  categoryName: string
  name: string
  sortOrder: number
  difficulty: string
  sectionCount: number
  status: string
}

export interface ISection {
  id: number
  chapterId: number
  chapterName: string
  title: string
  sortOrder: number
  content: string
  coverImage: string
  summary: string
  status: string
  createdAt: string
  updatedAt: string
}

// ==================== Section Content Templates ====================

function makeRichContent(title: string, topic: string): string {
  return `## ${title}

### 1. 概述

${topic}是计算机科学领域中的重要组成部分。理解其核心概念有助于建立扎实的知识基础，为后续深入学习做好准备。

### 2. 核心概念

> **关键定义**：${topic}的核心在于通过系统化的方法来理解和解决问题，这需要对基本原理有清晰的认识。

在日常开发和学习中，掌握${topic}的相关知识可以显著提升工作效率和代码质量。以下是几个重要的方面：

- **基础理论**：理解底层原理是灵活运用的前提
- **实践应用**：将理论知识转化为实际技能
- **持续学习**：技术领域不断发展，保持学习习惯很重要

### 3. 深入理解

\`\`\`
理论 → 实践 → 反思 → 优化 → 掌握
\`\`\`

学习${topic}的最佳方式是理论与实践相结合。建议：

1. 先理解基本概念和术语
2. 通过小项目或练习巩固所学
3. 阅读官方文档和优秀源码
4. 与同行交流和讨论
5. 定期复习和总结

### 4. 常见误区

- **误区一**：认为学会了语法就等于掌握了${topic}
  - 实际上，理解设计思想和最佳实践更为重要
- **误区二**：只关注最新技术而忽略基础
  - 扎实的基础是学习新技术的基石
- **误区三**：遇到问题就直接搜索答案
  - 先独立思考有助于加深理解

### 5. 实践建议

在实际应用中，建议遵循以下原则：

- **循序渐进**：从简单到复杂，逐步深入
- **动手实践**：每个概念都通过代码验证
- **记录笔记**：整理学习心得和问题解决方案
- **定期复盘**：回顾已学内容，查漏补缺

### 6. 总结

| 维度 | 要点 |
|------|------|
| 核心价值 | 建立系统化的知识体系 |
| 学习路径 | 理论 → 实践 → 项目 → 深入 |
| 关键能力 | 分析问题、设计方案、优化性能 |
| 发展方向 | 持续深耕、拓展视野 |

> 学习是一个持续的过程，保持好奇心和耐心，日积月累方能见效。`
}

function makeRichContentDetailed(title: string, body: string): string {
  return body
}

function makeSummary(title: string, topic: string): string {
  return `本节介绍了${topic}的核心概念与基础知识，涵盖基本定义、核心原理以及实际应用场景，帮助学习者建立系统化的知识框架。`
}

// ==================== Computer History - Detailed Content ====================

const computerHistoryContent = `## 第一节：计算机发展史

### 1. 早期计算机的诞生

1946年，世界上第一台通用电子计算机**ENIAC**在美国宾夕法尼亚大学诞生。这台庞然大物占地170平方米，重达30吨，使用了18000个电子管，每秒可进行5000次加法运算。

> ENIAC的诞生标志着人类进入了电子计算时代，为后续计算机的发展奠定了坚实基础。

在ENIAC之前，计算工具经历了漫长的发展历程：

- **算盘**（公元前2700年）：最早的辅助计算工具
- **帕斯卡加法器**（1642年）：第一台机械式计算器
- **差分机**（1822年）：巴贝奇设计的可编程机械计算机
- **图灵机**（1936年）：图灵提出的通用计算理论模型

### 2. 晶体管时代（1950s-1960s）

1947年，贝尔实验室的肖克利、巴丁和布拉顿发明了**晶体管**，开启了计算机的小型化时代。

主要特征：
- 用晶体管替代电子管，体积大幅缩小
- 功耗降低，可靠性显著提升
- 出现了FORTRAN、COBOL等高级编程语言
- 计算机开始进入商业领域

### 3. 集成电路时代（1960s-1970s）

1958年，德州仪器的杰克·基尔比发明了**集成电路（IC）**，将多个晶体管集成在单一硅片上。

\`\`\`
电子管 → 晶体管 → 集成电路 → 大规模集成电路 → 超大规模集成电路
\`\`\`

这一时期的标志性事件：
1. 1964年：IBM发布System/360大型机系列
2. 1965年：摩尔定律提出——集成电路上可容纳的晶体管数目约每两年翻一番
3. 1969年：ARPANET诞生，互联网的前身
4. 1971年：Intel推出第一款微处理器4004

### 4. 个人计算机时代（1970s-1990s）

1977年，**Apple II**的推出标志着个人计算机时代的到来。随后IBM PC的出现更是将计算机推向千家万户。

| 年份 | 事件 | 影响 |
|------|------|------|
| 1975 | Altair 8800发布 | 第一款个人计算机套件 |
| 1977 | Apple II发布 | 首款成功的量产个人电脑 |
| 1981 | IBM PC发布 | 确立PC行业标准 |
| 1984 | Macintosh发布 | 图形用户界面的普及 |
| 1985 | Windows 1.0发布 | 微软进入操作系统市场 |
| 1991 | Linux诞生 | 开源操作系统的里程碑 |

### 5. 互联网与移动时代（1990s-至今）

进入21世纪，计算机技术进入了全新的发展阶段：

- **云计算**：Amazon AWS（2006年）开启了云服务时代
- **智能手机**：iPhone（2007年）重新定义了移动计算
- **人工智能**：深度学习技术的突破推动AI广泛应用
- **物联网**：万物互联，计算无处不在

### 6. 未来展望

当前计算机科学的前沿方向包括：

- **量子计算**：利用量子力学原理进行计算
- **神经形态计算**：模拟人脑结构的新型计算架构
- **边缘计算**：将计算能力推向网络边缘
- **生物计算**：利用DNA等生物分子进行信息处理

### 7. 思考与练习

1. 摩尔定律在当今是否仍然适用？为什么？
2. 从计算机发展历程看，推动技术进步的核心动力是什么？
3. 设想一下50年后的计算机可能是什么形态？

> **本节小结**：从ENIAC到智能手机，计算机的发展历程是人类智慧的璀璨结晶。理解这段历史，有助于我们更好地把握技术发展的脉络和趋势。`

const computerHardwareContent = `## 第二节：计算机硬件组成

### 1. 冯·诺依曼体系结构

现代计算机普遍采用**冯·诺依曼体系结构**，其核心理念是将程序指令和数据存储在同一存储器中。

五大核心部件：
- **运算器**：执行算术和逻辑运算
- **控制器**：指挥各部件协调工作
- **存储器**：存放程序和数据
- **输入设备**：向计算机输入信息
- **输出设备**：向用户展示计算结果

### 2. 中央处理器（CPU）

CPU是计算机的"大脑"，负责执行指令和处理数据。

\`\`\`
取指令 → 译码 → 执行 → 访存 → 写回
\`\`\`

**关键性能指标**：
- **主频**：时钟频率，单位GHz，反映运算速度
- **核心数**：物理核心数量，决定并行处理能力
- **缓存**：L1/L2/L3三级缓存，加速数据访问
- **制程工艺**：纳米级，影响功耗和性能

### 3. 存储体系

计算机采用**层次化存储结构**，在速度和容量之间取得平衡：

| 层级 | 类型 | 容量 | 速度 |
|------|------|------|------|
| L1缓存 | SRAM | 几十KB | 最快 |
| L2缓存 | SRAM | 几百KB | 很快 |
| L3缓存 | SRAM | 几MB | 较快 |
| 内存 | DRAM | 几GB~几十GB | 一般 |
| 硬盘 | SSD/HDD | 几百GB~几TB | 较慢 |

### 4. 输入输出设备

- **输入设备**：键盘、鼠标、触摸屏、摄像头、麦克风、扫描仪
- **输出设备**：显示器、打印机、音箱、投影仪

### 5. 主板与总线

主板是连接各硬件的"骨架"，通过总线系统实现数据交换：

- **数据总线**：传输数据
- **地址总线**：指定数据来源或去向
- **控制总线**：传输控制信号

### 6. 思考与练习

1. 解释为什么计算机需要多级缓存？
2. SSD相比传统HDD有哪些优势？
3. 画出一个简单的计算机硬件架构图。

> **本节小结**：理解计算机硬件组成是深入学习计算机科学的基础。掌握各部件的功能与协作关系，有助于编写更高效的代码。`

const computerSoftwareContent = `## 第三节：计算机软件系统

### 1. 软件的分类

计算机软件可分为两大类：

- **系统软件**：管理计算机硬件资源，提供基础服务（操作系统、编译器、驱动程序等）
- **应用软件**：面向用户需求，解决具体问题（办公软件、浏览器、游戏等）

### 2. 操作系统

操作系统是最核心的系统软件，是用户与硬件之间的桥梁。

**核心功能**：
- **进程管理**：调度CPU资源，管理程序运行
- **内存管理**：分配和回收内存空间
- **文件管理**：组织和管理磁盘上的数据
- **设备管理**：协调各种输入输出设备
- **用户接口**：提供命令行或图形界面

### 3. 编程语言与编译器

\`\`\`
源代码 → 编译器/解释器 → 机器码 → CPU执行
\`\`\`

主流编程语言分类：
- **编译型**：C、C++、Go、Rust
- **解释型**：Python、JavaScript、Ruby
- **混合型**：Java（编译为字节码）、C#（编译为IL）

### 4. 应用软件生态

现代应用软件覆盖了人类活动的方方面面：

- **生产力工具**：Office套件、Notion、Figma
- **开发工具**：VS Code、Git、Docker
- **通信软件**：微信、Slack、Zoom
- **娱乐软件**：游戏、视频播放器、音乐软件

### 5. 软件架构演进

| 时代 | 架构 | 特点 |
|------|------|------|
| 单机时代 | 单体架构 | 所有功能在一个程序中 |
| 互联网时代 | C/S、B/S架构 | 客户端与服务器分离 |
| 云计算时代 | 微服务架构 | 服务拆分，独立部署 |
| AI时代 | 智能架构 | 融入AI能力的软件系统 |

### 6. 思考与练习

1. 操作系统为什么需要进程调度？
2. 编译型语言和解释型语言各有什么优缺点？
3. 微服务架构相比单体架构有哪些优势与挑战？

> **本节小结**：软件是计算机系统的灵魂，从操作系统到应用软件，每一层都在为上一层的使用者提供便捷的服务。理解软件体系结构是成为优秀开发者的重要一步。`

// ==================== Data - Categories ====================

const categories: ICategory[] = [
  {
    id: 1,
    name: '计算机基础知识',
    icon: '💻',
    description: '涵盖计算机科学的基础概念、硬件组成、操作系统、网络通信等核心知识领域',
    sortOrder: 1,
    chapterCount: 10,
    status: '已上架'
  },
  {
    id: 2,
    name: '计算机编程语言',
    icon: '🔧',
    description: '深入讲解主流编程语言的语法特性、编程范式以及最佳实践',
    sortOrder: 2,
    chapterCount: 8,
    status: '已上架'
  },
  {
    id: 3,
    name: '编程入门',
    icon: '🚀',
    description: '为零基础学习者设计的编程入门指南，循序渐进掌握编程核心思想',
    sortOrder: 3,
    chapterCount: 6,
    status: '已上架'
  },
  {
    id: 4,
    name: 'Web开发基础',
    icon: '🌐',
    description: '系统学习Web前端开发的三大基石：HTML、CSS和JavaScript',
    sortOrder: 4,
    chapterCount: 5,
    status: '已上架'
  },
  {
    id: 5,
    name: '算法与数据结构',
    icon: '📊',
    description: '掌握经典算法与数据结构，提升编程思维和问题解决能力',
    sortOrder: 5,
    chapterCount: 4,
    status: '已上架'
  }
]

// ==================== Data - Chapters ====================

const chapters: IChapter[] = [
  // -------- Category 1: 计算机基础知识 (10 chapters) --------
  { id: 1, categoryId: 1, categoryName: '计算机基础知识', name: '第1章：计算机概述', sortOrder: 1, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 2, categoryId: 1, categoryName: '计算机基础知识', name: '第2章：操作系统基础', sortOrder: 2, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 3, categoryId: 1, categoryName: '计算机基础知识', name: '第3章：计算机网络基础', sortOrder: 3, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 4, categoryId: 1, categoryName: '计算机基础知识', name: '第4章：数据库基础', sortOrder: 4, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 5, categoryId: 1, categoryName: '计算机基础知识', name: '第5章：计算机安全', sortOrder: 5, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 6, categoryId: 1, categoryName: '计算机基础知识', name: '第6章：计算机体系结构', sortOrder: 6, difficulty: '进阶', sectionCount: 3, status: '已上架' },
  { id: 7, categoryId: 1, categoryName: '计算机基础知识', name: '第7章：编译原理入门', sortOrder: 7, difficulty: '进阶', sectionCount: 3, status: '已上架' },
  { id: 8, categoryId: 1, categoryName: '计算机基础知识', name: '第8章：软件工程概论', sortOrder: 8, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 9, categoryId: 1, categoryName: '计算机基础知识', name: '第9章：人工智能基础', sortOrder: 9, difficulty: '进阶', sectionCount: 3, status: '已上架' },
  { id: 10, categoryId: 1, categoryName: '计算机基础知识', name: '第10章：计算机发展前沿', sortOrder: 10, difficulty: '进阶', sectionCount: 3, status: '草稿' },

  // -------- Category 2: 计算机编程语言 (8 chapters) --------
  { id: 11, categoryId: 2, categoryName: '计算机编程语言', name: '第1章：Python入门', sortOrder: 1, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 12, categoryId: 2, categoryName: '计算机编程语言', name: '第2章：Python进阶', sortOrder: 2, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 13, categoryId: 2, categoryName: '计算机编程语言', name: '第3章：JavaScript核心', sortOrder: 3, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 14, categoryId: 2, categoryName: '计算机编程语言', name: '第4章：TypeScript精讲', sortOrder: 4, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 15, categoryId: 2, categoryName: '计算机编程语言', name: '第5章：Java基础', sortOrder: 5, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 16, categoryId: 2, categoryName: '计算机编程语言', name: '第6章：C/C++入门', sortOrder: 6, difficulty: '进阶', sectionCount: 3, status: '已上架' },
  { id: 17, categoryId: 2, categoryName: '计算机编程语言', name: '第7章：Go语言基础', sortOrder: 7, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 18, categoryId: 2, categoryName: '计算机编程语言', name: '第8章：Rust入门', sortOrder: 8, difficulty: '进阶', sectionCount: 3, status: '草稿' },

  // -------- Category 3: 编程入门 (6 chapters) --------
  { id: 19, categoryId: 3, categoryName: '编程入门', name: '第1章：什么是编程', sortOrder: 1, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 20, categoryId: 3, categoryName: '编程入门', name: '第2章：变量与数据类型', sortOrder: 2, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 21, categoryId: 3, categoryName: '编程入门', name: '第3章：控制流程', sortOrder: 3, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 22, categoryId: 3, categoryName: '编程入门', name: '第4章：函数与模块', sortOrder: 4, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 23, categoryId: 3, categoryName: '编程入门', name: '第5章：面向对象编程', sortOrder: 5, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 24, categoryId: 3, categoryName: '编程入门', name: '第6章：项目实战入门', sortOrder: 6, difficulty: '基础', sectionCount: 3, status: '草稿' },

  // -------- Category 4: Web开发基础 (5 chapters) --------
  { id: 25, categoryId: 4, categoryName: 'Web开发基础', name: '第1章：HTML基础', sortOrder: 1, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 26, categoryId: 4, categoryName: 'Web开发基础', name: '第2章：CSS样式', sortOrder: 2, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 27, categoryId: 4, categoryName: 'Web开发基础', name: '第3章：JavaScript交互', sortOrder: 3, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 28, categoryId: 4, categoryName: 'Web开发基础', name: '第4章：响应式设计', sortOrder: 4, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 29, categoryId: 4, categoryName: 'Web开发基础', name: '第5章：前端工具链', sortOrder: 5, difficulty: '进阶', sectionCount: 3, status: '已上架' },

  // -------- Category 5: 算法与数据结构 (4 chapters) --------
  { id: 30, categoryId: 5, categoryName: '算法与数据结构', name: '第1章：算法基础', sortOrder: 1, difficulty: '入门', sectionCount: 3, status: '已上架' },
  { id: 31, categoryId: 5, categoryName: '算法与数据结构', name: '第2章：基本数据结构', sortOrder: 2, difficulty: '基础', sectionCount: 3, status: '已上架' },
  { id: 32, categoryId: 5, categoryName: '算法与数据结构', name: '第3章：排序与搜索', sortOrder: 3, difficulty: '进阶', sectionCount: 3, status: '已上架' },
  { id: 33, categoryId: 5, categoryName: '算法与数据结构', name: '第4章：算法设计思想', sortOrder: 4, difficulty: '进阶', sectionCount: 3, status: '已上架' }
]

// ==================== Data - Sections ====================

const sections: ISection[] = [
  // ===== Category 1, Chapter 1: 计算机概述 (3 sections with full content) =====
  {
    id: 1,
    chapterId: 1,
    chapterName: '第1章：计算机概述',
    title: '第一节：计算机发展史',
    sortOrder: 1,
    content: computerHistoryContent,
    coverImage: '',
    summary: '从ENIAC到智能手机，全面回顾计算机的发展历程，了解推动技术进步的关键人物和里程碑事件。',
    status: '已上架',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-05-10T14:30:00.000Z'
  },
  {
    id: 2,
    chapterId: 1,
    chapterName: '第1章：计算机概述',
    title: '第二节：计算机硬件组成',
    sortOrder: 2,
    content: computerHardwareContent,
    coverImage: '',
    summary: '深入解析冯·诺依曼体系结构，了解CPU、内存、硬盘等核心硬件的工作原理与协作机制。',
    status: '已上架',
    createdAt: '2026-04-02T08:00:00.000Z',
    updatedAt: '2026-05-10T14:30:00.000Z'
  },
  {
    id: 3,
    chapterId: 1,
    chapterName: '第1章：计算机概述',
    title: '第三节：计算机软件系统',
    sortOrder: 3,
    content: computerSoftwareContent,
    coverImage: '',
    summary: '了解操作系统、编程语言、应用软件的层次结构，建立完整的软件系统认知框架。',
    status: '已上架',
    createdAt: '2026-04-03T08:00:00.000Z',
    updatedAt: '2026-05-10T14:30:00.000Z'
  }
]

// ==================== Helper: generate remaining sections ====================

function generateSections(): void {
  // Category 1, Chapter 2-10 (27 sections)
  const cat1Topics: [string, string[]][] = [
    ['第2章：操作系统基础', ['进程与线程管理', '内存管理机制', '文件系统']],
    ['第3章：计算机网络基础', ['OSI七层模型', 'TCP/IP协议栈', 'HTTP与HTTPS']],
    ['第4章：数据库基础', ['关系型数据库', 'SQL语言入门', '数据库设计范式']],
    ['第5章：计算机安全', ['常见安全威胁', '加密技术基础', '网络安全防护']],
    ['第6章：计算机体系结构', ['指令集架构', '流水线与并行', '缓存一致性']],
    ['第7章：编译原理入门', ['词法分析与语法分析', '中间代码生成', '代码优化基础']],
    ['第8章：软件工程概论', ['软件生命周期', '敏捷开发方法', '版本控制与协作']],
    ['第9章：人工智能基础', ['机器学习概述', '神经网络入门', 'AI伦理与未来']],
    ['第10章：计算机发展前沿', ['量子计算简介', '边缘计算与IoT', '脑机接口技术']]
  ]

  let nextId = sections.length + 1
  for (const [chapterName, topics] of cat1Topics) {
    const ch = chapters.find((c) => c.categoryId === 1 && c.name === chapterName)!
    for (let i = 0; i < topics.length; i++) {
      sections.push({
        id: nextId++,
        chapterId: ch.id,
        chapterName: ch.name,
        title: `第${numToCn(i + 1)}节：${topics[i]}`,
        sortOrder: i + 1,
        content: makeRichContent(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        coverImage: '',
        summary: makeSummary(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        status: ch.status,
        createdAt: '2026-04-15T08:00:00.000Z',
        updatedAt: '2026-05-12T10:00:00.000Z'
      })
    }
  }

  // Category 2: 计算机编程语言 (8 chapters, 24 sections)
  const cat2Topics: [string, string[]][] = [
    ['第1章：Python入门', ['Python环境搭建', '基本语法与变量', '常用数据结构']],
    ['第2章：Python进阶', ['函数式编程', '装饰器与生成器', '异常处理与日志']],
    ['第3章：JavaScript核心', ['变量作用域与闭包', '原型链与继承', '异步编程模型']],
    ['第4章：TypeScript精讲', ['类型系统基础', '泛型与高级类型', '装饰器与元数据']],
    ['第5章：Java基础', ['面向对象编程', '集合框架', '异常处理机制']],
    ['第6章：C/C++入门', ['指针与内存管理', '面向对象特性', 'STL标准库']],
    ['第7章：Go语言基础', ['并发编程模型', '接口与类型系统', '标准库概览']],
    ['第8章：Rust入门', ['所有权系统', '生命周期与借用', '错误处理机制']]
  ]

  for (const [chapterName, topics] of cat2Topics) {
    const ch = chapters.find((c) => c.categoryId === 2 && c.name === chapterName)!
    for (let i = 0; i < topics.length; i++) {
      sections.push({
        id: nextId++,
        chapterId: ch.id,
        chapterName: ch.name,
        title: `第${numToCn(i + 1)}节：${topics[i]}`,
        sortOrder: i + 1,
        content: makeRichContent(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        coverImage: '',
        summary: makeSummary(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        status: ch.status,
        createdAt: '2026-04-20T08:00:00.000Z',
        updatedAt: '2026-05-12T10:00:00.000Z'
      })
    }
  }

  // Category 3: 编程入门 (6 chapters, 18 sections)
  const cat3Topics: [string, string[]][] = [
    ['第1章：什么是编程', ['编程的本质', '编程语言分类', '开发环境搭建']],
    ['第2章：变量与数据类型', ['理解变量', '基本数据类型', '类型转换']],
    ['第3章：控制流程', ['条件判断', '循环结构', '流程控制实践']],
    ['第4章：函数与模块', ['函数定义与调用', '参数与返回值', '模块化编程']],
    ['第5章：面向对象编程', ['类与对象', '继承与多态', '封装与抽象']],
    ['第6章：项目实战入门', ['需求分析', '代码实现', '测试与调试']]
  ]

  for (const [chapterName, topics] of cat3Topics) {
    const ch = chapters.find((c) => c.categoryId === 3 && c.name === chapterName)!
    for (let i = 0; i < topics.length; i++) {
      sections.push({
        id: nextId++,
        chapterId: ch.id,
        chapterName: ch.name,
        title: `第${numToCn(i + 1)}节：${topics[i]}`,
        sortOrder: i + 1,
        content: makeRichContent(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        coverImage: '',
        summary: makeSummary(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        status: ch.status,
        createdAt: '2026-04-25T08:00:00.000Z',
        updatedAt: '2026-05-12T10:00:00.000Z'
      })
    }
  }

  // Category 4: Web开发基础 (5 chapters, 15 sections)
  const cat4Topics: [string, string[]][] = [
    ['第1章：HTML基础', ['HTML文档结构', '常用标签详解', '表单与验证']],
    ['第2章：CSS样式', ['选择器与优先级', '盒模型与布局', '动画与过渡']],
    ['第3章：JavaScript交互', ['DOM操作', '事件处理', 'AJAX与Fetch']],
    ['第4章：响应式设计', ['媒体查询', 'Flexbox布局', 'Grid布局']],
    ['第5章：前端工具链', ['包管理器', '构建工具', '代码质量工具']]
  ]

  for (const [chapterName, topics] of cat4Topics) {
    const ch = chapters.find((c) => c.categoryId === 4 && c.name === chapterName)!
    for (let i = 0; i < topics.length; i++) {
      sections.push({
        id: nextId++,
        chapterId: ch.id,
        chapterName: ch.name,
        title: `第${numToCn(i + 1)}节：${topics[i]}`,
        sortOrder: i + 1,
        content: makeRichContent(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        coverImage: '',
        summary: makeSummary(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        status: ch.status,
        createdAt: '2026-05-01T08:00:00.000Z',
        updatedAt: '2026-05-12T10:00:00.000Z'
      })
    }
  }

  // Category 5: 算法与数据结构 (4 chapters, 12 sections)
  const cat5Topics: [string, string[]][] = [
    ['第1章：算法基础', ['时间复杂度分析', '空间复杂度分析', '递归思想']],
    ['第2章：基本数据结构', ['数组与链表', '栈与队列', '哈希表']],
    ['第3章：排序与搜索', ['冒泡排序与选择排序', '快速排序与归并排序', '二分查找']],
    ['第4章：算法设计思想', ['贪心算法', '动态规划入门', '回溯算法']]
  ]

  for (const [chapterName, topics] of cat5Topics) {
    const ch = chapters.find((c) => c.categoryId === 5 && c.name === chapterName)!
    for (let i = 0; i < topics.length; i++) {
      sections.push({
        id: nextId++,
        chapterId: ch.id,
        chapterName: ch.name,
        title: `第${numToCn(i + 1)}节：${topics[i]}`,
        sortOrder: i + 1,
        content: makeRichContent(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        coverImage: '',
        summary: makeSummary(`第${numToCn(i + 1)}节：${topics[i]}`, topics[i]),
        status: ch.status,
        createdAt: '2026-05-05T08:00:00.000Z',
        updatedAt: '2026-05-12T10:00:00.000Z'
      })
    }
  }
}

function numToCn(n: number): string {
  const map: Record<number, string> = {
    1: '一', 2: '二', 3: '三', 4: '四', 5: '五',
    6: '六', 7: '七', 8: '八', 9: '九', 10: '十'
  }
  return map[n] || String(n)
}

// Initialize all sections
generateSections()

// ==================== Mock Functions ====================

export const knowledgeMock = {
  // ---------- Category CRUD ----------

  async getCategories() {
    await delay(300)
    return success([...categories])
  },

  async createCategory(data: { name: string; icon: string; description: string; sortOrder: number; status: string }) {
    await delay(400)
    const cat: ICategory = {
      id: randomId(),
      name: data.name,
      icon: data.icon || '📁',
      description: data.description || '',
      sortOrder: data.sortOrder || categories.length + 1,
      chapterCount: 0,
      status: data.status || '草稿'
    }
    categories.push(cat)
    return success(cat)
  },

  async updateCategory(id: number, data: Partial<ICategory>) {
    await delay(400)
    const cat = categories.find((c) => c.id === id)
    if (!cat) return fail('大类不存在')
    Object.assign(cat, data)
    return success(cat)
  },

  async deleteCategory(id: number) {
    await delay(400)
    const idx = categories.findIndex((c) => c.id === id)
    if (idx === -1) return fail('大类不存在')
    categories.splice(idx, 1)
    return success(null, '删除成功')
  },

  // ---------- Chapter CRUD ----------

  async getChapters(categoryId?: number) {
    await delay(300)
    const list = categoryId
      ? chapters.filter((ch) => ch.categoryId === categoryId)
      : [...chapters]
    return success(list)
  },

  async createChapter(data: {
    categoryId: number
    categoryName: string
    name: string
    sortOrder: number
    difficulty: string
    status: string
  }) {
    await delay(400)
    const ch: IChapter = {
      id: randomId(),
      categoryId: data.categoryId,
      categoryName: data.categoryName || '',
      name: data.name,
      sortOrder: data.sortOrder || 1,
      difficulty: data.difficulty || '入门',
      sectionCount: 0,
      status: data.status || '草稿'
    }
    chapters.push(ch)
    // Update category chapter count
    const cat = categories.find((c) => c.id === ch.categoryId)
    if (cat) cat.chapterCount++
    return success(ch)
  },

  async updateChapter(id: number, data: Partial<IChapter>) {
    await delay(400)
    const ch = chapters.find((c) => c.id === id)
    if (!ch) return fail('章节不存在')
    Object.assign(ch, data)
    return success(ch)
  },

  async deleteChapter(id: number) {
    await delay(400)
    const idx = chapters.findIndex((c) => c.id === id)
    if (idx === -1) return fail('章节不存在')
    const ch = chapters[idx]
    chapters.splice(idx, 1)
    // Update category chapter count
    const cat = categories.find((c) => c.id === ch.categoryId)
    if (cat) cat.chapterCount--
    return success(null, '删除成功')
  },

  // ---------- Section CRUD ----------

  async getSections(chapterId?: number) {
    await delay(300)
    const list = chapterId
      ? sections.filter((s) => s.chapterId === chapterId)
      : [...sections]
    return success(list)
  },

  async getSection(id: number) {
    await delay(300)
    const section = sections.find((s) => s.id === id)
    if (!section) return fail('小节不存在')
    return success({ ...section })
  },

  async createSection(data: {
    chapterId: number
    chapterName: string
    title: string
    sortOrder: number
    content: string
    coverImage?: string
    summary?: string
    status: string
  }) {
    await delay(400)
    const now = new Date().toISOString()
    const sec: ISection = {
      id: randomId(),
      chapterId: data.chapterId,
      chapterName: data.chapterName || '',
      title: data.title,
      sortOrder: data.sortOrder || 1,
      content: data.content || '',
      coverImage: data.coverImage || '',
      summary: data.summary || '',
      status: data.status || '草稿',
      createdAt: now,
      updatedAt: now
    }
    sections.push(sec)
    // Update chapter section count
    const ch = chapters.find((c) => c.id === sec.chapterId)
    if (ch) ch.sectionCount++
    return success(sec)
  },

  async updateSection(id: number, data: Partial<ISection>) {
    await delay(400)
    const idx = sections.findIndex((s) => s.id === id)
    if (idx === -1) return fail('小节不存在')
    sections[idx] = { ...sections[idx], ...data, updatedAt: new Date().toISOString() }
    return success(sections[idx])
  },

  async deleteSection(id: number) {
    await delay(400)
    const idx = sections.findIndex((s) => s.id === id)
    if (idx === -1) return fail('小节不存在')
    const sec = sections[idx]
    sections.splice(idx, 1)
    // Update chapter section count
    const ch = chapters.find((c) => c.id === sec.chapterId)
    if (ch) ch.sectionCount--
    return success(null, '删除成功')
  },

  // ---------- AI Content Generation ----------

  async generateCategoryContent(categoryName: string) {
    // Simulate multi-stage LLM generation with delays
    await delay(800)
    // Phase 1: generate category
    const catId = randomId()
    const category: ICategory = {
      id: catId,
      name: categoryName,
      icon: '🤖',
      description: `这是AI自动生成的「${categoryName}」知识大类，涵盖相关核心知识点`,
      sortOrder: categories.length + 1,
      chapterCount: 3,
      status: '草稿'
    }

    await delay(600)
    // Phase 2: generate chapters
    const generatedChapters: IChapter[] = [
      {
        id: randomId(),
        categoryId: catId,
        categoryName: categoryName,
        name: `第1章：${categoryName}概述`,
        sortOrder: 1,
        difficulty: '入门',
        sectionCount: 3,
        status: '草稿'
      },
      {
        id: randomId(),
        categoryId: catId,
        categoryName: categoryName,
        name: `第2章：${categoryName}核心概念`,
        sortOrder: 2,
        difficulty: '基础',
        sectionCount: 3,
        status: '草稿'
      },
      {
        id: randomId(),
        categoryId: catId,
        categoryName: categoryName,
        name: `第3章：${categoryName}实践应用`,
        sortOrder: 3,
        difficulty: '进阶',
        sectionCount: 3,
        status: '草稿'
      }
    ]

    await delay(600)
    // Phase 3: generate sections
    const generatedSections: ISection[] = []
    const now = new Date().toISOString()
    let secId = randomId()

    const sectionTemplates = [
      ['基本概念与定义', '发展历程与背景', '应用场景概览'],
      ['核心技术原理', '关键方法与技巧', '常见误区与注意事项'],
      ['实战案例分析', '进阶应用探索', '总结与展望']
    ]

    for (let ci = 0; ci < generatedChapters.length; ci++) {
      const ch = generatedChapters[ci]
      for (let si = 0; si < sectionTemplates[ci].length; si++) {
        const topic = sectionTemplates[ci][si]
        const title = `第${numToCn(si + 1)}节：${topic}`
        generatedSections.push({
          id: secId++,
          chapterId: ch.id,
          chapterName: ch.name,
          title,
          sortOrder: si + 1,
          content: makeRichContent(title, `${categoryName} - ${topic}`),
          coverImage: '',
          summary: `本节围绕「${categoryName}」中的「${topic}」展开讲解，帮助学习者深入理解和掌握相关内容。`,
          status: '草稿',
          createdAt: now,
          updatedAt: now
        })
      }
    }

    await delay(400)

    return success({
      category,
      chapters: generatedChapters,
      sections: generatedSections
    })
  }
}

// ==================== Named Exports ====================

export { categories, chapters, sections }
