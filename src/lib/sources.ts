// 要抓取的公司"board token"列表(美国科技公司)。
// 这些 token 即各 ATS 公开职位页 URL 里的公司标识,可自由增删。
// 注意:token 可能随公司迁移 ATS 而失效,抓取器会跳过失败的 source。

export const SOURCES: { greenhouse: string[]; lever: string[]; ashby: string[] } = {
  // https://boards.greenhouse.io/{token}
  greenhouse: ["stripe", "databricks", "airbnb", "robinhood", "coinbase", "gitlab", "figma"],
  // https://jobs.lever.co/{company}
  lever: ["netflix", "plaid", "ramp", "brex"],
  // https://jobs.ashbyhq.com/{name}
  ashby: ["Linear", "Vercel", "Notion", "Ramp", "Replit"],
};

// 每个公司最多抓取多少条,避免单次写入过大
export const PER_COMPANY_LIMIT = 25;

export const pretty = (token: string) =>
  token.charAt(0).toUpperCase() + token.slice(1);
