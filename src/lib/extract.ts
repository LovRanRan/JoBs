// 从 JD 文本中提取技术关键词作为标签,并生成简短摘要。
// 关键词表覆盖常见技术栈;命中即作为 tag,供匹配算法使用。

const KEYWORDS = [
  "TypeScript", "JavaScript", "Python", "Go", "Golang", "Rust", "Java", "Kotlin",
  "Ruby", "Ruby on Rails", "PHP", "C++", "C#", "Scala", "Swift", "Elixir",
  "React", "Next.js", "Vue", "Angular", "Svelte", "Node.js", "Express",
  "GraphQL", "REST", "gRPC", "Django", "Flask", "FastAPI", "Spring",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "Kafka", "Elasticsearch",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD",
  "Spark", "Hadoop", "Airflow", "Snowflake", "dbt",
  "TensorFlow", "PyTorch", "Machine Learning", "LLM", "Distributed Systems",
  "System Design", "Microservices", "WebGL", "Performance", "Security",
  "iOS", "Android", "React Native", "Flutter", "UI", "UX", "Tailwind",
];

const norm = (s: string) => s.toLowerCase();

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTags(text: string): string[] {
  const t = norm(text);
  const found = new Set<string>();
  for (const kw of KEYWORDS) {
    // 用词边界避免 "go" 误匹配
    const re = new RegExp(`(?:^|[^a-z0-9+#.])${escapeRe(norm(kw))}(?:$|[^a-z0-9+#])`, "i");
    if (re.test(` ${t} `)) {
      found.add(kw === "Golang" ? "Go" : kw === "Ruby on Rails" ? "Ruby" : kw);
    }
  }
  return Array.from(found).slice(0, 12);
}

export function summarize(text: string, max = 240): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function detectRemote(text: string, location?: string): boolean {
  const hay = norm(`${location ?? ""} ${text}`);
  return /\bremote\b|work from home|distributed team|anywhere/.test(hay);
}
