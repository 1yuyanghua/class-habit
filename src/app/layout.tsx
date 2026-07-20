import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "习惯养成管理系统 | 26工业机器人2班",
  description: "班主任、学生、家长共同关注的好习惯养成平台",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
