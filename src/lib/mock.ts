import { Application, Job, ResumeVersion, UserProfile } from "./types";

export const profile: UserProfile = {
  name: "David Zhou",
  email: "13812764054zhc@gmail.com",
  title: "Software Engineer",
  yearsExp: 3,
  location: "Seattle, WA",
  targetRoles: ["Software Engineer", "Full-Stack Engineer", "Backend Engineer"],
  targetLocations: ["Seattle, WA", "San Francisco, CA", "Remote (US)"],
  minSalary: 150000,
  workAuth: "F-1 OPT / needs future sponsorship",
  skills: [
    "TypeScript", "React", "Next.js", "Node.js", "Python",
    "PostgreSQL", "AWS", "Docker", "GraphQL", "System Design",
  ],
};

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Software Engineer, Full Stack",
    company: "Stripe",
    location: "San Francisco, CA",
    remote: true,
    salary: "$180k–$240k + equity",
    source: "greenhouse",
    postedAt: "2026-06-14",
    isNew: true,
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL", "API"],
    jdSummary:
      "Build and scale payment APIs and internal dashboards. Strong TS/React and backend fundamentals required.",
    matchScore: 92,
    matched: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    gaps: ["Ruby"],
    url: "https://boards.greenhouse.io/stripe",
  },
  {
    id: "j2",
    title: "Backend Engineer",
    company: "Notion",
    location: "San Francisco, CA",
    remote: false,
    salary: "$170k–$220k",
    source: "lever",
    postedAt: "2026-06-14",
    isNew: true,
    tags: ["Node.js", "PostgreSQL", "AWS", "System Design"],
    jdSummary:
      "Own backend services for collaborative editing. Distributed systems and Postgres at scale.",
    matchScore: 84,
    matched: ["Node.js", "PostgreSQL", "AWS", "System Design"],
    gaps: ["Rust", "Distributed systems at scale"],
    url: "https://jobs.lever.co/notion",
  },
  {
    id: "j3",
    title: "Frontend Engineer",
    company: "Vercel",
    location: "Remote (US)",
    remote: true,
    salary: "$160k–$210k + equity",
    source: "ashby",
    postedAt: "2026-06-13",
    isNew: false,
    tags: ["React", "Next.js", "TypeScript", "UI"],
    jdSummary:
      "Work on the Next.js dashboard and developer experience. Deep React/Next expertise.",
    matchScore: 95,
    matched: ["React", "Next.js", "TypeScript"],
    gaps: [],
    url: "https://jobs.ashbyhq.com/vercel",
  },
  {
    id: "j4",
    title: "Full Stack Engineer",
    company: "Linear",
    location: "Remote (US)",
    remote: true,
    salary: "$165k–$215k",
    source: "ashby",
    postedAt: "2026-06-12",
    isNew: false,
    tags: ["TypeScript", "React", "GraphQL", "Node.js"],
    jdSummary:
      "Build the Linear app end-to-end. Care about craft, speed, and product quality.",
    matchScore: 88,
    matched: ["TypeScript", "React", "GraphQL", "Node.js"],
    gaps: ["Realtime sync"],
    url: "https://jobs.ashbyhq.com/linear",
  },
  {
    id: "j5",
    title: "Software Engineer, Platform",
    company: "Databricks",
    location: "Seattle, WA",
    remote: false,
    salary: "$175k–$235k + equity",
    source: "greenhouse",
    postedAt: "2026-06-11",
    isNew: false,
    tags: ["Python", "AWS", "Docker", "Distributed Systems"],
    jdSummary:
      "Build data infrastructure used by thousands of customers. Strong Python and cloud.",
    matchScore: 76,
    matched: ["Python", "AWS", "Docker"],
    gaps: ["Scala", "Spark"],
    url: "https://boards.greenhouse.io/databricks",
  },
  {
    id: "j6",
    title: "Senior Frontend Engineer",
    company: "Figma",
    location: "San Francisco, CA",
    remote: true,
    salary: "$190k–$250k + equity",
    source: "greenhouse",
    postedAt: "2026-06-14",
    isNew: true,
    tags: ["React", "TypeScript", "WebGL", "Performance"],
    jdSummary:
      "Push the boundaries of in-browser design tools. Performance-obsessed frontend work.",
    matchScore: 71,
    matched: ["React", "TypeScript"],
    gaps: ["WebGL", "C++", "Senior-level scope"],
    url: "https://boards.greenhouse.io/figma",
  },
];

export const applications: Application[] = [
  { id: "a1", jobId: "j1", stage: "new" },
  { id: "a6", jobId: "j6", stage: "new" },
  { id: "a2", jobId: "j2", stage: "to_apply", resumeVersion: "Notion · Backend" },
  { id: "a3", jobId: "j3", stage: "applied", appliedAt: "2026-06-10", resumeVersion: "Vercel · Frontend", nextStep: "等待回复(已 4 天)" },
  { id: "a4", jobId: "j4", stage: "interview", appliedAt: "2026-06-05", contact: "Sarah (Recruiter)", nextStep: "6/18 技术面" },
  { id: "a5", jobId: "j5", stage: "oa", appliedAt: "2026-06-08", nextStep: "OA 截止 6/16" },
];

export const resumes: ResumeVersion[] = [
  { id: "r0", name: "Master Resume", base: true, updatedAt: "2026-06-01", keywords: ["TypeScript", "React", "Node.js", "Python", "AWS"] },
  { id: "r1", name: "Vercel · Frontend", base: false, tailoredFor: "Vercel — Frontend Engineer", updatedAt: "2026-06-10", keywords: ["Next.js", "React", "TypeScript", "DX"] },
  { id: "r2", name: "Notion · Backend", base: false, tailoredFor: "Notion — Backend Engineer", updatedAt: "2026-06-13", keywords: ["Node.js", "PostgreSQL", "AWS", "System Design"] },
];

// ---- helpers ----
export const jobById = (id: string) => jobs.find((j) => j.id === id);

export const funnel = () => {
  const counts: Record<string, number> = {
    scraped: jobs.length,
    applied: applications.filter((a) => ["applied", "oa", "interview", "offer"].includes(a.stage)).length,
    oa: applications.filter((a) => ["oa", "interview", "offer"].includes(a.stage)).length,
    interview: applications.filter((a) => ["interview", "offer"].includes(a.stage)).length,
    offer: applications.filter((a) => a.stage === "offer").length,
  };
  return counts;
};
