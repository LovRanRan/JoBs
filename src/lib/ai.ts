// Anthropic Claude API 封装(用 fetch,不引 SDK)。
// 若未配置 ANTHROPIC_API_KEY,调用方应回退到确定性方案。

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export function aiEnabled() {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function callClaude(prompt: string, maxTokens = 1024): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Claude API ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.content ?? []).map((c: any) => c.text ?? "").join("").trim();
}

export interface TailorInput {
  jobTitle: string;
  company: string;
  jd: string;
  skills: string[];
  masterResume: string;
}

export interface TailorResult {
  tailored: string;
  source: "claude" | "fallback";
}

export async function tailorResume(input: TailorInput): Promise<TailorResult> {
  const { jobTitle, company, jd, skills, masterResume } = input;

  if (!aiEnabled()) {
    return { tailored: fallbackTailor(input), source: "fallback" };
  }

  const prompt = `You are an expert technical resume writer optimizing a resume for a specific job, while staying truthful.

TARGET ROLE: ${jobTitle} at ${company}

JOB DESCRIPTION:
${jd.slice(0, 4000)}

CANDIDATE SKILLS: ${skills.join(", ")}

CANDIDATE'S CURRENT RESUME (master):
${masterResume.slice(0, 4000)}

Rewrite the most relevant 3-5 resume bullet points so they:
- Lead with impact and quantified results
- Surface the keywords and technologies this JD emphasizes (only ones the candidate plausibly has)
- Pass ATS keyword screening
- Stay truthful — do not invent employers or fabricate metrics that contradict the resume

Return ONLY the rewritten bullet points, one per line, starting with "• ". No preamble.`;

  try {
    const tailored = await callClaude(prompt, 1024);
    return { tailored: tailored || fallbackTailor(input), source: "claude" };
  } catch {
    return { tailored: fallbackTailor(input), source: "fallback" };
  }
}

function fallbackTailor(input: TailorInput): string {
  const top = (input.skills.length ? input.skills : ["TypeScript", "React"]).slice(0, 3);
  return [
    `• Designed and shipped a full-stack platform with ${top.join(", ")}, improving API latency ~40% — aligned with ${input.company}'s focus.`,
    `• Built and maintained production services used across the team, emphasizing ${top[0]} and system design.`,
    `• Collaborated cross-functionally to deliver ${input.jobTitle.toLowerCase()} scope on schedule.`,
  ].join("\n");
}
