"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeacherNav } from "@/components/teacher-nav";
import { Users, Star, TrendingUp, ClipboardCheck, ArrowRight, Trophy, Megaphone } from "lucide-react";
import { getDashboardStats, getToday, CATEGORIES, categoryLabels } from "@/lib/queries";
import type { DashboardStats } from "@/lib/types";

export default function TeacherPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  if (!stats) {
    return (
      <TeacherNav>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </TeacherNav>
    );
  }

  return (
    <TeacherNav>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
          <p className="text-slate-500 mt-1">26工业机器人2班 · 今日习惯表现概览</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">学生总数</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.studentCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">今日已评</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.todayRatedCount}</p>
                <p className="text-xs text-slate-400">/ {stats.studentCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">今日均分</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.todayAvgRating}</p>
                <p className="text-xs text-slate-400">满分5星</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">本周均分</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.weekAvgRating}</p>
                <p className="text-xs text-slate-400">满分5星</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/teacher/rating"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <ClipboardCheck className="w-6 h-6 text-emerald-500" />
              <span className="text-sm text-slate-700">今日评分</span>
            </Link>
            <Link
              href="/teacher/students"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <Users className="w-6 h-6 text-blue-500" />
              <span className="text-sm text-slate-700">学生管理</span>
            </Link>
            <Link
              href="/teacher/trends"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <span className="text-sm text-slate-700">习惯趋势</span>
            </Link>
            <Link
              href="/teacher/notices"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <Megaphone className="w-6 h-6 text-orange-500" />
              <span className="text-sm text-slate-700">发通知</span>
            </Link>
          </div>
        </div>

        {/* 本周之星 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900">本周之星</h2>
          </div>
          {stats.topStudents.length > 0 ? (
            <div className="space-y-2">
              {stats.topStudents.map((s, idx) => (
                <div key={s.studentId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? "bg-yellow-100 text-yellow-700" :
                      idx === 1 ? "bg-gray-100 text-gray-600" :
                      idx === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-900">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-amber-500">{s.avgRating}</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">暂无评分数据</p>
          )}
        </div>

        {/* 四维习惯说明 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4">四维习惯培养体系</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => {
              const label = categoryLabels[cat];
              return (
                <div key={cat} className={`p-4 rounded-lg border ${label.color}`}>
                  <div className="text-2xl mb-2">{label.icon}</div>
                  <p className="font-medium text-sm">{label.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TeacherNav>
  );
}
