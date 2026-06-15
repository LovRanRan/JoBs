// 编排:拉队列 → 逐个开标签页注入填表 → 回写结果。受 dryRun / 每日上限 / 间隔约束。

import { fetchQueue, report } from "./api.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(line) {
  chrome.runtime.sendMessage({ type: "JOBS_LOG", line }).catch(() => {});
}

function waitForComplete(tabId, timeout = 20000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const listener = (id, info) => {
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(true);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    const poll = setInterval(async () => {
      if (Date.now() - t0 > timeout) {
        clearInterval(poll);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(false);
      }
    }, 500);
  });
}

async function runOne(item, data) {
  const tab = await chrome.tabs.create({ url: item.url, active: false });
  await waitForComplete(tab.id);
  await sleep(1500); // 给 React 表单渲染时间

  let result = { status: "failed", message: "no response" };
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["src/content.js"] });
    result = await chrome.tabs.sendMessage(tab.id, {
      type: "JOBS_AUTOFILL",
      data: { profile: data.profile, resume: data.resume, dryRun: data.config.dryRun },
    });
  } catch (e) {
    result = { status: "failed", message: String(e) };
  }

  await report({
    applicationId: item.applicationId,
    jobId: item.jobId,
    company: item.company,
    title: item.title,
    platform: item.platform,
    status: result.status,
    message: result.message,
  }).catch(() => {});

  // dry-run 留着标签页给用户看;真提交后关闭
  if (!data.config.dryRun && result.status === "submitted") {
    await sleep(1200);
    chrome.tabs.remove(tab.id).catch(() => {});
  }
  return result;
}

async function run() {
  let data;
  try {
    data = await fetchQueue();
  } catch (e) {
    log("拉取队列失败:" + String(e));
    return;
  }

  if (!data.config.enabled) {
    log("自动投递未启用(在 JoBs 设置里打开)。");
    return;
  }

  let queue = data.queue || [];
  if (data.config.dailyLimit != null) {
    const remaining = Math.max(0, data.config.dailyLimit - (data.appliedToday || 0));
    queue = queue.slice(0, remaining);
    log(`今日上限 ${data.config.dailyLimit},已投 ${data.appliedToday},本次处理 ${queue.length} 个。`);
  } else {
    log(`无上限,队列 ${queue.length} 个。`);
  }

  if (!queue.length) {
    log("没有待投岗位。去 JoBs 的 Jobs 页把岗位「加入看板(待投)」。");
    return;
  }

  const interval = (data.config.minIntervalSec || 45) * 1000;
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    log(`(${i + 1}/${queue.length}) ${item.title} · ${item.company} …`);
    const r = await runOne(item, data);
    log(`   → ${r.status}:${r.message}`);
    if (i < queue.length - 1) {
      const jitter = Math.floor(Math.random() * 10000);
      await sleep(interval + jitter);
    }
  }
  log("完成。");
}

chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg?.type === "JOBS_RUN") {
    run().then(() => sendResponse({ ok: true }));
    return true;
  }
});
