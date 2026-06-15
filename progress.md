# JoBs — 全链路求职平台 · 进度追踪

> 一个多用户的求职作战系统:每天抓岗位 → 按 Profile 个性化推荐 → 按 JD 改简历 → 一键投递助手 → 追踪 → 统计。
> 方向:技术/研发岗。形态:可部署的多页网站。

最后更新:2026-06-14(已含自动投递架构决策)

**仓库**:https://github.com/LovRanRan/JoBs (public) · 主分支 `main`
**Git 工作流**:每完成一个 commit 自动 push 到 GitHub。

---

## 1. 项目目标

帮用户跑完整条求职链路。核心主线:
**抓岗位 → 匹配推荐 → 改简历 → 投递 → 追踪 → 统计**

每个用户有独立 Profile 和简历,系统据此个性化找工作、按每个职位的 JD 定制简历。

## 2. 关键决策记录

- **抓岗位走合规渠道**:优先 ATS 公开职位 API(Greenhouse / Lever / Ashby —— 技术岗超多)、RSS、邮件订阅、手动粘贴 JD 解析。不爬有反爬机制的平台。
- **多用户**:带注册/登录的 SaaS,人人可用,数据隔离。
- **AI 能力**:简历解析、匹配度分析、JD 改简历、求职信生成,统一走 AI 服务层(Claude API)。
- **自动投递(已升级决策)**:用户明确要"每天自动帮我投十几二十个,然后等邮件"。最终方案 = **云端网站(大脑/仪表盘)+ 本地浏览器插件(动手执行)**。详见 §2.5。

## 2.5 自动投递架构决策(重要)

**需求**:注册即用的多用户产品;每天自动投递 10–20 个;用户只看"投了哪些"、等面试邮件。

**核心约束**:部署在云端的网站后端**碰不到用户本地的浏览器会话**。能"操作页面"的代理能力只存在于客户端(插件 / 桌面)。因此"提交申请"这一步必须在用户自己的客户端执行。

**最终架构**:
- **JoBs 网站(云端,带 auth)= 大脑**:注册登录、抓岗位、个性化推荐、改简历、配置自动投递(开关 / 每日上限 / 平台白名单 / dry-run)、展示"已投了哪些 + 结果"。
- **浏览器插件(每个用户装一次)= 手**:用同一 JoBs 账号登录 → 拉取该用户"待投队列 + 对应定制简历" → 在用户**自己的浏览器/会话**里 autofill + 提交 → 回写结果到网站。
- 这就是 Simplify / JobCopilot 类产品的标准形态。

**为什么不做纯云端代投**:服务器无头浏览器替所有用户投 = 同一数据中心 IP 大规模自动化,秒被检测/封 IP,且平台自身承担大规模自动化的协议/法律风险。"动手"必须留在用户客户端。

**封号风险评估(低频 + 标准 ATS)**:
- Greenhouse / Lever / Ashby 申请页**通常无需登录账号**,只是公开表单提交 → **没有账号可封**,最坏是单次提交失败,重填即可。这是主战场,最安全。
- **LinkedIn**:自动化是封号重灾区 → 插件默认**跳过,留手动**。
- **Indeed**:中等风险,默认不自动。
- 风险来自"数量 + 速度"(非人类行为),不来自"用了自动化"本身。20 个/天 + 随机间隔 + 白天投 ≈ 真人,风控基本不触发。
- 保险措施:**dry-run**(头几天只填不交、截图确认)+ **每日上限** + **随机间隔** + **平台白名单**。
- 残余风险不为零,用户知情。

## 3. 技术选型(已定稿 ✅)

- 前端:Next.js 14 (App Router, React, TypeScript) + TailwindCSS,多页
- 后端:Next.js API Routes
- 数据库:Postgres(Phase 2 接入,原型阶段用 mock 数据)
- 定时任务:每日抓取 job(cron / Vercel Cron)
- AI:**Anthropic Claude API**(简历解析 / JD 改简历 / 匹配度 / 求职信)
- 部署:Vercel(前端+API) + 托管 Postgres(如 Neon/Supabase)
- **目标市场:美国技术岗**
- **岗位数据源**:ATS 公开职位接口 —— Greenhouse(`boards-api.greenhouse.io`)、Lever(`api.lever.co/v0/postings`)、Ashby。这些是公开 JSON 接口,合规、无需爬虫,美国科技公司覆盖广。

## 4. 模块清单

