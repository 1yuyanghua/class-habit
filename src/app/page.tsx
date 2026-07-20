"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeData, sessionStore } from "@/lib/store";
import { School, Star, TrendingUp, Heart } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeData();
    const session = sessionStore.get();
    if (session?.role === "teacher") {
      router.push("/teacher");
    } else if (session?.role === "parent") {
      router.push("/parent");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <School className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">习惯养成管理系统</h1>
          <p className="text-slate-500 mt-2">26工业机器人2班 · 家校共育平台</p>
        </div>

        {/* 功能介绍 */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600">每日星级评价</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600">习惯趋势追踪</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600">家校共同关注</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <School className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600">四维习惯培养</p>
          </div>
        </div>

        {/* 登录入口 */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/login?type=teacher")}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md"
          >
            班主任登录
          </button>
          <button
            onClick={() => router.push("/login?type=parent")}
            className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
          >
            家长登录
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          家长默认密码为手机号后4位
        </p>
      </div>
    </div>
  );
}
