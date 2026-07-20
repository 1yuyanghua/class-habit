"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, School, Users } from "lucide-react";
import { sessionStore, classInfoStore, studentStore } from "@/lib/store";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"teacher" | "parent">("teacher");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "parent") setRole("parent");
    else setRole("teacher");
  }, [searchParams]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (role === "teacher") {
      const classInfo = classInfoStore.get();
      if (!classInfo) {
        setError("系统未初始化");
        return;
      }
      if (phone === classInfo.teacherPhone && password === classInfo.teacherPassword) {
        sessionStore.set({ role: "teacher" });
        router.push("/teacher");
      } else {
        setError("手机号或密码错误");
      }
    } else {
      const student = studentStore.getByPhone(phone);
      if (!student) {
        setError("未找到该手机号关联的学生");
        return;
      }
      if (password === student.parentPassword) {
        sessionStore.set({ role: "parent", studentId: student.id });
        router.push("/parent");
      } else {
        setError("密码错误");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* 角色切换 */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setRole("teacher")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                role === "teacher" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
              }`}
            >
              <School className="w-4 h-4" /> 班主任
            </button>
            <button
              onClick={() => setRole("parent")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                role === "parent" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
              }`}
            >
              <Users className="w-4 h-4" /> 家长
            </button>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-1">
            {role === "teacher" ? "班主任登录" : "家长登录"}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {role === "teacher"
              ? "请输入手机号和密码"
              : "请输入预留的家长手机号，密码为手机号后4位"}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="请输入密码"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              登录
            </button>
          </form>

          {role === "teacher" && (
            <div className="mt-4 text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
              <p>演示账号：</p>
              <p>手机号：13800000000</p>
              <p>密码：1234</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
