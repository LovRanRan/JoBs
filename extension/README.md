# JoBs Auto-Apply — 浏览器插件

在**你自己的浏览器、你自己的会话**里,把 JoBs 里"待投"的岗位自动填好,可选自动提交。Greenhouse / Lever / Ashby。

这是合规形态:提交动作发生在你本地,不是云端代管账号。

## 安装(开发者模式)

1. 打开 Chrome → `chrome://extensions`
2. 右上角打开 **开发者模式 (Developer mode)**
3. 点 **加载已解压的扩展程序 (Load unpacked)** → 选择本 `extension/` 文件夹
4. 点插件图标打开弹窗

## 连接 JoBs

1. 在 JoBs 网站 → **Auto-Apply** 页:开启自动投递、设置每日上限/平台、**生成一个 Token**(复制)
2. 在插件弹窗里填:
   - **JoBs 网址**:本地是 `http://localhost:3000`,线上填你的 Vercel 地址
   - **Token**:粘贴刚生成的 `jobs_...`
3. 点 **保存 & 测试连接** → 显示"已连接 ✓"和队列数量即成功

## 使用

- 先在 JoBs 的 **Jobs** 页把想投的岗位「加入看板(待投)」——这就是插件的队列
- 在 JoBs **Auto-Apply** 页建议先开 **Dry-run**(只填不交)
- 插件弹窗点 **▶ 开始自动投递**
- 插件会逐个打开申请页、自动填字段、按你的设置 dry-run 或提交,并把结果回写到 JoBs 的"投了哪些"

## 重要限制(请知悉)

- **简历文件无法自动上传**:浏览器安全机制禁止脚本设置 `<input type=file>`。遇到需要上传简历的表单,插件会把其余字段填好并停下,提示你**手动上传 + 提交**。文本字段(姓名/邮箱/电话/地点等)全部自动。
- **不同公司的申请表结构不同**,autofill 用的是平台通用选择器 + 关键字回退,个别页面可能填不全 —— 这属正常,手动补即可。
- **LinkedIn 不在支持范围**(封号重灾区,刻意不做)。
- **风险**:用你自己的账号/会话。低频(每日上限)+ 间隔 + 标准 ATS 可把风险压到很低,但不为零。建议从 Dry-run 起步。

## 结构

```
extension/
  manifest.json        MV3 配置
  src/
    api.js             与 JoBs 后端通信(Bearer token)
    background.js      编排:拉队列→开页填表→回写,受上限/间隔约束
    content.js         注入申请页的 autofill 适配器(GH/Lever/Ashby + 通用回退)
    popup.html/js      配置 token、测试连接、启动
```
