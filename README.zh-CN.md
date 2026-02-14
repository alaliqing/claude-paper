<div align="center">

# Claude Paper

**将研究论文转化为综合学习环境**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-purple)](https://code.claude.com)

一个强大的 **Claude Code 插件**，通过智能材料生成、代码演示和交互式网页查看器自动化研究论文学习。

</div>

---

## 功能特性

- **自动 PDF 解析** - 提取标题、作者、摘要和完整内容
- **智能内容截断** - 智能处理大型论文（50k 字符限制）
- **代码仓库检测** - 自动发现 GitHub、arXiv、CodeOcean 链接
- **自适应学习材料** - 根据论文复杂性生成 README、摘要、洞察力、问答
- **代码演示** - 清晰实现，带 Jupyter 笔记本和原始代码集成
- **交互式网页查看器** - Nuxt.js 界面，支持数学公式渲染（KaTeX）
- **智能评估** - 难度级别和论文类型检测，实现自适应内容生成

---

## 快速开始

### 安装

从 Claude Code 市场安装：

```bash
# 添加市场
/plugin marketplace add qinjing/claude-paper

# 安装插件
/plugin install claude-paper

# 重启 Claude Code 使插件生效
```

**就这样！** 插件将自动：
- 安装所有依赖项（用于 PDF 处理的 pdf-parse）
- 在 `~/claude-papers/` 创建论文目录
- 初始化搜索索引
- 安装网页查看器依赖项

### 系统要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 随 Node.js 一起安装
- **Claude Code**: 支持插件的最新版本
- **poppler-utils**: 用于 PDF 图像提取（通过系统包管理器安装）
  - **macOS**: `brew install poppler`
  - **Ubuntu/Debian**: `sudo apt-get install poppler-utils`
  - **Arch Linux**: `sudo pacman -S poppler`

---

## 使用方法

### 学习研究论文

直接与 Claude Code 对话来学习论文：

```
帮我学习 ~/Downloads/attention-is-all-you-need.pdf 这篇论文
```

Claude 将自动触发学习工作流程并：
1. 解析 PDF 并提取元数据
2. 分析论文复杂性和类型
3. 生成自适应学习材料
4. 创建代码演示（如适用）
5. 提取并包含原始代码（如有）
6. 提取关键图表和图像
7. 更新全局搜索索引
8. 自动启动网页查看器

### 启动网页查看器

```bash
/claude-paper:webui
```

在 **http://localhost:5815** 打开交互式网页界面，您可以：
- 浏览所有已学习的论文
- 查看生成的材料和数学公式
- 访问代码演示和笔记本
- 搜索论文库

---

## 论文存储结构

论文按 `~/claude-papers/papers/{paper-slug}/` 组织：

```
~/claude-papers/
├── papers/
│   └── {paper-slug}/
│       ├── paper.pdf                     # 原始 PDF 文件
│       ├── meta.json                     # 论文元数据（标题、作者等）
│       ├── README.md                     # 快速导航和概览
│       ├── summary.md                    # 详细摘要
│       ├── insights.md                   # 核心洞察力（最重要！）
│       ├── method.md                     # 方法论（如复杂）
│       ├── mental-model.md              # 论文分类（如需要）
│       ├── reflection.md                # 未来方向（如需要）
│       ├── qa.md                         # 学习问题
│       ├── images/                       # 提取的图表和表格
│       │   ├── fig1.png
│       │   └── fig2.png
│       └── code/                         # 代码演示
│           ├── code-demo.py              # 清晰的参考实现
│           ├── code-demo.ipynb           # 交互式 Jupyter 笔记本
│           └── original-code/            # 原始论文代码（如有）
│               ├── README.md
│               └── [仓库文件]
│
└── index.json                           # 全局搜索索引
```

---

## 架构

### 插件结构

```
claude-paper/
├── .claude-plugin/
│   └── marketplace.json              # 市场目录条目
├── plugin/
│   ├── .claude-plugin/
│   │   └── plugin.json              # 插件清单
│   ├── skills/
│   │   └── study/
│   │       ├── SKILL.md             # 学习工作流程定义
│   │       └── scripts/
│   │           ├── parse-pdf.js    # PDF 解析工具
│   │           └── extract-images.py  # 图像提取
│   ├── commands/
│   │   └── webui.md                # /webui 命令
│   ├── hooks/
│   │   ├── hooks.json              # 会话生命周期钩子
│   │   └── check-install.sh        # 安装验证
│   ├── src/
│   │   └── web/                    # Nuxt.js 网页查看器
│   │       ├── components/         # Vue 组件
│   │       ├── composables/        # Vue 组合式函数
│   │       ├── server/             # API 端点
│   │       └── package.json
│   └── package.json
└── README.md
```

### 核心组件

1. **学习技能** - 编排论文处理的主要工作流程代理
2. **PDF 解析器** - 使用 pdf-parse 提取文本、元数据和代码链接
3. **图像提取器** - PDF 图表提取的 Python 脚本
4. **网页查看器** - 带 Nitro API 服务器的 Nuxt.js 应用
5. **钩子系统** - 自动依赖安装和设置

---

## 开发

### 运行测试

```bash
# 测试 PDF 解析
node plugin/skills/study/scripts/parse-pdf.js /path/to/paper.pdf

# 测试网页查看器
cd plugin/src/web
npm run dev

# 测试完整工作流程
cd /path/to/claude-paper
claude --plugin-dir ./plugin
/claude-paper:study /path/to/paper.pdf
```

### 生产构建

```bash
# 构建网页查看器
cd plugin/src/web
npm run build

# 构建的查看器将在 .output/ 目录中
```

---

## 配置

### 环境变量

无需配置！插件使用合理的默认值：

- **论文目录**: `~/claude-papers/`
- **网页查看器端口**: `5815`
- **内容限制**: `50,000` 字符（带智能截断）

### 高级自定义

您可以通过编辑技能文件来修改行为：
`plugin/skills/study/SKILL.md`

---

## 贡献

欢迎贡献！请：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 进行更改
4. 如适用，添加测试
5. 提交更改 (`git commit -m 'add amazing feature'`)
6. 推送到分支 (`git push origin feature/amazing-feature`)
7. 打开 Pull Request

---

## 许可证

本项目采用 **MIT 许可证** - 详见 [LICENSE](LICENSE) 文件。

---

## 致谢

- 基于 [Claude Code](https://code.claude.com) 构建
- PDF 解析由 [pdf-parse](https://github.com/ffalt/json2csv-converter) 提供支持
- 网页查看器由 [Nuxt.js](https://nuxt.com) 构建
- 数学渲染由 [KaTeX](https://katex.org) 提供支持
