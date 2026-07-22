"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Star, ClipboardCheck, Megaphone, Settings, School, LogOut, Menu, X, GraduationCap } from "lucide-react";
import { sessionStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/teacher", label: "仪表盘", icon: LayoutDashboard },
  { href: "/teacher/students", label: "学生管理", icon: Users },
  { href: "/teacher/rating", label: "今日评分", icon: ClipboardCheck },
  { href: "/teacher/grades", label: "成绩管理", icon: GraduationCap },
  { href: "/teacher/trends", label: "习惯趋势", icon: Star },
  { href: "/teacher/notices", label: "通知管理", icon: Megaphone },
  { href: "/teacher/settings", label: "设置", icon: Settings },
];

export function TeacherNav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    sessionStore.clear();
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 桌面侧栏 */}
      <div className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 shrink-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">26工业机器人2</h1>
            <p className="text-xs text-slate-500">习惯养成管理</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/teacher" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <LogOut className="w-5 h-5" /> 退出登录
          </button>
        </div>
      </div>

      {/* 移动端 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-60 bg-white flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-slate-900 text-sm">26工业机器人2</h1>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="w-5 h-5" /> {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-3 border-t border-slate-200">
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full">
                <LogOut className="w-5 h-5" /> 退出登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主内容 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-900">习惯养成管理</h1>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
