"use client";

import { useEffect, useState } from "react";
import { TeacherNav } from "@/components/teacher-nav";
import { examStore, examScoreStore, studentStore } from "@/lib/store";
import {
  getExamScoreMatrix,
  getExamClassAvg,
  getExamRanking,
  getScoreDistribution,
  getExamMaxScore,
} from "@/lib/queries";
import { examTypeLabels } from "@/lib/types";
import type { Exam, ExamType } from "@/lib/types";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  ChevronLeft,
  BarChart3,
  Table,
  Search,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ViewMode = "list" | "detail";
type DetailTab = "entry" | "analysis";

export default function GradesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [exams, setExams] = useState<Exam[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("entry");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<ExamType | "all">("all");

  // 弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Exam>>({});

  // 新建考试表单
  const [newExamName, setNewExamName] = useState("");
  const [newExamType, setNewExamType] = useState<ExamType>("monthly");
  const [newExamDate, setNewExamDate] = useState("");
  const [newExamSubjects, setNewExamSubjects] = useState<string[]>([]);

  useEffect(() => {
    setExams(examStore.getAll());
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  // 筛选
  const filteredExams = exams.filter((e) => {
    if (filterType !== "all" && e.type !== filterType) return false;
    if (searchText && !e.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  // 获取考试概览信息
  const getExamOverview = (exam: Exam) => {
    const matrix = getExamScoreMatrix(exam.id);
    const scored = matrix?.students.filter((s) =>
      exam.subjects.some((subj) => matrix.matrix[s.id]?.[subj] !== null)
    ).length || 0;
    const avgData = getExamClassAvg(exam.id);
    const subjectLabels = exam.subjects.join("、");
    return { scored, avgData, subjectLabels };
  };

  // ========== 考试 CRUD ==========
  const handleCreate = () => {
    if (!newExamName.trim() || !newExamDate || newExamSubjects.length === 0) {
      alert("请填写完整的考试信息，至少添加一个科目");
      return;
    }
    examStore.create({
      name: newExamName.trim(),
      type: newExamType,
      date: newExamDate,
      subjects: newExamSubjects,
    });
    setShowCreateDialog(false);
    resetCreateForm();
    refresh();
  };

  const resetCreateForm = () => {
    setNewExamName("");
    setNewExamType("monthly");
    setNewExamDate("");
    setNewExamSubjects([]);
  };

  const handleEdit = () => {
    if (!editForm.id || !editForm.name?.trim()) return;
    examStore.update(editForm.id, {
      name: editForm.name.trim(),
      type: editForm.type,
      date: editForm.date,
      subjects: editForm.subjects,
    });
    setShowEditDialog(false);
    refresh();
  };

  const handleDelete = (examId: string, examName: string) => {
    if (confirm(`确定删除"${examName}"及其所有成绩记录？此操作不可恢复！`)) {
      examStore.delete(examId);
      if (selectedExamId === examId) {
        setSelectedExamId(null);
        setViewMode("list");
      }
      refresh();
    }
  };

  const openEditDialog = (exam: Exam) => {
    setEditForm({ ...exam });
    setShowEditDialog(true);
  };

  // ========== 成绩详情视图 ==========
  const selectedExam = selectedExamId ? examStore.getById(selectedExamId) : null;
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    subject: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const matrix = selectedExamId ? getExamScoreMatrix(selectedExamId) : null;
  const classAvg = selectedExamId ? getExamClassAvg(selectedExamId) : null;
  const maxScoreData = selectedExamId ? getExamMaxScore(selectedExamId) : null;
  const ranking = selectedExamId ? getExamRanking(selectedExamId) : null;
  const [analysisSubject, setAnalysisSubject] = useState("");

  const startEditCell = (studentId: string, subject: string, currentScore: number | null) => {
    setEditingCell({ studentId, subject });
    setEditValue(currentScore !== null ? String(currentScore) : "");
  };

  const saveCell = () => {
    if (!editingCell || !selectedExamId) return;
    const val = Number(editValue);
    if (!isNaN(val) && val >= 0) {
      examScoreStore.upsert(selectedExamId, editingCell.studentId, editingCell.subject, val);
    }
    setEditingCell(null);
    refresh();
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveCell();
    if (e.key === "Escape") setEditingCell(null);
  };

  // ========== Excel 导入导出 ==========
  const handleExport = () => {
    if (!matrix) return;
    import("xlsx").then((XLSX) => {
      const headers = ["学号", "姓名", ...matrix.exam.subjects, "总分"];
      const rows = matrix.students.map((stu) => {
        const rowScores = matrix.matrix[stu.id];
        const subjectScores = matrix.exam.subjects.map((s) => rowScores[s] ?? "");
        const total = subjectScores.reduce((sum: number, v) => sum + (Number(v) || 0), 0);
        return [stu.studentNo, stu.name, ...subjectScores, total || ""];
      });
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "成绩");
      XLSX.writeFile(wb, `${matrix.exam.name}_成绩.xlsx`);
    });
  };

  const handleDownloadTemplate = () => {
    if (!selectedExam) return;
    import("xlsx").then((XLSX) => {
      const students = studentStore.getAll().filter((s) => s.isActive);
      const headers = ["学号", "姓名", ...selectedExam.subjects];
      const rows = students.map((stu) => [stu.studentNo, stu.name, ...selectedExam.subjects.map(() => "")]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "成绩");
      XLSX.writeFile(wb, `${selectedExam.name}_导入模板.xlsx`);
    });
  };

  const [importPreview, setImportPreview] = useState<{
    matched: { studentNo: string; name: string; scores: Record<string, number> }[];
    unmatched: { studentNo: string; name: string }[];
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExam) return;

    import("xlsx").then((XLSX) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, string | number>[];
        const students = studentStore.getAll();
        const matched: { studentNo: string; name: string; scores: Record<string, number> }[] = [];
        const unmatched: { studentNo: string; name: string }[] = [];

        data.forEach((row) => {
          const studentNo = String(row["学号"] || "").trim();
          const stu = students.find((s) => s.studentNo === studentNo);
          if (!stu) {
            unmatched.push({ studentNo, name: String(row["姓名"] || "") });
            return;
          }
          const scores: Record<string, number> = {};
          selectedExam.subjects.forEach((subj) => {
            const raw = row[subj];
            if (raw !== undefined && raw !== null && raw !== "") {
              const num = Number(raw);
              if (!isNaN(num)) scores[subj] = num;
            }
          });
          if (Object.keys(scores).length > 0) {
            matched.push({ studentNo: stu.studentNo, name: stu.name, scores });
          }
        });
        setImportPreview({ matched, unmatched });
      };
      reader.readAsBinaryString(file);
    });
  };

  const handleConfirmImport = () => {
    if (!importPreview || !selectedExamId) return;
    const records = importPreview.matched.flatMap((m) => {
      const stu = studentStore.getAll().find((s) => s.studentNo === m.studentNo);
      if (!stu) return [];
      return Object.entries(m.scores).map(([subj, score]) => ({
        examId: selectedExamId,
        studentId: stu.id,
        subject: subj,
        score,
      }));
    });
    examScoreStore.bulkUpsert(records);
    setShowImportDialog(false);
    setImportPreview(null);
    refresh();
  };

  // ========== 列表视图 ==========
  if (viewMode === "list") {
    return (
      <TeacherNav>
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">成绩管理</h1>
              <p className="text-slate-500 text-sm mt-0.5">共 {exams.length} 次考试记录</p>
            </div>
            <button
              onClick={() => { resetCreateForm(); setShowCreateDialog(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> 新增考试
            </button>
          </div>

          {/* 搜索筛选 */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索考试名称..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ExamType | "all")}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部类型</option>
              {Object.entries(examTypeLabels).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>

          {/* 考试列表 */}
          {filteredExams.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">暂无考试记录</p>
              <button
                onClick={() => { resetCreateForm(); setShowCreateDialog(true); }}
                className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                点击新增第一次考试
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExams.map((exam) => {
                const overview = getExamOverview(exam);
                const typeInfo = examTypeLabels[exam.type];
                return (
                  <div key={exam.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border", typeInfo.color)}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                          <h3 className="font-bold text-slate-900">{exam.name}</h3>
                        </div>
                        <p className="text-sm text-slate-500">
                          {exam.date} · {exam.subjects.length}科（{overview.subjectLabels}）· {overview.scored}/{studentStore.getAll().filter((s) => s.isActive).length} 人已录入
                          {overview.avgData?.total ? <span className="text-indigo-600 font-medium"> · 班级均分 {overview.avgData.total}</span> : null}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => { setSelectedExamId(exam.id); setViewMode("detail"); setDetailTab("entry"); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        >
                          查看详情
                        </button>
                        <button onClick={() => openEditDialog(exam)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="编辑考试">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exam.id, exam.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="删除考试">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 新增考试弹窗 */}
          {showCreateDialog && (
            <ExamFormDialog
              title="新增考试"
              name={newExamName}
              onNameChange={setNewExamName}
              type={newExamType}
              onTypeChange={setNewExamType}
              date={newExamDate}
              onDateChange={setNewExamDate}
              subjects={newExamSubjects}
              onSubjectsChange={setNewExamSubjects}
              onSave={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
            />
          )}

          {/* 编辑考试弹窗 */}
          {showEditDialog && (
            <ExamFormDialog
              title="编辑考试"
              name={editForm.name || ""}
              onNameChange={(v) => setEditForm({ ...editForm, name: v })}
              type={(editForm.type as ExamType) || "monthly"}
              onTypeChange={(v) => setEditForm({ ...editForm, type: v as ExamType })}
              date={editForm.date || ""}
              onDateChange={(v) => setEditForm({ ...editForm, date: v })}
              subjects={editForm.subjects || []}
              onSubjectsChange={(subs) => setEditForm({ ...editForm, subjects: subs })}
              onSave={handleEdit}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </div>
      </TeacherNav>
    );
  }

  // ========== 详情视图 ==========
  return (
    <TeacherNav>
      <div className="max-w-full mx-auto space-y-5">
        {/* 顶栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setViewMode("list"); setSelectedExamId(null); }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" /> 返回
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{selectedExam?.name}</h1>
              <p className="text-xs text-slate-500">{selectedExam?.date} · {examTypeLabels[selectedExam?.type || "custom"].label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => selectedExam && openEditDialog(selectedExam)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Pencil className="w-3.5 h-3.5" /> 编辑考试
            </button>
            <button
              onClick={() => { setShowImportDialog(true); setImportPreview(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Upload className="w-3.5 h-3.5" /> 导入Excel
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Download className="w-3.5 h-3.5" /> 导出Excel
            </button>
          </div>
        </div>

        {/* 子Tab */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          {([
            { key: "entry", label: "成绩录入", icon: Table },
            { key: "analysis", label: "成绩分析", icon: BarChart3 },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setDetailTab(tab.key); if (tab.key === "analysis" && selectedExam) setAnalysisSubject(selectedExam.subjects[0] || ""); }}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium",
                detailTab === tab.key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* 成绩录入 Tab */}
        {detailTab === "entry" && matrix && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="sticky left-0 bg-slate-50 px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">学号</th>
                    <th className="sticky left-[60px] bg-slate-50 px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">姓名</th>
                    {matrix.exam.subjects.map((subj) => (
                      <th key={subj} className="px-3 py-2.5 text-center text-xs font-medium text-slate-500 uppercase whitespace-nowrap">{subj}</th>
                    ))}
                    <th className="px-3 py-2.5 text-center text-xs font-medium text-slate-500 uppercase whitespace-nowrap bg-amber-50">总分</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.students.map((stu) => {
                    const rowScores = matrix.matrix[stu.id];
                    const totalScore = matrix.exam.subjects.reduce((sum, subj) => sum + (rowScores[subj] ?? 0), 0);
                    const hasAnyScore = matrix.exam.subjects.some((subj) => rowScores[subj] !== null);
                    return (
                      <tr key={stu.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="sticky left-0 bg-white px-3 py-2 whitespace-nowrap text-slate-500 text-xs">{stu.studentNo}</td>
                        <td className="sticky left-[60px] bg-white px-3 py-2 whitespace-nowrap font-medium text-slate-800">{stu.name}</td>
                        {matrix.exam.subjects.map((subj) => {
                          const isEditing = editingCell?.studentId === stu.id && editingCell?.subject === subj;
                          const score = rowScores[subj];
                          return (
                            <td key={subj} className="px-1 py-1 text-center" onClick={() => startEditCell(stu.id, subj, score)}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={saveCell}
                                  onKeyDown={handleCellKeyDown}
                                  className="w-16 px-1 py-1 text-center text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                  min="0"
                                />
                              ) : (
                                <span className={cn("inline-block w-16 py-1 rounded cursor-pointer text-sm", score !== null ? "text-slate-700 hover:bg-indigo-50" : "text-slate-300 hover:bg-slate-100")}>
                                  {score !== null ? score : "-"}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center font-semibold bg-amber-50/50">{hasAnyScore ? totalScore : "-"}</td>
                      </tr>
                    );
                  })}
                  {/* 均分行 */}
                  {classAvg && (
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td colSpan={2} className="sticky left-0 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">班级均分</td>
                      {matrix.exam.subjects.map((subj) => (
                        <td key={subj} className="px-3 py-2 text-center text-xs font-medium text-indigo-600">{classAvg[subj] || "-"}</td>
                      ))}
                      <td className="px-3 py-2 text-center text-xs font-bold text-indigo-700 bg-amber-50">{classAvg["total"] || "-"}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
              点击单元格即可编辑成绩，按 Enter 保存，Esc 取消。总分自动计算。
            </div>
          </div>
        )}

        {/* 成绩分析 Tab */}
        {detailTab === "analysis" && selectedExam && (
          <div className="space-y-5">
            {/* 统计卡片 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">班级均分</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{classAvg?.total || "-"}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">最高分</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{maxScoreData?.maxScore || "-"}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">已录入人数</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{maxScoreData?.scoredCount || 0}</p>
              </div>
            </div>

            {/* 各科均分对比图 */}
            {classAvg && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-3">各科均分对比</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedExam.subjects.map((subj) => ({ name: subj, score: classAvg[subj] || 0 }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, "auto"]} />
                      <YAxis type="category" dataKey="name" width={50} />
                      <Tooltip formatter={(v: unknown) => [Number(v), "均分"]} />
                      <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 排名列表 */}
            {ranking && ranking.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-3">总分排名</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">排名</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">姓名</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">学号</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">总分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.filter((r) => r.totalScore > 0).map((r) => (
                        <tr key={r.studentId} className={cn("border-b border-slate-100", r.rank <= 3 && "bg-amber-50/50")}>
                          <td className="px-3 py-2">
                            <span className={cn(
                              "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                              r.rank === 1 ? "bg-amber-400 text-white" : r.rank === 2 ? "bg-slate-300 text-white" : r.rank === 3 ? "bg-amber-200 text-amber-800" : "text-slate-500"
                            )}>{r.rank}</span>
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-800">{r.name}</td>
                          <td className="px-3 py-2 text-slate-500 text-xs">{r.studentNo}</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-900">{r.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 分数段分布 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">分数段分布</h3>
                <select
                  value={analysisSubject || selectedExam.subjects[0] || ""}
                  onChange={(e) => setAnalysisSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  {selectedExam.subjects.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getScoreDistribution(selectedExam.id, analysisSubject || selectedExam.subjects[0] || "")}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" fontSize={11} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(v: unknown) => [Number(v), "人数"]} />
                    <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 编辑考试弹窗 */}
        {showEditDialog && (
          <ExamFormDialog
            title="编辑考试"
            name={editForm.name || ""}
            onNameChange={(v) => setEditForm({ ...editForm, name: v })}
            type={(editForm.type as ExamType) || "monthly"}
            onTypeChange={(v) => setEditForm({ ...editForm, type: v as ExamType })}
            date={editForm.date || ""}
            onDateChange={(v) => setEditForm({ ...editForm, date: v })}
            subjects={editForm.subjects || []}
            onSubjectsChange={(subs) => setEditForm({ ...editForm, subjects: subs })}
            onSave={handleEdit}
            onCancel={() => setShowEditDialog(false)}
          />
        )}

        {/* 导入弹窗 */}
        {showImportDialog && selectedExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" onClick={() => setShowImportDialog(false)} />
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">导入成绩 - {selectedExam.name}</h2>
                  <button onClick={() => setShowImportDialog(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700">
                  <p><strong>步骤：</strong>1. 下载模板 → 2. 在Excel中填写成绩 → 3. 上传填好的文件 → 4. 确认导入</p>
                  <p className="mt-1">模板中的科目列名必须与考试科目名完全一致：{selectedExam.subjects.join("、")}</p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium mb-4"
                >
                  <Download className="w-4 h-4" /> 下载导入模板
                </button>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择文件 (.xlsx, .xls)</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                {importPreview && (
                  <>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700">预览（前5条）</p>
                      <p className="text-xs text-green-600">匹配成功 {importPreview.matched.length} 条</p>
                      {importPreview.unmatched.length > 0 && (
                        <p className="text-xs text-red-500">未匹配 {importPreview.unmatched.length} 条（学号不匹配）</p>
                      )}
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg mb-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-2 py-1.5 text-left">学号</th>
                            <th className="px-2 py-1.5 text-left">姓名</th>
                            {selectedExam.subjects.map((subj) => (
                              <th key={subj} className="px-2 py-1.5 text-center">{subj}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.matched.slice(0, 5).map((m, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="px-2 py-1.5">{m.studentNo}</td>
                              <td className="px-2 py-1.5 font-medium">{m.name}</td>
                              {selectedExam.subjects.map((subj) => (
                                <td key={subj} className="px-2 py-1.5 text-center text-indigo-600 font-medium">{m.scores[subj] ?? "-"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowImportDialog(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm">取消</button>
                      <button
                        onClick={handleConfirmImport}
                        disabled={importPreview.matched.length === 0}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                      >
                        确认导入 ({importPreview.matched.length} 条)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherNav>
  );
}

// ========== 考试表单弹窗组件 ==========
function ExamFormDialog({
  title,
  name,
  onNameChange,
  type,
  onTypeChange,
  date,
  onDateChange,
  subjects,
  onSubjectsChange,
  onSave,
  onCancel,
}: {
  title: string;
  name: string;
  onNameChange: (v: string) => void;
  type: ExamType;
  onTypeChange: (v: ExamType) => void;
  date: string;
  onDateChange: (v: string) => void;
  subjects: string[];
  onSubjectsChange: (subs: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [subjectInput, setSubjectInput] = useState("");

  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      onSubjectsChange([...subjects, trimmed]);
      setSubjectInput("");
    }
  };

  const removeSubject = (subj: string) => {
    onSubjectsChange(subjects.filter((s) => s !== subj));
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">考试名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="如：第一次月考"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">考试类型</label>
                <select
                  value={type}
                  onChange={(e) => onTypeChange(e.target.value as ExamType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(examTypeLabels).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">考试日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 自定义科目输入 */}
            <div>
              <label className="block text-xs text-slate-500 mb-2">
                考试科目（输入科目名按回车添加，如：机械制图、电工电子、语文）
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={handleSubjectKeyDown}
                  placeholder="输入科目名..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium shrink-0"
                >
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              {/* 已添加科目标签 */}
              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subjects.map((subj) => (
                    <span
                      key={subj}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200"
                    >
                      {subj}
                      <button
                        type="button"
                        onClick={() => removeSubject(subj)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">尚未添加科目</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm">取消</button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
            >
              <Save className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
