# 遗留任务 / Backlog

记录尚未完成、需要后续处理的功能与改进。

## 1. 中文版本展示不完整

**问题**：切换到中文（中文按钮）后，页面并非全中文 —— 部分内容仍是英文。

**原因**：
- UI 标签（导航、按钮等）已在 `lib/i18n.ts` 做了中英文，但**内容数据本身是单语的**。
  数据库 `config`（about / tagline / title）、`honors`、`projects`、`cv_sections`
  里存的都是英文，切换语言不会替换这些正文。

**方向**：
- 方案 A：为内容也存中英两份（数据库加 `_cn` 字段或单独的 `config_cn` 等），
  前端按当前语言取对应字段。改动较大，需同时改 `/admin` 录入界面。
- 方案 B（轻量）：先把 about / tagline / 主要 section 的中文版补进数据库，
  前端按语言切换正文。
- 旧 homepage（`/root/program/homepage/data/profile.ts`）里已有现成的**中文文案**
  （`profileCn`：about、news、education 等），可直接复用作为中文内容来源。

## 2. Ask AI 助手增强

### 2.1 换更聪明的模型
- 目前用 DeepSeek `deepseek-chat`（便宜但能力一般）。
- 升级为更强的模型（如 `deepseek-reasoner`，或换 Anthropic Claude / OpenAI GPT 系列）。
- 模型在 `/admin` 或数据库 `config.ai_model` / `config.ai_provider` 可改；
  provider 路由逻辑见 `lib/ai/index.ts`。

### 2.2 背景植入更充分
- 当前系统提示词只注入了部分公开内容 + `ai_private_notes`。
- 应把更完整的背景喂给 AI：CV 全文、各项目细节、研究经历、课程成绩、
  论文/手稿等，让回答更具体、更少泛泛而谈。
- 相关代码：`lib/ai/prompts.ts`（构造 system prompt）、
  `app/api/chat/route.ts`（组装上下文）。
- 可考虑：上传 CV PDF 后做文本提取并纳入上下文，或维护一份更详尽的
  "AI 知识库" 文本。

### 2.3 新增「模拟面试」功能（AI 扮演本人）
- 让 AI **扮演常远航本人**，以第一人称接受面试官提问，用于面试练习。
- 与现有"访客问 AI 了解我"的模式不同：这里 AI = 我，用户 = 面试官。
- 设计要点：
  - 一个独立入口/模式切换（如聊天窗内的「模拟面试」标签）。
  - 不同的 system prompt：以第一人称、基于完整背景作答，语气自然、
    会"想一下再答"，遇到不会的题目给出合理的真实回应而非编造。
  - 可选：面试官角色设定（quant / PhD / ML 工程）、追问、给反馈。
