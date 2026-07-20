"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionStore, initializeData, studentStore, noticeStore, habitItemStore, habitScoreStore } from "@/lib/store";
import { getStudentTrend, getStudentDailySummary, getToday, CATEGORIES, categoryLabels } from "@/lib/queries";
import type { Student, Notice, TrendData, HabitCategory } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Star, TrendingUp, Megaphone, BookOpen, LogOut, School, Calendar } from "lucide-react";
import { relativeTime, formatDate } from "@/lib/utils";

export default function ParentPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [todaySummary, setTodaySummary] = useState<ReturnType<typeof getStudentDailySummary>>(null);
  const [tab, setTab] = useState<"overview" | "trend" | "notices">("overview");

  useEffect(() => {
    initializeData();
    const session = sessionStore.get();
    if (!session || session.role !== "parent" || !session.studentId) {
      router.push("/login?type=parent");
      return;
    }

    const stu = studentStore.getById(session.studentId);
    if (!stu) {
      router.push("/");
      return;
    }
    setStudent(stu);
    setTrend(getStudentTrend(stu.id, 7));
    setNotices(noticeStore.getAll());
    setTodaySummary(getStudentDailySummary(stu.id, getToday()));
  }, [router]);

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    sessionStore.clear();
    router.push("/");
  };

  // 图表数据
  const lineData = trend.map((t) => ({
    date: t.date.slice(5),
    平均星级: t.avgRating,
  }));

  const latestTrend = trend[trend.length - 1];
  const radarData = latestTrend
    ? CATEGORIES.map((c) => ({
        subject: categoryLabels[c].label,
        星级: latestTrend.categoryRatings[c],
      }))
    : CATEGORIES.map((c) => ({ subject: categoryLabels[c].label, 星级: 0 }));

  const avgRating = trend.length > 0
    ? Math.round((trend.reduce((sum, t) => sum + t.avgRating, 0) / trend.length) * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶栏 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-80">26工业机器人2班</p>
                <h1 className="font-bold">{student.name} 的习惯表现</h1>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Tab */}
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
          {[
            { key: "overview", label: "今日表现" },
            { key: "trend", label: "习惯趋势" },
            { key: "notices", label: "通知作业" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "overview" | "trend" | "notices")}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                tab === t.key ? "bg-indigo-600 text-white" : "text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 今日表现 */}
        {tab === "overview" && (
          <div className="space-y-4">
            {todaySummary ? (
              <>
                {/* 今日总评 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                  <p className="text-sm text-slate-500">{getToday()} 今日表现</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-8 h-8 ${
                          s <= Math.round(todaySummary.avgRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{todaySummary.avgRating}</p>
                  <p className="text-xs text-slate-400">总星数: {todaySummary.totalStars}星</p>
                </div>

                {/* 四维详情 */}
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const label = categoryLabels[cat];
                    const rating = todaySummary.categoryRatings[cat];
                    return (
                      <div key={cat} className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{label.icon}</span>
                          <span className="text-sm font-medium text-slate-700">{label.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="text-sm font-medium text-slate-900 ml-1">{rating}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400">今日暂无评分记录</p>
              </div>
            )}
          </div>
        )}

        {/* 习惯趋势 */}
        {tab === "trend" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h2 className="font-bold text-slate-900">最近7天趋势</h2>
              </div>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="平均星级" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-400 py-8">暂无趋势数据</p>
              )}
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-400">7天平均星级</p>
                <p className="text-xl font-bold text-amber-500">{avgRating} ⭐</p>
              </div>
            </div>

            {/* 雷达图 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-900 mb-4">四维习惯雷达图</h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar name="星级" dataKey="星级" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 通知作业 */}
        {tab === "notices" && (
          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400">暂无通知</p>
              </div>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      n.type === "notice" ? "bg-blue-50" : "bg-purple-50"
                    }`}>
                      {n.type === "notice" ? (
                        <Megaphone className="w-4 h-4 text-blue-500" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        n.type === "notice" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      }`}>
                        {n.type === "notice" ? "通知" : "作业"}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">{relativeTime(n.createdAt)}</span>
                    </div>
                  </div>
                  {n.title && <h3 className="font-medium text-slate-900">{n.title}</h3>}
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 学生信息 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-bold text-slate-900 mb-3 text-sm">学生信息</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs">学号</span>
              <p className="text-slate-900">{student.studentNo}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">性别</span>
              <p className="text-slate-900">{student.gender}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">座位号</span>
              <p className="text-slate-900">{student.seatNo}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">住宿情况</span>
              <p className="text-slate-900">{student.boarding}</p>
            </div>
            {student.originSchool && (
              <div className="col-span-2">
                <span className="text-slate-400 text-xs">毕业学校</span>
                <p className="text-slate-900 text-xs">{student.originSchool}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
