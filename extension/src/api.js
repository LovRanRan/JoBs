// 与 JoBs 后端通信。apiBase 和 token 存在 chrome.storage.local。

export async function getSettings() {
  const { apiBase, token } = await chrome.storage.local.get(["apiBase", "token"]);
  return { apiBase: apiBase || "http://localhost:3000", token: token || "" };
}

export async function saveSettings(apiBase, token) {
  await chrome.storage.local.set({ apiBase, token });
}

async function call(path, opts = {}) {
  const { apiBase, token } = await getSettings();
  if (!token) throw new Error("未设置 Token");
  const res = await fetch(`${apiBase}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export function fetchQueue() {
  return call("/api/extension/queue");
}

export function report(payload) {
  return call("/api/extension/report", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
