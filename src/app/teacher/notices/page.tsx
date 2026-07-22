"use client";

import { useEffect, useState, useCallback } from "react";
import { TeacherNav } from "@/components/teacher-nav";
import { noticeStore, studentStore } from "@/lib/store";
import type { Notice } from "@/lib/types";
import { Megaphone, BookOpen, Plus, Trash2, X, Send, Phone, Check, Copy } from "lucide-react";
import { relativeTime } from "@/lib/utils";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ type: "notice" as "notice" | "homework", title: "", content: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  // 短信群发
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [smsContent, setSmsContent] = useState("");
  const [smsStudents, setSmsStudents] = useState<Set<string>>(new Set());
  const [smsSelectAll, setSmsSelectAll] = useState(false);
  const [smsSent, setSmsSent] = useState<string[]>([]);

  const allStudents = studentStore.getAll().filter((s) => s.isActive);

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

  // ========== 短信功能 ==========
  const toggleSmsStudent = (studentId: string) => {
    const next = new Set(smsStudents);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setSmsStudents(next);
  };

  const toggleSelectAll = () => {
    if (smsSelectAll) {
      setSmsStudents(new Set());
    } else {
      setSmsStudents(new Set(allStudents.map((s) => s.id)));
    }
    setSmsSelectAll(!smsSelectAll);
  };

  const handleSmsSend = () => {
    if (!smsContent.trim()) {
      alert("请输入短信内容");
      return;
    }
    if (smsStudents.size === 0) {
      alert("请选择要发送的学生家长");
      return;
    }

    const selected = allStudents.filter((s) => smsStudents.has(s.id));
    setSmsSent(selected.map((s) => s.name));

    // 逐个打开短信链接（手机上会逐个弹出短信应用）
    // 每条短信开头加上"xxx家长："
    selected.forEach((stu, i) => {
      setTimeout(() => {
        const fullContent = `${stu.name}家长：${smsContent.trim()}`;
        const body = encodeURIComponent(fullContent);
        window.open(`sms:${stu.parentPhone}?body=${body}`, "_blank");
      }, i * 600);
    });

    // 3秒后清空发送状态
    setTimeout(() => {
      setSmsSent([]);
      setSmsStudents(new Set());
      setSmsSelectAll(false);
      setSmsContent("");
      setShowSmsDialog(false);
    }, selected.length * 600 + 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(smsContent.trim()).then(() => {
      alert("短信内容已复制到剪贴板");
    });
  };

  const selectedPhones = allStudents
    .filter((s) => smsStudents.has(s.id))
    .map((s) => `${s.name}: ${s.parentPhone}`);

  return (
    <TeacherNav>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">通知管理</h1>
            <p className="text-slate-500 mt-1">发布班级通知和作业，家长可在家长端查看</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSmsContent("");
                setSmsStudents(new Set());
                setSmsSelectAll(false);
                setSmsSent([]);
                setShowSmsDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-medium"
            >
              <Send className="w-4 h-4" /> 群发短信
            </button>
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> 发布通知
            </button>
          </div>
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

      {/* 发布通知弹窗 */}
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
                    通知
                  </button>
                  <button
                    onClick={() => setForm({ ...form, type: "homework" })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      form.type === "homework" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200"
                    }`}
                  >
                    作业
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

      {/* 短信群发弹窗 */}
      {showSmsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSmsDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900">群发短信</h3>
              </div>
              <button onClick={() => setShowSmsDialog(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* 短信内容 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">短信内容</label>
                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600"
                  >
                    <Copy className="w-3 h-3" /> 复制内容
                  </button>
                </div>
                <textarea
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="输入短信内容，如：各位家长好，明天下午3点开家长会，请准时参加。"
                />
                <p className="text-xs text-slate-400 mt-1">
                  短信将逐个发送，请留意手机上的短信应用。
                </p>
              </div>

              {/* 选择学生 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    选择家长（{smsStudents.size}/{allStudents.length}）
                  </label>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    {smsSelectAll ? "取消全选" : "全选"}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {allStudents.map((stu) => (
                    <label
                      key={stu.id}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={smsStudents.has(stu.id)}
                          onChange={() => toggleSmsStudent(stu.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-800">{stu.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{stu.parentName} · {stu.parentPhone}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 发送状态 */}
              {smsSent.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> 正在发送...
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    已发送给：{smsSent.join("、")}
                  </p>
                  <p className="text-xs text-green-500 mt-0.5">
                    请查看手机短信应用，逐一确认发送。
                  </p>
                </div>
              )}

              {/* 选中的家长电话列表 */}
              {smsStudents.size > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-2">
                    已选 {smsStudents.size} 人，可点击电话单独发送：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allStudents
                      .filter((s) => smsStudents.has(s.id))
                      .map((stu) => (
                        <a
                          key={stu.id}
                          href={`sms:${stu.parentPhone}?body=${encodeURIComponent(stu.name + "家长：" + (smsContent.trim() || ""))}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                        >
                          <Phone className="w-3 h-3" />
                          {stu.name}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部操作 */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl shrink-0">
              <p className="text-xs text-slate-400">
                手机端点击发送将逐个打开短信应用
              </p>
              <button
                onClick={handleSmsSend}
                disabled={smsStudents.size === 0 || !smsContent.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                发送短信（{smsStudents.size}人）
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherNav>
  );
}
