import Link from "next/link";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-brand-600">JoBs</div>
          <p className="text-sm text-gray-400 mt-1">全链路求职平台</p>
        </div>
        <div className="space-y-3">
          <input
            placeholder="Email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <Link
            href="/"
            className="block rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
          >
            登录
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          还没有账号?<span className="text-brand-600">注册</span>
        </p>
      </div>
    </div>
  );
}
