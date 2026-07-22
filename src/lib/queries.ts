import { studentStore, habitScoreStore, habitItemStore, noticeStore, examStore, examScoreStore } from "./store";
import type { HabitCategory, DailySummary, TrendData, DashboardStats } from "./types";
import { categoryLabels } from "./types";

const CATEGORIES: HabitCategory[] = ["attendance", "study", "life", "morality"];

// 获取今日日期
export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// 单个学生某日汇总
export function getStudentDailySummary(studentId: string, date: string): DailySummary | null {
  const scores = habitScoreStore.getByStudentAndDate(studentId, date);
  if (scores.length === 0) return null;

  const items = habitItemStore.getAll();
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const categoryRatings = {} as Record<HabitCategory, number>;
  const categoryCounts = {} as Record<HabitCategory, number>;
  CATEGORIES.forEach((c) => { categoryRatings[c] = 0; categoryCounts[c] = 0; });

  let totalStars = 0;
  scores.forEach((s) => {
    const item = itemMap.get(s.itemId);
    if (item) {
      categoryRatings[item.category] += s.rating;
      categoryCounts[item.category]++;
      totalStars += s.rating;
    }
  });

  CATEGORIES.forEach((c) => {
    categoryRatings[c] = categoryCounts[c] > 0 ? Math.round((categoryRatings[c] / categoryCounts[c]) * 10) / 10 : 0;
  });

  const avgRating = Math.round((totalStars / scores.length) * 10) / 10;

  return {
    studentId,
    date,
    avgRating,
    categoryRatings,
    totalStars,
  };
}

// 全班某日汇总
export function getClassDailySummaries(date: string): DailySummary[] {
  const students = studentStore.getAll().filter((s) => s.isActive);
  return students
    .map((s) => getStudentDailySummary(s.id, date))
    .filter((s): s is DailySummary => s !== null);
}

// 学生趋势（最近N天）
export function getStudentTrend(studentId: string, days: number = 7): TrendData[] {
  const result: TrendData[] = [];
  const today = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);

    const summary = getStudentDailySummary(studentId, dateStr);
    if (summary) {
      result.push({
        date: dateStr,
        avgRating: summary.avgRating,
        categoryRatings: summary.categoryRatings,
      });
    }
  }

  return result;
}

// 仪表盘统计
export function getDashboardStats(): DashboardStats {
  const students = studentStore.getAll();
  const today = getToday();
  const todaySummaries = getClassDailySummaries(today);

  // 本周平均
  const weekSummaries: DailySummary[] = [];
  const todayDate = new Date();
  for (let d = 6; d >= 0; d--) {
    const date = new Date(todayDate);
    date.setDate(date.getDate() - d);
    weekSummaries.push(...getClassDailySummaries(date.toISOString().slice(0, 10)));
  }

  const todayAvg = todaySummaries.length > 0
    ? Math.round((todaySummaries.reduce((sum, s) => sum + s.avgRating, 0) / todaySummaries.length) * 10) / 10
    : 0;

  const weekAvg = weekSummaries.length > 0
    ? Math.round((weekSummaries.reduce((sum, s) => sum + s.avgRating, 0) / weekSummaries.length) * 10) / 10
    : 0;

  // 周排名前5
  const studentWeekAvg: Record<string, { sum: number; count: number }> = {};
  weekSummaries.forEach((s) => {
    if (!studentWeekAvg[s.studentId]) studentWeekAvg[s.studentId] = { sum: 0, count: 0 };
    studentWeekAvg[s.studentId].sum += s.avgRating;
    studentWeekAvg[s.studentId].count++;
  });

  const topStudents = Object.entries(studentWeekAvg)
    .map(([studentId, { sum, count }]) => {
      const stu = studentStore.getById(studentId);
      return {
        studentId,
        name: stu?.name || "未知",
        avgRating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
      };
    })
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  const notices = noticeStore.getAll();

  return {
    studentCount: students.filter((s) => s.isActive).length,
    todayRatedCount: todaySummaries.length,
    todayAvgRating: todayAvg,
    weekAvgRating: weekAvg,
    topStudents,
    noticeCount: notices.length,
  };
}

// 某日全班各维度平均
export function getClassCategoryAvg(date: string): Record<HabitCategory, number> {
  const summaries = getClassDailySummaries(date);
  const result = {} as Record<HabitCategory, number>;
  CATEGORIES.forEach((c) => {
    const vals = summaries.map((s) => s.categoryRatings[c]).filter((v) => v > 0);
    result[c] = vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  });
  return result;
}

export { CATEGORIES, categoryLabels };

// ========== 成绩分析 ==========

