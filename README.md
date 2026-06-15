# JoBs — 全链路求职平台

一个面向**美国技术岗**的端到端求职作战系统:每天抓岗位 → 按 Profile 个性化匹配 → 按 JD 自动改简历 → 一键投递助手 → 投递追踪 → 数据统计。

> 当前为 **Phase 1 高保真原型**:完整多页前端 + mock 数据,用于确认体验。后端 / 抓取 / AI 在 Phase 2-3 接入。进度见 [`progress.md`](./progress.md)。

## 技术栈

- Next.js 14 (App Router, TypeScript) + TailwindCSS
- 后端(规划):Next.js API Routes + Postgres
- AI(规划):Anthropic Claude API
- 数据源(规划):Greenhouse / Lever / Ashby 公开 ATS 接口
- 部署(规划):Vercel + 托管 Postgres

## 本地运行

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

## 页面

| 路由 | 模块 |
|------|------|
| `/` | Dashboard — 漏斗 / 看板概览 / 推荐 |
| `/jobs` | 个性化岗位流(匹配度排序、筛选) |
| `/jobs/[id]` | 岗位详情 + 匹配分析 + **按 JD 改简历** + 一键投递助手 |
| `/applications` | 投递追踪看板(Kanban) |
| `/resumes` | 简历中心(Master + 定制版本) |
| `/profile` | 用户画像(驱动推荐) |
| `/login` | 登录 |
