"use client";

import { useEffect, useState } from "react";
import { TeacherNav } from "@/components/teacher-nav";
import { classInfoStore, habitItemStore } from "@/lib/store";
import { CATEGORIES, categoryLabels } from "@/lib/queries";
import type { ClassInfo, HabitItem, HabitCategory } from "@/lib/types";
import { School, BookOpen, Save, Plus, Trash2, Database, Download, Upload, Eraser } from "lucide-react";
import { exportAllData, importAllData, clearAllData, clearAllScores } from "@/lib/store";

export default function SettingsPage() {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [items, setItems] = useState<HabitItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setClassInfo(classInfoStore.get());
    setItems(habitItemStore.getAll());
  }, [refreshKey]);

  const handleSaveClass = () => {
    if (!classInfo) return;
    classInfoStore.update(classInfo);
    alert("班级信息已保存");
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `习惯养成数据备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        importAllData(evt.target?.result as string);
        alert("导入成功！页面将刷新...");
        window.location.reload();
      } catch {
        alert("导入失败");
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm("确定清空所有数据？此操作不可恢复！")) {
      clearAllData();
      window.location.reload();
    }
  };

  const handleClearScores = () => {
    if (confirm("确定清空所有学生评价记录？\n\n学生档案、班级信息、评价项和通知将保留，仅清除所有评分记录。此操作不可恢复！")) {
      clearAllScores();
      alert("所有评分记录已清空！");
      window.location.reload();
    }
  };

  return (
    <TeacherNav>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">设置</h1>
          <p className="text-slate-500 mt-1">班级信息、评价项管理、数据备份</p>
        </div>

        {/* 班级信息 */}
        {classInfo && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <School className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-slate-900">班级信息</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">班级名称</label>
                <input
                  type="text"
                  value={classInfo.name}
                  onChange={(e) => setClassInfo({ ...classInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">班主任姓名</label>
                <input
                  type="text"
                  value={classInfo.teacherName}
                  onChange={(e) => setClassInfo({ ...classInfo, teacherName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">班主任手机号（登录用）</label>
                <input
                  type="tel"
                  value={classInfo.teacherPhone}
                  onChange={(e) => setClassInfo({ ...classInfo, teacherPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">登录密码</label>
                <input
                  type="text"
                  value={classInfo.teacherPassword}
                  onChange={(e) => setClassInfo({ ...classInfo, teacherPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleSaveClass}
              className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
            >
              <Save className="w-4 h-4" /> 保存
            </button>
          </div>
        )}

        {/* 习惯评价项 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-slate-900">习惯评价项</h2>
          </div>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const label = categoryLabels[cat];
              const catItems = items.filter((i) => i.category === cat);
              return (
                <div key={cat}>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${label.color} mb-2`}>
                    {label.icon} {label.label}
                  </div>
                  <div className="space-y-1.5 ml-2">
                    {catItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded bg-slate-50">
                        <div>
                          <span className="text-sm font-medium text-slate-900">{item.name}</span>
                          <span className="text-xs text-slate-400 ml-2">{item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900">数据管理</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700">
              数据存储在浏览器本地，请定期导出备份。换设备需要重新导入。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium">
              <Download className="w-4 h-4" /> 导出备份
            </button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium cursor-pointer">
              <Upload className="w-4 h-4" /> 导入备份
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={handleClearScores} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 text-sm font-medium">
              <Eraser className="w-4 h-4" /> 清空所有评分
            </button>
            <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium">
              <Trash2 className="w-4 h-4" /> 清空全部数据
            </button>
          </div>
        </div>
      </div>
    </TeacherNav>
  );
}
