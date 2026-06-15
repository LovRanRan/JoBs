// 注入到 ATS 申请页,执行 autofill。通过 message 接收资料,返回结果。
// 注意:浏览器安全限制下,脚本【无法】自动设置 <input type=file> 的文件,
// 所以简历上传必须用户手动完成——其余文本字段全部自动填。

(function () {
  if (window.__jobsAutofillReady) return;
  window.__jobsAutofillReady = true;

  // React-friendly 赋值:用原生 setter + 派发 input/change 事件
  function setValue(el, value) {
    if (!el || value == null || value === "") return false;
    const proto = el.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter ? setter.call(el, value) : (el.value = value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.style.outline = "2px solid #3b6ef5";
    return true;
  }

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  function firstMatch(selectors) {
    for (const s of selectors) {
      const el = q(s);
      if (el) return el;
    }
    return null;
  }

  function splitName(full) {
    const parts = (full || "").trim().split(/\s+/);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
  }

  function platform() {
    const h = location.host;
    if (h.includes("greenhouse")) return "greenhouse";
    if (h.includes("lever.co")) return "lever";
    if (h.includes("ashbyhq")) return "ashby";
    return "generic";
  }

  // 通用回退:按 type / name / id 关键字匹配
  function genericFill(p) {
    const { first, last } = splitName(p.name);
    let filled = 0;
    const tryFill = (selectors, val) => {
      const el = firstMatch(selectors);
      if (el && setValue(el, val)) filled++;
    };
    tryFill(['input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]'], p.email);
    tryFill(['input[name*="first" i]', 'input[id*="first" i]'], first);
    tryFill(['input[name*="last" i]', 'input[id*="last" i]'], last);
    tryFill(['input[name="name" i]', 'input[name*="fullname" i]', 'input[aria-label*="name" i]'], p.name);
    tryFill(['input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]'], p.phone || "");
    tryFill(['input[name*="location" i]', 'input[id*="location" i]', 'input[placeholder*="location" i]'], p.location);
    return filled;
  }

  const adapters = {
    greenhouse(p) {
      const { first, last } = splitName(p.name);
      let n = 0;
      n += setValue(q("#first_name"), first) ? 1 : 0;
      n += setValue(q("#last_name"), last) ? 1 : 0;
      n += setValue(q("#email"), p.email) ? 1 : 0;
      n += setValue(q("#phone"), p.phone || "") ? 1 : 0;
      return n + genericFill(p);
    },
    lever(p) {
      let n = 0;
      n += setValue(firstMatch(['input[name="name"]']), p.name) ? 1 : 0;
      n += setValue(firstMatch(['input[name="email"]']), p.email) ? 1 : 0;
      n += setValue(firstMatch(['input[name="phone"]']), p.phone || "") ? 1 : 0;
      n += setValue(firstMatch(['input[name="location"]']), p.location) ? 1 : 0;
      return n + genericFill(p);
    },
    ashby(p) {
      // Ashby 是 React 表单,主要靠通用匹配
      return genericFill(p);
    },
    generic: genericFill,
  };

  function findSubmit() {
    const byType = q('button[type="submit"], input[type="submit"]');
    if (byType) return byType;
    const cands = qa("button, a[role='button']");
    return cands.find((b) => /submit|apply now|submit application/i.test(b.textContent || "")) || null;
  }

  function hasFileInput() {
    return !!q('input[type="file"]');
  }

  async function doAutofill(data) {
    const plat = platform();
    const fill = adapters[plat] || adapters.generic;
    let filled = 0;
    try {
      filled = fill(data.profile || {});
    } catch (e) {
      return { status: "failed", message: "autofill error: " + String(e) };
    }

    if (filled === 0) {
      return { status: "failed", message: "未找到可填写的字段(页面结构可能不同)" };
    }

    const needsResume = hasFileInput();

    if (data.dryRun) {
      return {
        status: "filled",
        message: `Dry-run:已填 ${filled} 个字段${needsResume ? ",简历需手动上传" : ""}。未提交。`,
      };
    }

    // 真提交:若表单需要上传简历,脚本无法代传文件 → 停在填好状态,提示手动
    if (needsResume) {
      return {
        status: "filled",
        message: `已填 ${filled} 个字段,但此表单需上传简历(浏览器禁止脚本设置文件),请手动上传并提交。`,
      };
    }

    const btn = findSubmit();
    if (!btn) return { status: "filled", message: `已填 ${filled} 个字段,但未找到提交按钮。` };
    btn.click();
    return { status: "submitted", message: `已填 ${filled} 个字段并点击提交。` };
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "JOBS_AUTOFILL") {
      doAutofill(msg.data).then(sendResponse);
      return true; // async
    }
  });
})();
