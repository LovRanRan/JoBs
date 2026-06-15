"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/jobs", label: "Jobs", icon: "🎯" },
  { href: "/applications", label: "Tracker", icon: "🗂️" },
  { href: "/resumes", label: "Resumes", icon: "📄" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white min-h-screen p-4 flex flex-col">
      <div className="px-2 mb-6">
        <div className="text-xl font-bold text-brand-600">JoBs</div>
        <div className="text-xs text-gray-400">全链路求职平台</div>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-100">
        <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">
          Sign out
        </Link>
      </div>
    </aside>
  );
}
