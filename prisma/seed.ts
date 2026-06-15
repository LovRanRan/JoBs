import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeMatch } from "../src/lib/match";

const prisma = new PrismaClient();

const SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js", "Python",
  "PostgreSQL", "AWS", "Docker", "GraphQL", "System Design",
];

const JOBS = [
  { title: "Software Engineer, Full Stack", company: "Stripe", location: "San Francisco, CA", remote: true, salary: "$180k–$240k + equity", source: "greenhouse", externalId: "stripe-1", postedAt: "2026-06-14", tags: ["TypeScript", "React", "Node.js", "PostgreSQL", "API"], jdSummary: "Build and scale payment APIs and internal dashboards.", url: "https://boards.greenhouse.io/stripe" },
  { title: "Backend Engineer", company: "Notion", location: "San Francisco, CA", remote: false, salary: "$170k–$220k", source: "lever", externalId: "notion-1", postedAt: "2026-06-14", tags: ["Node.js", "PostgreSQL", "AWS", "System Design"], jdSummary: "Own backend services for collaborative editing.", url: "https://jobs.lever.co/notion" },
  { title: "Frontend Engineer", company: "Vercel", location: "Remote (US)", remote: true, salary: "$160k–$210k + equity", source: "ashby", externalId: "vercel-1", postedAt: "2026-06-13", tags: ["React", "Next.js", "TypeScript", "UI"], jdSummary: "Work on the Next.js dashboard and developer experience.", url: "https://jobs.ashbyhq.com/vercel" },
  { title: "Full Stack Engineer", company: "Linear", location: "Remote (US)", remote: true, salary: "$165k–$215k", source: "ashby", externalId: "linear-1", postedAt: "2026-06-12", tags: ["TypeScript", "React", "GraphQL", "Node.js"], jdSummary: "Build the Linear app end-to-end with craft and speed.", url: "https://jobs.ashbyhq.com/linear" },
  { title: "Software Engineer, Platform", company: "Databricks", location: "Seattle, WA", remote: false, salary: "$175k–$235k + equity", source: "greenhouse", externalId: "databricks-1", postedAt: "2026-06-11", tags: ["Python", "AWS", "Docker", "Distributed Systems"], jdSummary: "Build data infrastructure used by thousands of customers.", url: "https://boards.greenhouse.io/databricks" },
  { title: "Senior Frontend Engineer", company: "Figma", location: "San Francisco, CA", remote: true, salary: "$190k–$250k + equity", source: "greenhouse", externalId: "figma-1", postedAt: "2026-06-14", tags: ["React", "TypeScript", "WebGL", "Performance"], jdSummary: "Push the boundaries of in-browser design tools.", url: "https://boards.greenhouse.io/figma" },
];

async function main() {
  console.log("Seeding…");

  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "13812764054zhc@gmail.com" },
    update: {},
    create: {
      email: "13812764054zhc@gmail.com",
      passwordHash,
      name: "David Zhou",
      profile: {
        create: {
          title: "Software Engineer",
          yearsExp: 3,
          location: "Seattle, WA",
          targetRoles: ["Software Engineer", "Full-Stack Engineer", "Backend Engineer"],
          targetLocations: ["Seattle, WA", "San Francisco, CA", "Remote (US)"],
          minSalary: 150000,
          workAuth: "F-1 OPT / needs future sponsorship",
          skills: SKILLS,
        },
      },
    },
  });

  const jobRecords = [];
  for (const j of JOBS) {
    const job = await prisma.job.upsert({
      where: { source_externalId: { source: j.source, externalId: j.externalId } },
      update: {},
      create: { ...j, postedAt: new Date(j.postedAt) },
    });
    jobRecords.push(job);
  }

  await prisma.resume.deleteMany({ where: { userId: user.id } });
  await prisma.resume.createMany({
    data: [
      { userId: user.id, name: "Master Resume", base: true, keywords: ["TypeScript", "React", "Node.js", "Python", "AWS"] },
      { userId: user.id, name: "Vercel · Frontend", tailoredFor: "Vercel — Frontend Engineer", keywords: ["Next.js", "React", "TypeScript", "DX"] },
      { userId: user.id, name: "Notion · Backend", tailoredFor: "Notion — Backend Engineer", keywords: ["Node.js", "PostgreSQL", "AWS", "System Design"] },
    ],
  });

  // applications for a few jobs, with computed match
  const stages: Record<string, string> = {
    "stripe-1": "new",
    "figma-1": "new",
    "notion-1": "to_apply",
    "vercel-1": "applied",
    "linear-1": "interview",
    "databricks-1": "oa",
  };
  for (const job of jobRecords) {
    const stage = stages[job.externalId ?? ""];
    if (!stage) continue;
    const m = computeMatch(SKILLS, job.tags);
    await prisma.application.upsert({
      where: { userId_jobId: { userId: user.id, jobId: job.id } },
      update: { stage, matchScore: m.score, matched: m.matched, gaps: m.gaps },
      create: {
        userId: user.id,
        jobId: job.id,
        stage,
        matchScore: m.score,
        matched: m.matched,
        gaps: m.gaps,
        appliedAt: ["applied", "oa", "interview", "offer"].includes(stage) ? new Date("2026-06-08") : null,
        nextStep: stage === "interview" ? "6/18 技术面" : stage === "oa" ? "OA 截止 6/16" : undefined,
      },
    });
  }

  console.log("Seed done. Login: 13812764054zhc@gmail.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