| # | 模块 | 说明 | 状态 |
|---|------|------|------|
| 0 | 用户系统 | 注册/登录、Profile、数据隔离 | ✅ 完成 |
| 1 | 简历中心 | 多版本简历、版本管理(上传解析、导出 PDF 待做) | 🟡 部分 |
| 2 | 岗位抓取 | 每日定时拉新岗位(ATS API)+ 手动同步 + 去重 | ✅ 完成 |
| 3 | 匹配引擎 | Profile vs JD 算匹配度、缺口分析、个性化排序推荐 | ✅ 完成 |
| 4 | JD 改简历 | Claude 对比 JD 重写简历、补关键词过 ATS | ✅ 完成 |
| 5 | 投递助手 | 生成定制简历、加入看板、跳转申请页(目前仍需手动提交) | 🟡 部分 |
| 6 | 投递追踪看板 | Kanban:新岗位→待投→已投→笔试→面试→Offer→关闭 | ✅ 完成 |
| 7 | 跟进提醒 | 投递无回音催办、面试后感谢、offer 答复期限 | ⬜ 未开始 |
| 8 | 数据统计看板 | 漏斗转化率、每日新增、趋势 | ✅ 完成(基础) |
| 9 | Offer 对比 | 多 offer 按薪资/成长/地点打分对比 | ⬜ 未开始 |
| 10 | **自动投递(网站侧 + 插件)** | 配置页 + 待投队列 API + 浏览器插件 autofill/提交/回写 | ⬜ 未开始(Phase 4 重点) |
| 11 | 简历 PDF 解析 | 上传 PDF/Word → 结构化画像 | ⬜ 未开始 |

> 状态:✅ 完成 · 🟡 部分完成 · ⬜ 未开始

## 5. 分阶段计划

### Phase 0 — 构思 & 规划 ✅(进行中)
- [x] 全链路板块构思
- [x] 确认形态(可部署多页)、方向(技术研发)、核心板块
- [x] 写 progress.md
- [ ] 初始化 git repo
- [ ] 最终确认技术选型

### Phase 1 — 高保真交互原型 ✅(完成)
纯前端 + 假数据,跑通完整界面和流程,先确认体验:
- [x] 登录 / 注册页
- [x] Profile 页
- [x] 简历中心(列表 + 版本)
- [x] 个性化岗位流(推荐 + 匹配度 + 筛选/排序)
- [x] JD 改简历对比页(岗位详情内)
- [x] 一键投递助手(岗位详情内)
- [x] 追踪看板(Kanban,可移动卡片)
- [x] 统计看板(Dashboard 漏斗)
- [x] `npx next build` 验证通过(9 路由全编译)

### Phase 2 — 后端 & 数据 ✅(完成)
- [x] 数据库 schema 设计(Prisma:User/Profile/Job/Application/Resume)
- [x] DB 客户端单例 + seed 脚本(含 demo 用户)
- [x] 用户认证(bcrypt + jose JWT cookie,register/login/logout/me,middleware 保护)
- [x] CRUD API:jobs(列表含个性化匹配 + 手动加)、applications(看板 + 移动阶段)、resumes、profile
- [x] 匹配工具 `lib/match.ts`(Profile × JD)
- [x] `.env.example`,登录/注册页接通 API
- [x] `prisma validate` + `next build` 通过

**Phase 2b ✅(完成)**:前端全部切到真实数据。
- [x] `requireUser` session 助手
- [x] Dashboard / Profile / Resumes 改服务端组件直读 Prisma
- [x] Jobs / 岗位详情 / 看板 改 fetch `/api/*`
- [x] 看板移动 → PATCH 持久化;岗位详情「加入看板」→ POST
- [x] `next build` 通过(页面随数据动态渲染)
- 注:`src/lib/mock.ts` 已成废弃文件(页面不再引用),可在本地删除。

### Phase 3 — 抓取 & AI ✅(完成)
- [x] ATS 抓取器(Greenhouse/Lever/Ashby 公开接口,容错归一化)— `lib/ats.ts`
- [x] JD 关键词提取 + HTML 清洗 + 摘要 — `lib/extract.ts`(已单测:Go 不误命中 Google)
- [x] 抓取源配置 `lib/sources.ts`(美国科技公司,可增删)
- [x] 每日 cron `/api/cron/scrape`(CRON_SECRET 校验)+ `vercel.json`
- [x] 手动「立即同步」`/api/jobs/sync` + Jobs 页按钮
- [x] Claude API 封装 `lib/ai.ts` + `/api/ai/tailor`,岗位详情页接真实 AI(无 key 回退模板)
- [x] `next build` 通过(14 个 API 路由)
- [ ] 简历解析引擎(上传 PDF→结构化)— 留待后续

