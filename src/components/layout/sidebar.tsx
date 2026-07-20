"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Star,
  GraduationCap,
  MessageSquare,
  Settings,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/dashboard/students", label: "学生信息", icon: Users },
  { href: "/dashboard/behavior", label: "表现积分", icon: Star },
  { href: "/dashboard/grades", label: "成绩管理", icon: GraduationCap },
  { href: "/dashboard/communication", label: "家校沟通", icon: MessageSquare },
  { href: "/dashboard/settings", label: "设置", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-60 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
          <School className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-sm">班级管理系统</h1>
          <p className="text-xs text-slate-500">班主任专用</p>
        </div>
      </div>

      {/* 导航 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部信息 */}
      <div className="px-5 py-3 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center">数据存储于本地浏览器</p>
      </div>
    </div>
  );
}
