// 简单可解释的匹配度算法:用户技能 vs 岗位标签的覆盖率。
// Phase 3 会用 Claude API 做更细的语义匹配,这里先用确定性规则,便于排序与展示。

export interface MatchResult {
  score: number;     // 0-100
  matched: string[]; // 命中的岗位要求
  gaps: string[];    // 用户缺失的岗位要求
}

const norm = (s: string) => s.toLowerCase().trim();

export function computeMatch(userSkills: string[], jobTags: string[]): MatchResult {
  const skills = new Set(userSkills.map(norm));
  const matched: string[] = [];
  const gaps: string[] = [];

  for (const tag of jobTags) {
    if (skills.has(norm(tag))) matched.push(tag);
    else gaps.push(tag);
  }

  const base = jobTags.length ? matched.length / jobTags.length : 0;
  // 命中越多分越高,留一点底分避免 0 分太刺眼
  const score = Math.round(40 + base * 60);

  return { score: Math.min(score, 100), matched, gaps };
}
