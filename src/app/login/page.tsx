"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? "登录失败");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-brand-600">JoBs</div>
          <p className="text-sm text-gray-400 mt-1">全链路求职平台</p>
        </div>
        <div className="space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="block w-full rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          还没有账号?<Link href="/register" className="text-brand-600">注册</Link>
        </p>
      </form>
    </div>
  );
}
