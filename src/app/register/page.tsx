"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? "注册失败");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-brand-600">创建账号</div>
          <p className="text-sm text-gray-400 mt-1">开始你的求职作战</p>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button type="submit" disabled={loading}
            className="block w-full rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {loading ? "创建中…" : "注册"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          已有账号?<Link href="/login" className="text-brand-600">登录</Link>
        </p>
      </form>
    </div>
  );
}
