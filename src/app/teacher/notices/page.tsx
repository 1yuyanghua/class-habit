"use client";

import { useEffect, useState } from "react";
import { TeacherNav } from "@/components/teacher-nav";
import { noticeStore } from "@/lib/store";
import type { Notice } from "@/lib/types";
import { Megaphone, BookOpen, Plus, Trash2, X } from "lucide-react";
import { relativeTime } from "@/lib/utils";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ type: "notice" as "notice" | "homework", title: "", content: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setNotices(noticeStore.getAll());
  }, [refreshKey]);

  const handleCreate = () => {
    if (!form.content.trim()) {
      alert("请填写内容");
      return;
    }
    noticeStore.create({
      type: form.type,
      title: form.title.trim(),
      content: form.content.trim(),
    });
    setForm({ type: "notice", title: "", content: "" });
    setShowDialog(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定删除这条通知？")) {
      noticeStore.delete(id);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <TeacherNav>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">通知管理</h1>
            <p className="text-slate-500 mt-1">发布班级通知和作业，家长可在家长端查看</p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> 发布通知
          </button>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      n.type === "notice" ? "bg-blue-50" : "bg-purple-50"
                    }`}>
                      {n.type === "notice" ? (
                        <Megaphone className="w-4 h-4 text-blue-500" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          n.type === "notice" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        }`}>
                          {n.type === "notice" ? "通知" : "作业"}
                        </span>
                        <span className="text-xs text-slate-400">{relativeTime(n.createdAt)}</span>
                      </div>
                      {n.title && <h3 className="font-medium text-slate-900 mt-1.5">{n.title}</h3>}
                      <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 弹窗 */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">发布通知</h3>
              <button onClick={() => setShowDialog(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">类型</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, type: "notice" })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      form.type === "notice" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200"
                    }`}
                  >
                    📢 通知
                  </button>
                  <button
                    onClick={() => setForm({ ...form, type: "homework" })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      form.type === "homework" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200"
                    }`}
                  >
                    📚 作业
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="通知标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">内容</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="通知内容..."
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 text-sm"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherNav>
  );
}
