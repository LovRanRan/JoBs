export type AppStage =
  | "new"        // 新岗位(抓取到,待处理)
  | "to_apply"   // 待投
  | "applied"    // 已投
  | "oa"         // 笔试 / OA
  | "interview"  // 面试中
  | "offer"      // Offer
  | "closed";    // 关闭(拒/撤)

export const STAGES: { key: AppStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "to_apply", label: "To Apply" },
  { key: "applied", label: "Applied" },
  { key: "oa", label: "OA / Test" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "closed", label: "Closed" },
];

export type JobSource = "greenhouse" | "lever" | "ashby" | "manual";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary?: string;
  source: JobSource;
  postedAt: string;        // ISO date
  isNew?: boolean;         // 今日新增
  tags: string[];          // 技术栈关键词
  jdSummary: string;
  matchScore: number;      // 0-100
  matched: string[];       // 命中的技能
  gaps: string[];          // 缺口技能
  url: string;
}

export interface Application {
  id: string;
  jobId: string;
  stage: AppStage;
  appliedAt?: string;
  contact?: string;
  nextStep?: string;
  resumeVersion?: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  base: boolean;
  tailoredFor?: string;    // company / role
  updatedAt: string;
  keywords: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  title: string;
  yearsExp: number;
  location: string;
  targetRoles: string[];
  targetLocations: string[];
  minSalary: number;
  workAuth: string;
  skills: string[];
}
