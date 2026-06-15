// ATS 抓取器:从 Greenhouse / Lever / Ashby 公开职位接口拉取并归一化。
// 这些是公开 JSON 接口,合规、无需鉴权,美国科技公司覆盖广。

import { prisma } from "./db";
import { detectRemote, extractTags, stripHtml, summarize } from "./extract";
import { PER_COMPANY_LIMIT, SOURCES, pretty } from "./sources";

export interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary: string | null;
  tags: string[];
  jdSummary: string;
  jdFull: string;
  url: string;
  postedAt: Date;
}

const UA = { "User-Agent": "JoBs-aggregator/1.0" };

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { headers: UA, cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---------- Greenhouse ----------
// GET https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
async function fetchGreenhouse(token: string): Promise<NormalizedJob[]> {
  const data = await getJson(
    `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`
  );
  const jobs: any[] = data?.jobs ?? [];
  return jobs.slice(0, PER_COMPANY_LIMIT).map((j) => {
    const content = typeof j.content === "string" ? decodeEntities(j.content) : "";
    const location = j.location?.name ?? "";
    return {
      source: "greenhouse",
      externalId: String(j.id),
      title: j.title ?? "Untitled",
      company: pretty(token),
      location,
      remote: detectRemote(content, location),
      salary: null,
      tags: extractTags(`${j.title} ${stripHtml(content)}`),
      jdSummary: summarize(content),
      jdFull: stripHtml(content),
      url: j.absolute_url ?? `https://boards.greenhouse.io/${token}`,
      postedAt: parseDate(j.updated_at),
    };
  });
}

// ---------- Lever ----------
// GET https://api.lever.co/v0/postings/{company}?mode=json
async function fetchLever(company: string): Promise<NormalizedJob[]> {
  const data = await getJson(`https://api.lever.co/v0/postings/${company}?mode=json`);
  const jobs: any[] = Array.isArray(data) ? data : [];
  return jobs.slice(0, PER_COMPANY_LIMIT).map((j) => {
    const desc = j.descriptionPlain ?? stripHtml(j.description ?? "");
    const location = j.categories?.location ?? "";
    return {
      source: "lever",
      externalId: String(j.id),
      title: j.text ?? "Untitled",
      company: pretty(company),
      location,
      remote: detectRemote(desc, location),
      salary: j.salaryRange
        ? `${j.salaryRange.currency ?? "$"}${j.salaryRange.min}–${j.salaryRange.max}`
        : null,
      tags: extractTags(`${j.text} ${desc}`),
      jdSummary: summarize(desc),
      jdFull: desc,
      url: j.hostedUrl ?? j.applyUrl ?? `https://jobs.lever.co/${company}`,
      postedAt: j.createdAt ? new Date(j.createdAt) : new Date(),
    };
  });
}

// ---------- Ashby ----------
// GET https://api.ashbyhq.com/posting-api/job-board/{name}?includeCompensation=true
async function fetchAshby(name: string): Promise<NormalizedJob[]> {
  const data = await getJson(
    `https://api.ashbyhq.com/posting-api/job-board/${name}?includeCompensation=true`
  );
  const jobs: any[] = data?.jobs ?? [];
  return jobs.slice(0, PER_COMPANY_LIMIT).map((j) => {
    const desc = j.descriptionPlain ?? stripHtml(j.descriptionHtml ?? "");
    const location = j.location ?? j.locationName ?? "";
    const comp = j.compensation?.compensationTierSummary ?? null;
    return {
      source: "ashby",
      externalId: String(j.id),
      title: j.title ?? "Untitled",
      company: pretty(name),
      location,
      remote: !!j.isRemote || detectRemote(desc, location),
      salary: comp,
      tags: extractTags(`${j.title} ${desc}`),
      jdSummary: summarize(desc),
      jdFull: desc,
      url: j.jobUrl ?? j.applyUrl ?? `https://jobs.ashbyhq.com/${name}`,
      postedAt: parseDate(j.publishedAt ?? j.updatedAt),
    };
  });
}

// ---------- helpers ----------
function parseDate(v: any): Date {
  if (!v) return new Date();
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// ---------- orchestrator ----------
export interface ScrapeResult {
  fetched: number;
  upserted: number;
  perSource: Record<string, number>;
  errors: string[];
}

export async function runScrape(): Promise<ScrapeResult> {
  const all: NormalizedJob[] = [];
  const perSource: Record<string, number> = {};
  const errors: string[] = [];

  const tasks: Promise<void>[] = [];
  const run = (label: string, p: Promise<NormalizedJob[]>) =>
    tasks.push(
      p
        .then((jobs) => {
          all.push(...jobs);
          perSource[label] = jobs.length;
        })
        .catch((e) => {
          errors.push(`${label}: ${String(e)}`);
        })
    );

  for (const t of SOURCES.greenhouse) run(`greenhouse/${t}`, fetchGreenhouse(t));
  for (const t of SOURCES.lever) run(`lever/${t}`, fetchLever(t));
  for (const t of SOURCES.ashby) run(`ashby/${t}`, fetchAshby(t));

  await Promise.all(tasks);

  let upserted = 0;
  for (const j of all) {
    try {
      await prisma.job.upsert({
        where: { source_externalId: { source: j.source, externalId: j.externalId } },
        update: {
          title: j.title,
          company: j.company,
          location: j.location,
          remote: j.remote,
          salary: j.salary,
          tags: j.tags,
          jdSummary: j.jdSummary,
          jdFull: j.jdFull,
          url: j.url,
          postedAt: j.postedAt,
        },
        create: j,
      });
      upserted++;
    } catch (e) {
      errors.push(`upsert ${j.source}/${j.externalId}: ${String(e)}`);
    }
  }

  return { fetched: all.length, upserted, perSource, errors };
}
