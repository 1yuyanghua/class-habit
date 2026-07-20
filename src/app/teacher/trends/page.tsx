"use client";

import { useEffect, useState } from "react";
import { TeacherNav } from "@/components/teacher-nav";
import { studentStore } from "@/lib/store";
import { getStudentTrend, CATEGORIES, categoryLabels, getToday } from "@/lib/queries";
import type { Student, HabitCategory } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Search, TrendingUp, Star } from "lucide-react";

export default function TrendsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [days, setDays] = useState(7);

  useEffect(() => {
    const all = studentStore.getAll().filter((s) => s.isActive);
    setStudents(all);
    if (all.length > 0) setSelectedId(all[0].id);
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedId);
  const trend = selectedStudent ? getStudentTrend(selectedStudent.id, days) : [];

  // 折线图数据
  const lineData = trend.map((t) => ({
    date: t.date.slice(5),
    平均星级: t.avgRating,
    ...Object.fromEntries(
      CATEGORIES.map((c) => [categoryLabels[c].label, t.categoryRatings[c]])
    ),
  }));

  // 雷达图数据（最近一天）
  const latestTrend = trend[trend.length - 1];
  const radarData = latestTrend
    ? CATEGORIES.map((c) => ({
        subject: categoryLabels[c].label,
        星级: latestTrend.categoryRatings[c],
      }))
    : CATEGORIES.map((c) => ({ subject: categoryLabels[c].label, 星级: 0 }));

  // 计算平均
  const avgRating = trend.length > 0
    ? Math.round((trend.reduce((sum, t) => sum + t.avgRating, 0) / trend.length) * 10) / 10
    : 0;

  return (
    <TeacherNav>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">习惯趋势</h1>
          <p className="text-slate-500 mt-1">查看学生习惯养成变化趋势</p>
        </div>

        {/* 选择器 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.studentNo})</option>
              ))}
            </select>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={7}>最近7天</option>
            <option value={14}>最近14天</option>
            <option value={30}>最近30天</option>
          </select>
        </div>

        {selectedStudent && (
          <>
            {/* 概览 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">学生</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{selectedStudent.name}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">{days}天平均</p>
                <p className="text-lg font-bold text-amber-500 mt-1 flex items-center gap-1">
                  {avgRating} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">已评天数</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{trend.length}天</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">今日</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{getToday().slice(5)}</p>
              </div>
            </div>

            {/* 趋势折线图 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h2 className="font-bold text-slate-900">习惯星级趋势</h2>
              </div>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="平均星级" stroke="#4f46e5" strokeWidth={2} />
                    {CATEGORIES.map((c, i) => (
                      <Line
                        key={c}
                        type="monotone"
                        dataKey={categoryLabels[c].label}
                        stroke={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][i]}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-400 py-12">暂无评分数据</p>
              )}
            </div>

            {/* 四维雷达图 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-900 mb-4">四维习惯雷达图（最近评分）</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar name="星级" dataKey="星级" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </TeacherNav>
  );
}
