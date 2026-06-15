import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "JoBs — 全链路求职平台",
  description: "抓岗位 · 个性化匹配 · 按 JD 改简历 · 投递追踪 · 统计",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen p-8 max-w-6xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
