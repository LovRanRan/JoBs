# JoBs — 全链路求职平台

一个面向**美国技术岗**的端到端求职作战系统:每天抓岗位 → 按 Profile 个性化匹配 → 按 JD 自动改简历 → 一键投递助手 → 投递追踪 → 数据统计。

> 当前已完成 **Phase 3**:全栈打通 —— 真实 Postgres、用户认证、ATS 每日抓取(Greenhouse/Lever/Ashby)、Claude API 按 JD 改简历。进度见 [`progress.md`](./progress.md)。

## 技术栈

- Next.js 14 (App Router, TypeScript) + TailwindCSS
- 后端(规划):Next.js API Routes + Postgres
- AI(规划):Anthropic Claude API
- 数据源(规划):Greenhouse / Lever / Ashby 公开 ATS 接口
- 部署(规划):Vercel + 托管 Postgres

## 本地运行

```bash
npm install

# 1) 配置环境变量
cp .env.example .env        # 填入 DATABASE_URL(Postgres)和 AUTH_SECRET
#    生成密钥:openssl rand -base64 32

# 2) 建表 + 灌入示例数据
npm run db:push
npm run db:seed             # 创建 demo 用户

# 3) 启动
npm run dev                 # http://localhost:3000
```

**Demo 账号**:`13812764054zhc@gmail.com` / `password123`

没有 Postgres?最快的方式是用 [Neon](https://neon.tech) 免费实例,把连接串填进 `DATABASE_URL`。

## 页面

| 路由 | 模块 |
|------|------|
| `/` | Dashboard — 漏斗 / 看板概览 / 推荐 |
| `/jobs` | 个性化岗位流(匹配度排序、筛选) |
| `/jobs/[id]` | 岗位详情 + 匹配分析 + **按 JD 改简历** + 一键投递助手 |
| `/applications` | 投递追踪看板(Kanban) |
| `/resumes` | 简历中心(Master + 定制版本) |
| `/profile` | 用户画像(驱动推荐) |
| `/login` `/register` | 登录 / 注册 |

## 抓取与 AI

- **岗位抓取**:`src/lib/ats.ts` 从 Greenhouse / Lever / Ashby 公开接口拉取并归一化;公司清单在 `src/lib/sources.ts`(可增删)。
- **每日自动**:`/api/cron/scrape`(Vercel Cron 每天调用,见 `vercel.json`,用 `CRON_SECRET` 校验)。
- **手动同步**:Jobs 页「↻ 立即同步岗位」→ `/api/jobs/sync`。
- **按 JD 改简历**:`/api/ai/tailor` 调 Claude(`ANTHROPIC_API_KEY`);未配置 key 时回退模板。
