"use client";

import { useEffect, useState } from "react";
import { TeacherNav } from "@/components/teacher-nav";
import { studentStore, habitItemStore, habitScoreStore } from "@/lib/store";
import { getToday, CATEGORIES, categoryLabels } from "@/lib/queries";
import type { Student, HabitItem, HabitCategory } from "@/lib/types";
import { Star, Check, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function RatingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [items, setItems] = useState<HabitItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showUnratedOnly, setShowUnratedOnly] = useState(false);

  const today = getToday();

  useEffect(() => {
    setStudents(studentStore.getAll().filter((s) => s.isActive));
    setItems(habitItemStore.getAll());
  }, [refreshKey]);

  // 已评学生集合
  const ratedStudentIds = new Set(
    habitScoreStore.getByDate(today).map((s) => s.studentId)
  );

  const filteredStudents = students.filter((s) => {
    const matchSearch = !search || s.name.includes(search) || s.studentNo.includes(search);
    const matchUnrated = !showUnratedOnly || !ratedStudentIds.has(s.id);
    return matchSearch && matchUnrated;
  });

  const selectedStudent = selectedIndex >= 0 ? filteredStudents[selectedIndex] : null;

  // 加载选中学生的已有评分
  useEffect(() => {
    if (!selectedStudent) {
      setRatings({});
      return;
    }
    const existing = habitScoreStore.getByStudentAndDate(selectedStudent.id, today);
    const r: Record<string, number> = {};
    existing.forEach((s) => {
      r[s.itemId] = s.rating;
    });
    setRatings(r);
    setSaved(false);
  }, [selectedIndex, selectedStudent, today]);

  const handleRating = (itemId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [itemId]: rating }));
  };

  // 快速给一个维度所有项打同样分数
  const handleCategoryRating = (category: HabitCategory, rating: number) => {
    const catItems = items.filter((i) => i.category === category);
    const newRatings = { ...ratings };
    catItems.forEach((item) => {
      newRatings[item.id] = rating;
    });
    setRatings(newRatings);
  };

  const handleSave = (next: boolean = false) => {
    if (!selectedStudent) return;
    const records = Object.entries(ratings).map(([itemId, rating]) => ({
      date: today,
      studentId: selectedStudent.id,
      itemId,
      rating,
    }));
    habitScoreStore.bulkUpsert(records);
    setSaved(true);

    if (next) {
      // 自动跳到下一个学生
      setTimeout(() => {
        setSaved(false);
        setRefreshKey((k) => k + 1);
        if (selectedIndex < filteredStudents.length - 1) {
          setSelectedIndex(selectedIndex + 1);
        } else {
          setSelectedIndex(-1); // 最后一个，关闭弹窗
        }
      }, 500);
    } else {
      setTimeout(() => {
        setSaved(false);
        setRefreshKey((k) => k + 1);
      }, 1000);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex < filteredStudents.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  // 按维度分组
  const itemsByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  }));

  const ratedCount = Object.keys(ratings).length;
  const totalItems = items.length;
  const progress = students.length > 0 ? Math.round((ratedStudentIds.size / students.length) * 100) : 0;

  return (
    <TeacherNav>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">今日习惯评分</h1>
            <p className="text-slate-500 mt-1">{today} · 点击学生姓名弹出评分表</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">已评 {ratedStudentIds.size}/{students.length}</p>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 搜索筛选 */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索姓名、学号..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowUnratedOnly(!showUnratedOnly)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap ${
              showUnratedOnly
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
            }`}
          >
            {showUnratedOnly ? "✓ " : ""}只看未评
          </button>
        </div>

        {/* 学生网格 - 点击弹出评分 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredStudents.map((stu, idx) => {
            const isRated = ratedStudentIds.has(stu.id);
            return (
              <button
                key={stu.id}
                onClick={() => {
                  setSelectedIndex(idx);
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  isRated
                    ? "border-green-200 bg-green-50/50"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                {isRated && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                  stu.gender === "男" ? "bg-blue-500" : "bg-pink-500"
                }`}>
                  {stu.name[0]}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900">{stu.name}</p>
                  <p className="text-xs text-slate-400">{stu.seatNo}号</p>
                </div>
                {isRated && (
                  <span className="text-xs text-green-600">已评</span>
                )}
              </button>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-400">没有找到学生</p>
          </div>
        )}
      </div>

      {/* 评分弹窗 */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedIndex(-1)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-medium ${
                  selectedStudent.gender === "男" ? "bg-blue-500" : "bg-pink-500"
                }`}>
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-400">
                    {selectedStudent.studentNo} · {selectedStudent.gender} · 座位{selectedStudent.seatNo}
                    {selectedStudent.boarding && ` · ${selectedStudent.boarding}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-xs text-slate-400">进度</p>
                  <p className="text-sm font-medium text-slate-900">{ratedCount}/{totalItems}</p>
                </div>
                <button
                  onClick={() => setSelectedIndex(-1)}
                  className="p-2 rounded-lg hover:bg-white/60"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* 评分内容 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {itemsByCategory.map(({ category, items: catItems }) => {
                const label = categoryLabels[category];
                return (
                  <div key={category} className="border border-slate-100 rounded-xl overflow-hidden">
                    {/* 维度标题 + 快速打分 */}
                    <div className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-100 ${label.color}`}>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {label.icon} {label.label}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 mr-1">一键:</span>
                        {[3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleCategoryRating(category, star)}
                            className="px-2 py-0.5 rounded text-xs bg-white/60 hover:bg-white font-medium"
                          >
                            {star}星
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* 评价项 */}
                    <div className="divide-y divide-slate-50">
                      {catItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-400 truncate">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-0.5 ml-3 shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRating(item.id, star)}
                                className="p-0.5 active:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    star <= (ratings[item.id] || 0)
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-200 hover:text-amber-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 bg-white">
              <button
                onClick={handlePrev}
                disabled={selectedIndex === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> 上一人
              </button>

              <div className="flex-1" />

              {saved ? (
                <div className="flex items-center gap-2 px-4 py-2 text-green-600 text-sm font-medium">
                  <Check className="w-5 h-5" /> 已保存
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={ratedCount === 0}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 text-sm font-medium"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={ratedCount === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 text-sm font-medium"
                  >
                    保存并下一人 <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </TeacherNav>
  );
}
