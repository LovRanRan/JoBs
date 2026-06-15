import { getSettings, saveSettings, fetchQueue } from "./api.js";

const $ = (id) => document.getElementById(id);
const logEl = $("log");

function addLog(line, cls = "") {
  const div = document.createElement("div");
  if (cls) div.className = cls;
  div.textContent = line;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

// 接收 background 的日志
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "JOBS_LOG") addLog(msg.line);
});

async function init() {
  const { apiBase, token } = await getSettings();
  $("apiBase").value = apiBase;
  $("token").value = token;
}
init();

$("save").addEventListener("click", async () => {
  await saveSettings($("apiBase").value.trim().replace(/\/$/, ""), $("token").value.trim());
  $("conn").textContent = "测试中…";
  try {
    const d = await fetchQueue();
    const cfg = d.config;
    $("conn").innerHTML =
      `<span class="ok">已连接 ✓</span> 启用:${cfg.enabled ? "是" : "否"} · ` +
      `Dry-run:${cfg.dryRun ? "是" : "否"} · 上限:${cfg.dailyLimit ?? "不限"} · 队列:${d.queue.length}`;
  } catch (e) {
    $("conn").innerHTML = `<span class="err">连接失败:${e.message}</span>`;
  }
});

$("run").addEventListener("click", () => {
  logEl.innerHTML = "";
  addLog("启动…");
  chrome.runtime.sendMessage({ type: "JOBS_RUN" }).catch((e) => addLog("失败:" + e.message, "err"));
});
