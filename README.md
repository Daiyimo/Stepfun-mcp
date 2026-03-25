# Stepfun MCP Server

[![npm version](https://img.shields.io/npm/v/stepfun-mcp?style=flat-square)](https://www.npmjs.com/package/stepfun-mcp)
[![npm downloads](https://img.shields.io/npm/dm/stepfun-mcp?style=flat-square)](https://www.npmjs.com/package/stepfun-mcp?activeTab=downloads)
[![Node >=18](https://img.shields.io/node/v/stepfun-mcp?style=flat-square)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Daiyimo/Stepfun-mcp?style=flat-square)](https://github.com/Daiyimo/Stepfun-mcp)

**StepFun 搜索服务的 MCP (Model Context Protocol) 服务器，用于 Claude Code 的 TypeScript/Node.js 实现。**

## ✨ 特性

- 🔍 通过 StepFun API 提供强大的网络搜索功能
- 📦 **npm 全局安装**：`npm install -g stepfun-mcp`
- 🔗 **Claude Code 原生集成**：通过 settings.json 配置
- 🐍 与 Python 版本 **100% 功能兼容**
- ⚡ 基于官方 `@modelcontextprotocol/sdk` 构建
- ✅ 完整的参数验证和错误处理
- 🌐 支持中英文搜索

## 📦 安装

### 方式一：npm 全局安装（推荐）

```bash
npm install -g stepfun-mcp
```

### 方式二：源码安装（开发）

```bash
git clone https://github.com/Daiyimo/Stepfun-mcp.git
cd Stepfun-mcp
npm install
npm run build
npm link
```

## ⚙️ 配置

MCP 服务器支持三种配置方式：

### 方式一：Claude Code Settings.json（推荐）

编辑 `~/.claude/settings.json` 或项目根目录 `.claude/settings.local.json`：

```json
{
  "mcpServers": {
    "StepFun": {
      "command": "stepfun-mcp",
      "env": {
        "STEPFUN_API_KEY": "your_api_key_here",
        "STEPFUN_API_HOST": "https://api.stepfun.com"
      }
    }
  }
}
```

> **💡 提示**：将 `your_api_key_here` 替换为你的真实 StepFun API Key。

### 方式二：环境变量

在终端中设置环境变量：

**Linux/macOS:**
```bash
export STEPFUN_API_KEY="your_api_key"
export STEPFUN_API_HOST="https://api.stepfun.com"
stepfun-mcp
```

**Windows (PowerShell):**
```powershell
$env:STEPFUN_API_KEY="your_api_key"
$env:STEPFUN_API_HOST="https://api.stepfun.com"
stepfun-mcp
```

### 方式三：.env 文件

在项目根目录创建 `.env` 文件：

```env
# StepFun API 配置
STEPFUN_API_KEY=your_api_key_here
STEPFUN_API_HOST=https://api.stepfun.com

# 可选：日志级别（默认：WARNING）
# FASTMCP_LOG_LEVEL=INFO
```

## 🚀 使用方法

配置完成后，重启 Claude Code，即可在对话中使用 `web_search` 工具。

### 工具描述

Claude 会自动使用以下工具描述：

> You MUST use this tool whenever you need to search for real-time or external information on the web.
>
> A web search API based on StepFun search engine.
>
> Args:
> - query (string, required): The search query. Aim for 3-5 keywords for best results.
> - num_results (integer, optional): Number of search results to return. Defaults to 10, max 50.
>
> Returns:
> A JSON object containing the search results:
> {
>     "query": "string",
>     "category": "string",
>     "results": [
>         {
>             "url": "string",
>             "position": "int",
>             "title": "string",
>             "time": "string (ISO date)",
>             "snippet": "string",
>             "content": "string"
>         }
>     ]
> }

### 使用示例

**用户**: "搜索一下张雪峰的最新消息"

**Claude**: 自动调用 `mcp__StepFun__web_search` 工具

**返回结果**:
```json
{
  "query": "张雪峰",
  "category": "news",
  "results": [
    {
      "url": "https://example.com/news",
      "position": 1,
      "title": "张雪峰最新动态",
      "time": "2026-03-24T22:11:00Z",
      "snippet": "简要描述...",
      "content": "完整内容..."
    }
  ]
}
```

## 🔧 开发

### 项目结构

```
stepfun-mcp/
├── src/
│   ├── index.ts          # CLI 入口
│   ├── server.ts         # MCP 服务器
│   ├── client.ts         # StepFun API 客户端
│   ├── tools.ts          # 工具实现
│   ├── types.ts          # 类型定义
│   └── errors.ts         # 异常类
├── dist/                 # 编译输出
├── package.json
├── tsconfig.json
└── README.md
```

### 常用命令

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 启动服务器（生产）
npm start

# 开发模式（使用 tsx）
npm run dev

# 运行测试
node test-search-real.js
```

### 构建说明

项目使用 TypeScript 编写，编译目标为 ES2020：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## 📖 API 文档

### web_search

使用 StepFun 搜索引擎进行网络搜索。

#### 参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `query` | string | ✅ | 搜索查询，建议 3-5 个关键词 |
| `num_results` | number | ❌ | 返回结果数量（1-50，默认 10） |

#### 返回结构

```json
{
  "query": "搜索关键词",
  "category": "分类",
  "results": [
    {
      "url": "https://example.com",
      "position": 1,
      "title": "结果标题",
      "time": "2026-03-26T00:00:00Z",
      "snippet": "摘要内容",
      "content": "完整正文"
    }
  ]
}
```

#### 字段说明

- `query`: 原始搜索词
- `category`: 搜索结果分类（可为空）
- `results`: 结果数组，按相关性排序
  - `url`: 文章来源链接
  - `position`: 排名位置（从 1 开始）
  - `title`: 文章标题
  - `time`: 发布时间（ISO 8601 格式）
  - `snippet`: 摘要/描述
  - `content`: 完整正文内容

## 🆚 与 Python 版本对比

| 特性 | Python 版本 | Node.js 版本（本仓库） |
|------|------------|---------------------|
| **包名** | stepfun-plan-mcp | stepfun-mcp |
| **安装** | `pip install` + `uvx` | `npm install -g` |
| **运行时** | Python 3.10+ + uv | Node.js 18+ |
| **SDK** | `mcp` (FastMCP) | `@modelcontextprotocol/sdk` |
| **HTTP 客户端** | requests | 原生 fetch |
| **配置文件** | .env | .env 或 settings.json |
| **功能** | ✅ 完整 | ✅ 100% 兼容 |

## ❓ 常见问题

### 1. 安装后命令找不到？

确保 npm 全局 bin 目录在 PATH 中：

```bash
# 查看 npm 全局 bin 路径
npm bin -g

# 将该路径添加到系统 PATH
```

### 2. 如何获取 StepFun API Key？

访问 [StepFun 开放平台](https://platform.stepfun.com/) 注册并创建应用。

### 3. 搜索结果为空？

检查：
- API Key 是否正确
- API Host 是否为 `https://api.stepfun.com`
- 网络连接是否正常

### 4. 支持哪些模型？

本 MCP 服务器仅提供搜索工具，不依赖特定 AI 模型。只要 Claude Code 支持 MCP 即可使用。

### 5. 如何调试？

查看日志输出（会输出到 stderr）：

```bash
# 设置日志级别
export FASTMCP_LOG_LEVEL=DEBUG
stepfun-mcp
```

## 🐛 错误处理

| 错误类型 | 说明 | 处理方式 |
|---------|------|----------|
| 缺少 API Key/Host | 服务器启动失败 | 检查环境变量配置 |
| 认证失败 | HTTP 401 | 检查 API Key 是否正确 |
| 网络错误 | 连接失败 | 检查网络和 API Host |
| 参数错误 | 参数验证失败 | 检查 query 和 num_results |
| API 错误 | StepFun 返回错误 | 查看具体错误信息 |

## 📝 更新日志

### v1.0.0 (2026-03-26)

- ✨ 首次发布
- ✅ 实现 web_search 工具
- ✅ 完整的 MCP 协议支持
- ✅ 参数验证和错误处理
- ✅ 中文文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 `git checkout -b feature/AmazingFeature`
3. 提交更改 `git commit -m 'Add some AmazingFeature'`
4. 推送到分支 `git push origin feature/AmazingFeature`
5. 开启 Pull Request

## 📄 License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- **GitHub**: https://github.com/Daiyimo/Stepfun-mcp
- **npm**: https://www.npmjs.com/package/stepfun-mcp
- **StepFun 开放平台**: https://platform.stepfun.com/
- **MCP 文档**: https://modelcontextprotocol.io/
- **Claude Code**: https://claude.ai/code
- **Star History**: [![Star History](https://img.shields.io/github/stars/Daiyimo/Stepfun-mcp?style=flat-square)](https://github.com/Daiyimo/Stepfun-mcp/stargazers)

---

**Made with ❤️ by [Daiyimo](https://github.com/Daiyimo)**