// 获取某次考试的完整成绩矩阵
export function getExamScoreMatrix(examId: string) {
  const exam = examStore.getById(examId);
  if (!exam) return null;
  const students = studentStore.getAll().filter((s) => s.isActive);
  const scores = examScoreStore.getByExam(examId);

  return {
    exam,
    students,
    scores,
    matrix: Object.fromEntries(
      students.map((stu) => [
        stu.id,
        Object.fromEntries(
          exam.subjects.map((subj) => [
            subj,
            scores.find((s) => s.studentId === stu.id && s.subject === subj)?.score ?? null,
          ] as const)
        ),
      ])
    ),
  };
}

// 某次考试班级均分
export function getExamClassAvg(examId: string) {
  const exam = examStore.getById(examId);
  if (!exam) return null;
  const scores = examScoreStore.getByExam(examId);
  const students = studentStore.getAll().filter((s) => s.isActive);

  const result: Record<string, number> = {};
  exam.subjects.forEach((subj) => {
    const subjScores = scores.filter((s) => s.subject === subj);
    result[subj] = subjScores.length > 0
      ? Math.round(subjScores.reduce((sum, s) => sum + s.score, 0) / subjScores.length * 10) / 10
      : 0;
  });

  const totalScores = students.map((stu) => {
    return exam.subjects.reduce((sum, subj) => {
      const s = scores.find((sc) => sc.studentId === stu.id && sc.subject === subj);
      return sum + (s?.score ?? 0);
    }, 0);
  }).filter((t) => t > 0);
  result["total"] = totalScores.length > 0
    ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length * 10) / 10
    : 0;

  return result;
}

// 某次考试最高分
export function getExamMaxScore(examId: string) {
  const exam = examStore.getById(examId);
  if (!exam) return null;
  const scores = examScoreStore.getByExam(examId);
  const students = studentStore.getAll().filter((s) => s.isActive);

  let maxScore = 0;
  students.forEach((stu) => {
    const total = exam.subjects.reduce((sum, subj) => {
      const s = scores.find((sc) => sc.studentId === stu.id && sc.subject === subj);
      return sum + (s?.score ?? 0);
    }, 0);
    if (total > maxScore) maxScore = total;
  });

  const scoredCount = students.filter((stu) => {
    return exam.subjects.some((subj) =>
      scores.find((sc) => sc.studentId === stu.id && sc.subject === subj)
    );
  }).length;

  return { maxScore, scoredCount };
}

// 某次考试学生排名
export function getExamRanking(examId: string) {
  const exam = examStore.getById(examId);
  if (!exam) return [];
  const scores = examScoreStore.getByExam(examId);
  const students = studentStore.getAll().filter((s) => s.isActive);

  const ranking = students.map((stu) => {
    const totalScore = exam.subjects.reduce((sum, subj) => {
      const s = scores.find((sc) => sc.studentId === stu.id && sc.subject === subj);
      return sum + (s?.score ?? 0);
    }, 0);
    return { studentId: stu.id, name: stu.name, studentNo: stu.studentNo, totalScore };
  }).sort((a, b) => b.totalScore - a.totalScore);

  return ranking.map((r, idx) => ({ ...r, rank: idx + 1 }));
}

// 分数段分布
export function getScoreDistribution(examId: string, subject: string, step: number = 10) {
  const scores = examScoreStore.getByExam(examId).filter((s) => s.subject === subject);
  if (scores.length === 0) return [];
  const maxScore = Math.max(...scores.map((s) => s.score));
  const ranges: { label: string; count: number }[] = [];

  for (let low = 0; low <= maxScore; low += step) {
    const high = low + step;
    const count = scores.filter((s) => s.score >= low && s.score < high).length;
    ranges.push({ label: `${low}-${high}`, count });
  }
  return ranges;
}

// 某学生某科目历次成绩趋势
export function getStudentSubjectTrend(studentId: string, subject: string) {
  const exams = examStore.getAll();
  const scores = examScoreStore.getByStudent(studentId);

  return exams
    .filter((e) => e.subjects.includes(subject))
    .map((e) => {
      const s = scores.find((sc) => sc.examId === e.id && sc.subject === subject);
      return { examId: e.id, examName: e.name, date: e.date, score: s?.score ?? null };
    })
    .filter((t) => t.score !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 某学生历次考试总分趋势
export function getStudentTotalTrend(studentId: string) {
  const exams = examStore.getAll();
  const scores = examScoreStore.getByStudent(studentId);

  return exams.map((e) => {
    const totalScore = e.subjects.reduce((sum, subj) => {
      const s = scores.find((sc) => sc.examId === e.id && sc.subject === subj);
      return sum + (s?.score ?? 0);
    }, 0);
    return { examId: e.id, examName: e.name, date: e.date, totalScore };
  }).filter((t) => t.totalScore > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