**说明**:`lib/sources.ts` 里的公司 token 是示例,部分可能已迁移 ATS;抓取器会跳过失败源。生产前按需调整公司清单。

### Phase 4 — 自动投递(网站侧 + 浏览器插件)+ 部署 & 打磨

**4A · 网站侧(云端)✅(完成)**
- [x] 数据库新增模型:`AutoApplyConfig`、`ApplicationLog`、`ApiToken`(+ User 关系)
- [x] 插件鉴权:`ApiToken`(存 sha256 hash,原文仅创建时返回一次)+ `lib/auth.ts` 的 `getUserIdFromBearer`/`generateApiToken`
- [x] 插件 API:`GET /api/extension/queue`(待投队列+资料,Bearer)、`POST /api/extension/report`(回写结果,提交成功→看板 applied)
- [x] 配置 API:`GET/PUT /api/autoapply/config`、`GET /api/autoapply/logs`、token 管理 `/api/tokens` `+/[id]`
- [x] 配置页 `/settings/auto-apply`:开关、dry-run、**每日上限手动(留空=不限)**、间隔、平台白名单(LinkedIn 灰显跳过)、生成/撤销 Token、"投了哪些"历史
- [x] 侧边导航加 Auto-Apply 入口
- [x] `prisma validate` + `next build` 通过
- 注:middleware 的 matcher 本就排除 `/api`,插件接口走 Bearer 不受 cookie 重定向影响,无需改动。

**4B · 浏览器插件(Chrome MV3)✅(完成)**
- [x] 插件骨架:`extension/`(manifest v3 + popup + background module + content script + api 模块)
- [x] 用 JoBs Token 登录,拉 `/api/extension/queue`,popup 测试连接
- [x] autofill 适配器:Greenhouse / Lever / Ashby + 通用回退(姓名/邮箱/电话/地点等);React-friendly 赋值
- [x] dry-run(只填不交、高亮)→ 真提交(找提交按钮点击),受每日上限 + 随机间隔约束
- [x] 提交后回写 `/api/extension/report`(成功→看板 applied)
- [x] LinkedIn 不支持(刻意跳过)
- ⚠️ **已知限制**:浏览器禁止脚本设置文件输入 → **简历无法自动上传**,需上传简历的表单会停在"填好"状态提示手动。已在 extension/README 写明。

**4C · 部署 & 增强**
- [ ] 部署到 Vercel + 托管 Postgres(Neon),配 Cron
- [ ] 跟进提醒(模块 7)、Offer 对比(模块 9)、简历 PDF 解析(模块 11)
- [ ] UI 集中打磨(登录/注册页脱离主布局、整体视觉)

## 5.5 需要修改 / 新增的部分(进入 Phase 4 前的清单)

**数据库(prisma/schema.prisma)**
- 新增 `AutoApplyConfig`(userId 唯一、enabled、dailyLimit、platforms[]、dryRun、minIntervalSec)
- 新增 `ApplicationLog`(userId、jobId、platform、status、message、screenshotUrl、createdAt)
- 新增 `ApiToken`(userId、token、label、createdAt、lastUsedAt)给插件鉴权用
- 可能给 `Application` 加 `autoApplied: Boolean`、`appliedVia: String`

**现有代码需调整**
- `middleware.ts`:放行 `/api/extension/*`(走 Token 鉴权,不走 cookie 重定向)
- `lib/auth.ts`:加 Token 校验函数(`getUserIdFromToken`)
- 投递助手 UI(岗位详情页):措辞从"打开投递页"升级为与自动投递联动(队列/状态)
- `Resume.content` 要真正存简历正文(供插件上传 + AI 改写),目前多为空

**新增代码**
- `src/app/api/extension/queue/route.ts`、`report/route.ts`
- `src/app/api/autoapply/config/route.ts`
- `src/app/settings/auto-apply/page.tsx`
- 独立子目录 `extension/`(Chrome MV3 插件源码,与 Next 应用同仓库)

**风控保险(务必内置)**
- dry-run 默认开;**每日上限由用户手动设置(默认不限,UI 提示低频更安全)**;随机间隔;平台白名单默认仅 GH/Lever/Ashby;LinkedIn 跳过

## 6. 当前状态

