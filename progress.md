# JoBs — 全链路求职平台 · 进度追踪

> 一个多用户的求职作战系统:每天抓岗位 → 按 Profile 个性化推荐 → 按 JD 改简历 → 一键投递助手 → 追踪 → 统计。
> 方向:技术/研发岗。形态:可部署的多页网站。

最后更新:2026-06-14

**仓库**:https://github.com/LovRanRan/JoBs (public) · 主分支 `main`
**Git 工作流**:每完成一个 commit 自动 push 到 GitHub。

---

## 1. 项目目标

帮用户跑完整条求职链路。核心主线:
**抓岗位 → 匹配推荐 → 改简历 → 投递 → 追踪 → 统计**

每个用户有独立 Profile 和简历,系统据此个性化找工作、按每个职位的 JD 定制简历。

## 2. 关键决策记录

- **自动投递**:不做"全自动偷偷点提交"(违反平台协议 + 封号 + 法律风险)。改为**一键投递助手**:系统匹配岗位、生成定制简历/求职信、填好内容,用户确认后自己点提交。
- **抓岗位走合规渠道**:优先 ATS 公开职位 API(Greenhouse / Lever / Ashby —— 技术岗超多)、RSS、邮件订阅、手动粘贴 JD 解析。不爬有反爬机制的平台。
- **多用户**:需要账号系统 + 数据隔离。
- **AI 能力**:简历解析、匹配度分析、JD 改简历、求职信生成,统一走 AI 服务层(大模型 API)。

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
| 0 | 用户系统 | 注册/登录、Profile、数据隔离 | ⬜ 未开始 |
| 1 | 简历中心 | 多版本简历、上传、解析成结构化画像、导出 | ⬜ |
| 2 | 岗位抓取 | 每日定时拉新岗位(ATS API/订阅)+ 手动粘贴 JD 解析 + 去重 | ⬜ |
| 3 | 匹配引擎 | Profile vs JD 算匹配度、缺口分析、个性化排序推荐 | ⬜ |
| 4 | JD 改简历 | 对比 JD 重写简历、补关键词过 ATS、存岗位专属版本 | ⬜ |
| 5 | 一键投递助手 | 生成定制简历+求职信、填好内容、用户确认提交、回写状态 | ⬜ |
| 6 | 投递追踪看板 | Kanban:新岗位→待投→已投→笔试→面试→Offer→关闭 | ⬜ |
| 7 | 跟进提醒 | 投递无回音催办、面试后感谢、offer 答复期限 | ⬜ |
| 8 | 数据统计看板 | 漏斗转化率、每日新增、趋势、按渠道/公司拆分 | ⬜ |
| 9 | Offer 对比 | 多 offer 按薪资/成长/地点打分对比 | ⬜ |

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

### Phase 4 — 部署 & 打磨
- [ ] 部署上线
- [ ] 提醒、Offer 对比等增强模块

## 6. 当前状态

📍 **Phase 3 完成**:ATS 每日抓取 + 手动同步 + Claude API 改简历全部接通,`next build` 通过,已 push。核心链路(抓取→匹配→改简历→投递→追踪→统计)已端到端打通。下一步:Phase 4(部署上线 + 提醒/Offer 对比 + 简历解析 + UI 集中打磨)。

## 7. 待办 / 待确认

- [ ] 技术选型最终拍板(是否 Next.js + Postgres)
- [ ] Phase 1 原型从哪个模块先做
- [ ] AI 用哪家大模型 API
- [ ] 目标主要投国内还是海外岗位(影响抓取数据源)

## 8. 进度日志 (Logs)

> 规则:每完成一步就在最上方追加一条,格式 `YYYY-MM-DD | 阶段 | 做了什么`。

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
