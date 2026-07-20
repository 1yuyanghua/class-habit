"use client";

import { useEffect, useState } from "react";
import { TeacherNav } from "@/components/teacher-nav";
import { studentStore } from "@/lib/store";
import { getStudentDailySummary } from "@/lib/queries";
import { getToday } from "@/lib/queries";
import type { Student, Gender } from "@/lib/types";
import { Search, Star, Phone, X, User, Calendar, School, MapPin, Award, Plus, Trash2, Edit3, Save } from "lucide-react";

const examSubjects = [
  { key: "totalScore", label: "投档总分" },
  { key: "chinese", label: "语文" },
  { key: "math", label: "数学" },
  { key: "english", label: "英语" },
  { key: "physics", label: "物理" },
  { key: "chemistry", label: "化学" },
  { key: "politics", label: "道法" },
  { key: "pe", label: "体育" },
  { key: "history", label: "历史" },
  { key: "geography", label: "地理" },
  { key: "biology", label: "生物" },
] as const;

// 可编辑字段列表
const editableFields = [
  { key: "studentNo", label: "学号", type: "text" },
  { key: "studentCode", label: "学籍号", type: "text" },
  { key: "name", label: "姓名", type: "text" },
  { key: "gender", label: "性别", type: "select", options: ["男", "女"] },
  { key: "seatNo", label: "座位号", type: "number" },
  { key: "birthDate", label: "出生日期", type: "date" },
  { key: "boarding", label: "住宿情况", type: "select", options: ["住宿生", "走读生"] },
  { key: "parentName", label: "家长姓名", type: "text" },
  { key: "parentPhone", label: "家长电话", type: "tel" },
  { key: "householdType", label: "户口类型", type: "select", options: ["农业", "非农业", "其他"] },
  { key: "residence", label: "户籍所在地", type: "text" },
  { key: "address", label: "通讯地址", type: "text" },
  { key: "originSchool", label: "毕业学校", type: "text" },
] as const;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filterBoarding, setFilterBoarding] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [newStudent, setNewStudent] = useState<Record<string, string>>({
    studentNo: "", studentCode: "", name: "", gender: "男", seatNo: "",
    parentName: "", parentPhone: "", birthDate: "", originSchool: "",
    boarding: "住宿生", residence: "", address: "", householdType: "非农业",
    totalScore: "", chinese: "", math: "", english: "", physics: "",
    chemistry: "", politics: "", pe: "", history: "", geography: "", biology: "",
  });

  useEffect(() => {
    setStudents(studentStore.getAll());
  }, [refreshKey]);

  const today = getToday();

  const filtered = students.filter((s) => {
    const matchSearch = !search || s.name.includes(search) || s.studentNo.includes(search);
    const matchBoarding = !filterBoarding || s.boarding === filterBoarding;
    return matchSearch && matchBoarding;
  });

  const handleDelete = (e: React.MouseEvent, stu: Student) => {
    e.stopPropagation();
    if (confirm(`确定删除学生 "${stu.name}" 吗？相关评分记录也会一并删除。`)) {
      studentStore.delete(stu.id);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleStartEdit = (stu: Student) => {
    const data: Record<string, string> = {};
    editableFields.forEach((f) => {
      const val = (stu as Record<string, unknown>)[f.key];
      data[f.key] = val !== null && val !== undefined ? String(val) : "";
    });
    setEditData(data);
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selectedStudent) return;
    const updates: Partial<Student> = {};
    editableFields.forEach((f) => {
      const val = editData[f.key];
      if (f.type === "number") {
        (updates as Record<string, unknown>)[f.key] = val ? parseInt(val) || null : null;
      } else {
        (updates as Record<string, unknown>)[f.key] = val || "";
      }
    });
    // 如果家长电话改了，更新密码
    if (updates.parentPhone && updates.parentPhone.length >= 4) {
      updates.parentPassword = (updates.parentPhone as string).slice(-4);
    }
    studentStore.update(selectedStudent.id, updates);
    setEditMode(false);
    setRefreshKey((k) => k + 1);
    // 更新弹窗显示的数据
    const updated = studentStore.getById(selectedStudent.id);
    if (updated) setSelectedStudent(updated);
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.studentNo.trim()) {
      alert("请填写姓名和学号");
      return;
    }
    const phone = newStudent.parentPhone.trim();
    studentStore.create({
      studentNo: newStudent.studentNo.trim(),
      studentCode: newStudent.studentCode.trim(),
      name: newStudent.name.trim(),
      gender: newStudent.gender as Gender,
      seatNo: newStudent.seatNo ? parseInt(newStudent.seatNo) || null : null,
      parentName: newStudent.parentName.trim(),
      parentPhone: phone,
      parentPassword: phone.length >= 4 ? phone.slice(-4) : "1234",
      birthDate: newStudent.birthDate,
      originSchool: newStudent.originSchool.trim(),
      boarding: newStudent.boarding,
      residence: newStudent.residence.trim(),
      address: newStudent.address.trim(),
      householdType: newStudent.householdType,
      totalScore: newStudent.totalScore.trim(),
      chinese: newStudent.chinese.trim(),
      math: newStudent.math.trim(),
      english: newStudent.english.trim(),
      physics: newStudent.physics.trim(),
      chemistry: newStudent.chemistry.trim(),
      politics: newStudent.politics.trim(),
      pe: newStudent.pe.trim(),
      history: newStudent.history.trim(),
      geography: newStudent.geography.trim(),
      biology: newStudent.biology.trim(),
      isActive: true,
    });
    setShowAddDialog(false);
    setRefreshKey((k) => k + 1);
  };

  // 渲染可编辑输入框
  const renderField = (field: typeof editableFields[number], value: string, onChange: (val: string) => void) => {
    if (field.type === "select") {
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    );
  };

  return (
    <TeacherNav>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">学生管理</h1>
            <p className="text-slate-500 mt-1">共 {students.length} 名学生 · 点击学生查看/编辑完整档案</p>
          </div>
          <button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> 新增学生
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索姓名、学号..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filterBoarding} onChange={(e) => setFilterBoarding(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">全部</option>
            <option value="住宿生">住宿生</option>
            <option value="走读生">走读生</option>
          </select>
        </div>

        {/* 桌面表格 */}
        <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">学号</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">姓名</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">座位</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">住宿</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">家长</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">今日评分</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">中考</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stu) => {
                const summary = getStudentDailySummary(stu.id, today);
                return (
                  <tr key={stu.id} onClick={() => { setSelectedStudent(stu); setEditMode(false); }} className="border-b border-slate-100 hover:bg-indigo-50/50 cursor-pointer group">
                    <td className="px-4 py-3 text-sm text-slate-600">{stu.studentNo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{stu.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{stu.seatNo}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${stu.boarding === "住宿生" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>{stu.boarding}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-600"><div>{stu.parentName}</div><div className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{stu.parentPhone}</div></td>
                    <td className="px-4 py-3">{summary ? <div className="flex items-center gap-1"><span className="text-sm font-medium text-amber-500">{summary.avgRating}</span><Star className="w-3 h-3 text-amber-400 fill-amber-400" /></div> : <span className="text-xs text-slate-300">未评</span>}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{stu.totalScore || "—"}</td>
                    <td className="px-4 py-3 text-center"><button onClick={(e) => handleDelete(e, stu)} className="p-1.5 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 移动端卡片 */}
        <div className="lg:hidden space-y-3">
          {filtered.map((stu) => {
            const summary = getStudentDailySummary(stu.id, today);
            return (
              <div key={stu.id} className="relative bg-white rounded-xl border border-slate-200 p-4">
                <button onClick={(e) => handleDelete(e, stu)} className="absolute top-2 right-2 p-2 rounded text-slate-300 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => { setSelectedStudent(stu); setEditMode(false); }} className="w-full text-left pr-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${stu.gender === "男" ? "bg-blue-500" : "bg-pink-500"}`}>{stu.name[0]}</div>
                      <div><p className="font-medium text-slate-900">{stu.name}</p><p className="text-xs text-slate-400">学号 {stu.studentNo} · {stu.gender} · 座位 {stu.seatNo}</p></div>
                    </div>
                    <div className="text-right">{summary ? <div className="flex items-center gap-1 justify-end"><span className="text-sm font-medium text-amber-500">{summary.avgRating}</span><Star className="w-4 h-4 text-amber-400 fill-amber-400" /></div> : <span className="text-xs text-slate-300">未评</span>}<p className="text-xs text-slate-400 mt-1">中考 {stu.totalScore || "—"}</p></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500"><span className={`px-2 py-0.5 rounded-full ${stu.boarding === "住宿生" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>{stu.boarding}</span><span>{stu.parentName} · {stu.parentPhone}</span></div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 学生档案弹窗 - 查看/编辑 */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setSelectedStudent(null); setEditMode(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium ${selectedStudent.gender === "男" ? "bg-blue-500" : "bg-pink-500"}`}>{selectedStudent.name[0]}</div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-500">学号 {selectedStudent.studentNo} · {selectedStudent.gender} · 座位 {selectedStudent.seatNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <button onClick={() => setEditMode(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">取消</button>
                    <button onClick={handleSaveEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"><Save className="w-4 h-4" /> 保存</button>
                  </>
                ) : (
                  <button onClick={() => handleStartEdit(selectedStudent)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-sm hover:bg-indigo-50"><Edit3 className="w-4 h-4" /> 编辑</button>
                )}
                <button onClick={() => { setSelectedStudent(null); setEditMode(false); }} className="p-2 rounded-lg hover:bg-white/60"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {editMode ? (
                /* 编辑模式 */
                <>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5"><User className="w-4 h-4 text-indigo-500" /> 基本信息</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {editableFields.slice(0, 7).map((f) => (
                        <div key={f.key}>
                          <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                          {renderField(f, editData[f.key] || "", (val) => setEditData({ ...editData, [f.key]: val }))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5"><Phone className="w-4 h-4 text-green-500" /> 家长与户籍</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {editableFields.slice(7).map((f) => (
                        <div key={f.key} className={f.key === "address" || f.key === "residence" || f.key === "originSchool" ? "col-span-2" : ""}>
                          <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                          {renderField(f, editData[f.key] || "", (val) => setEditData({ ...editData, [f.key]: val }))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" /> 中考成绩</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {examSubjects.map((subj) => (
                        <div key={subj.key}>
                          <label className="block text-xs text-slate-500 mb-1">{subj.label}</label>
                          <input value={editData[subj.key] || ""} onChange={(e) => setEditData({ ...editData, [subj.key]: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* 查看模式 */
                <>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5"><User className="w-4 h-4 text-indigo-500" /> 基本信息</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">学号</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.studentNo}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">学籍号</p><p className="text-sm text-slate-900 mt-0.5 break-all">{selectedStudent.studentCode || "—"}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">性别</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.gender}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> 出生日期</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.birthDate || "—"}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">座位号</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.seatNo}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">住宿情况</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.boarding || "—"}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">户口类型</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.householdType || "—"}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">户籍所在地</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.residence || "—"}</p></div>
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400 flex items-center gap-1"><School className="w-3 h-3" /> 毕业学校</p><p className="text-sm text-slate-900 mt-0.5 text-xs leading-relaxed">{selectedStudent.originSchool || "—"}</p></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5"><Phone className="w-4 h-4 text-green-500" /> 家长联系方式</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-slate-400">家长姓名</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.parentName || "—"}</p></div>
                      <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-slate-400">联系电话</p><p className="text-sm text-slate-900 mt-0.5">{selectedStudent.parentPhone || "—"}</p></div>
                    </div>
                  </div>
                  {selectedStudent.address && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500" /> 通讯地址</h3>
                      <div className="bg-orange-50 rounded-lg p-3"><p className="text-sm text-slate-900">{selectedStudent.address}</p></div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" /> 中考成绩</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {examSubjects.map((subj) => {
                        const val = (selectedStudent as Record<string, string>)[subj.key];
                        const isTotal = subj.key === "totalScore";
                        return (
                          <div key={subj.key} className={`rounded-lg p-3 text-center ${isTotal ? "bg-amber-100 border-2 border-amber-300" : "bg-slate-50"}`}>
                            <p className="text-xs text-slate-400">{subj.label}</p>
                            <p className={`text-sm font-bold mt-0.5 ${isTotal ? "text-amber-700 text-lg" : "text-slate-900"}`}>{val || "—"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 新增学生弹窗 */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900 text-lg">新增学生</h2>
              <button onClick={() => setShowAddDialog(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-500 mb-1">学号 *</label><input value={newStudent.studentNo} onChange={(e) => setNewStudent({ ...newStudent, studentNo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">学籍号</label><input value={newStudent.studentCode} onChange={(e) => setNewStudent({ ...newStudent, studentCode: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">姓名 *</label><input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">性别</label><select value={newStudent.gender} onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"><option value="男">男</option><option value="女">女</option></select></div>
                <div><label className="block text-xs text-slate-500 mb-1">座位号</label><input value={newStudent.seatNo} onChange={(e) => setNewStudent({ ...newStudent, seatNo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">住宿</label><select value={newStudent.boarding} onChange={(e) => setNewStudent({ ...newStudent, boarding: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"><option value="住宿生">住宿生</option><option value="走读生">走读生</option></select></div>
                <div><label className="block text-xs text-slate-500 mb-1">出生日期</label><input type="date" value={newStudent.birthDate} onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">家长姓名</label><input value={newStudent.parentName} onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">家长电话</label><input value={newStudent.parentPhone} onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">户口类型</label><select value={newStudent.householdType} onChange={(e) => setNewStudent({ ...newStudent, householdType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"><option value="农业">农业</option><option value="非农业">非农业</option><option value="其他">其他</option></select></div>
                <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">户籍所在地</label><input value={newStudent.residence} onChange={(e) => setNewStudent({ ...newStudent, residence: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">通讯地址</label><input value={newStudent.address} onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
                <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">毕业学校</label><input value={newStudent.originSchool} onChange={(e) => setNewStudent({ ...newStudent, originSchool: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">中考成绩</h3>
                <div className="grid grid-cols-3 gap-2">
                  {examSubjects.map((subj) => (
                    <div key={subj.key}><label className="block text-xs text-slate-500 mb-1">{subj.label}</label><input value={newStudent[subj.key]} onChange={(e) => setNewStudent({ ...newStudent, [subj.key]: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center" /></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex gap-3">
              <button onClick={() => setShowAddDialog(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium">取消</button>
              <button onClick={handleAddStudent} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">确认添加</button>
            </div>
          </div>
        </div>
      )}
    </TeacherNav>
  );
}