📍 **Phase 4A + 4B 完成**:自动投递全链路打通——网站侧(配置/队列/Token/历史)+ Chrome 插件(`extension/`,autofill + dry-run/提交 + 回写)。
已知限制:简历文件无法脚本自动上传(浏览器安全),需手动传。
下一步候选:**4C 部署上线(Vercel + Neon)**,或提醒/Offer 对比/简历解析,或 UI 集中打磨。
注意:schema 改过,本地跑网站前需 `npm run db:push`。

## 7. 待办 / 待确认

已确认:Next.js + Postgres + Claude API + 美国岗位 + 多用户 + 自动投递走"网站+插件"。

进入 Phase 4 已确认:
- [x] 先做 4A 网站侧(数据模型 + 插件 API + 配置页)
- [x] dry-run 默认开
- [x] **每日上限不设默认值,由用户在配置页手动设置**(可留空=不限;UI 提示低频更安全)
- [ ] 插件先支持哪几家 ATS 的 autofill(默认 Greenhouse/Lever/Ashby)

## 8. 进度日志 (Logs)

> 规则:每完成一步就在最上方追加一条,格式 `YYYY-MM-DD | 阶段 | 做了什么`。

- 2026-06-14 | Phase 4B | Chrome MV3 插件完成:extension/(manifest+api+background+content+popup),Token 连接、拉队列、GH/Lever/Ashby autofill + 通用回退、dry-run/提交、回写 report;已知限制:简历需手动上传。push
- 2026-06-14 | Phase 4A | 自动投递网站侧完成:新增 AutoApplyConfig/ApplicationLog/ApiToken 模型 + Bearer token 鉴权 + /api/extension/{queue,report} + /api/autoapply/{config,logs} + /api/tokens + 配置页 /settings/auto-apply + 导航,`next build` 通过,push
- 2026-06-14 | Phase 4 规划 | 敲定自动投递架构(网站大脑 + 本地浏览器插件,低频/标准ATS/dry-run/白名单);progress 写入 §2.5 决策、§5.5 改动清单、Phase 4 计划、模块表更新
- 2026-06-14 | Phase 3 | 接 Claude API:`lib/ai.ts` + `/api/ai/tailor`,岗位详情页真·按 JD 改简历(无 key 回退模板),`next build` 通过,push
- 2026-06-14 | Phase 3 | ATS 抓取:`lib/ats.ts`(GH/Lever/Ashby 归一化)+ `lib/extract.ts`(关键词/清洗,已单测)+ cron `/api/cron/scrape` + 手动 `/api/jobs/sync` + Jobs 页同步按钮 + vercel.json
- 2026-06-14 | Phase 2b | 前端全部切真实 API/DB:Dashboard/Profile/Resumes 服务端直读 Prisma,Jobs/详情/看板 fetch API,看板移动 PATCH 持久化、详情加入看板 POST,`next build` 通过,push
- 2026-06-14 | Phase 2 | 完成后端:Prisma schema(5 模型)+ seed + 认证(JWT cookie/middleware)+ 11 个 API 路由 + 匹配工具 + 注册/登录接 API,`next build` 通过,push
- 2026-06-14 | Phase 1 | 完成高保真原型:7 页(Dashboard/Jobs/岗位详情含JD改简历/看板/简历/Profile/登录)+ mock 数据,`next build` 通过,push
- 2026-06-14 | Phase 1 | 搭好 Next.js 14 + TS + Tailwind 骨架(配置/布局/侧边导航/类型/mock 数据)
- 2026-06-14 | Phase 1 | 技术决策定稿:Next.js + Postgres + Claude API + 美国岗位 + ATS(Greenhouse/Lever/Ashby)数据源
- 2026-06-14 | Phase 0 | 建 GitHub public 仓库 LovRanRan/JoBs,推送代码,默认分支设为 main,确立"每 commit 自动 push"工作流
- 2026-06-14 | Phase 0 | 在 progress.md 增加「进度日志」板块,确立每步记录规则
- 2026-06-14 | Phase 0 | 初始化 git repo + .gitignore,首次提交 (8ce3a9c)
- 2026-06-14 | Phase 0 | 编写 progress.md(目标/决策/技术选型/模块清单/分阶段计划)
- 2026-06-14 | Phase 0 | 完成全链路构思,确认形态(可部署多页)、方向(技术研发)、核心板块(抓岗位/匹配/改简历/投递助手/追踪/统计)、多用户 + AI 能力
