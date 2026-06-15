# 部署到 Vercel + Neon(约 10 分钟)

JoBs = Next.js 全栈应用 + Postgres。推荐 **Vercel(应用)+ Neon(免费 Postgres)**。
部署时 Vercel 会自动建表(见 `vercel.json` 的 buildCommand),你不用手动跑数据库迁移。

## 1. 建一个 Postgres(Neon,免费)

1. 打开 https://neon.tech → 用 GitHub 登录 → New Project
2. 项目建好后,在 **Connection string** 处复制连接串(选 **Pooled connection**,形如):
   ```
   postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   先存着,下一步要用。

## 2. 在 Vercel 导入仓库

1. 打开 https://vercel.com → 用 GitHub 登录
2. **Add New… → Project** → 选 `LovRanRan/JoBs` → Import
3. 先别急着 Deploy,展开 **Environment Variables**,加这几个:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | 第 1 步的 Neon 连接串 |
   | `AUTH_SECRET` | 一串随机长字符串(终端 `openssl rand -base64 32` 生成,或随便敲长一点) |
   | `CRON_SECRET` | 另一串随机字符串 |
   | `ANTHROPIC_API_KEY` | 你的 Claude API key(没有可暂时不填,改简历会回退模板) |

4. 点 **Deploy**。首次构建时会自动在 Neon 里建好所有表。

## 3. 用起来

1. 部署完成,打开 Vercel 给的网址(`https://jobs-xxx.vercel.app`)
2. 点注册,创建账号
3. 进 **Jobs** 页点「↻ 立即同步岗位」→ 抓取真实岗位
4. 把想投的「加入看板」→ 在 **Auto-Apply** 页配置 + 生成插件 Token → 用浏览器插件自动投

## 4. 每日自动抓取

`vercel.json` 已配好 Cron(每天 UTC 13:00 调 `/api/cron/scrape`)。Vercel 会自动带上 `CRON_SECRET` 调用,无需额外设置。
> 注意:Vercel 免费版 Cron 有频率限制(每天一次足够);Cron 功能需项目在支持的计划内。

## 常见问题

- **构建报数据库连接错误**:检查 `DATABASE_URL` 是否填的是 Neon 的 **pooled** 串、带 `?sslmode=require`。
- **登录后页面报错**:确认 `AUTH_SECRET` 已设置。
- **改简历没用上 AI**:`ANTHROPIC_API_KEY` 未配置时会回退到模板,属正常。
