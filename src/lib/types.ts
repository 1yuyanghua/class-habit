// 习惯养成管理系统 - 类型定义

export type Gender = "男" | "女";

// 四大习惯维度
export type HabitCategory = "attendance" | "study" | "life" | "morality";

// 习惯评价项
export interface HabitItem {
  id: string;
  category: HabitCategory;
  name: string;           // 如"按时到校"
  description: string;
  sortOrder: number;
}

// 每日习惯评分记录
export interface HabitScore {
  id: string;
  date: string;            // YYYY-MM-DD
  studentId: string;
  itemId: string;          // 习惯项ID
  rating: number;          // 1-5 星
  remark: string;          // 备注（可选）
  recordedAt: string;
}

// 班级
export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  term: string;
  teacherName: string;
  teacherPhone: string;    // 班主任手机号（用于登录）
  teacherPassword: string; // 简单密码
  createdAt: string;
}

// 学生
export interface Student {
  id: string;
  studentNo: string;          // 学号（原注册编号）
  studentCode?: string;       // 学籍号
  name: string;
  gender: Gender;
  seatNo: number | null;      // 座位号
  parentName: string;
  parentPhone: string;
  parentPassword: string;     // 家长登录密码
  birthDate?: string;
  originSchool?: string;
  boarding?: string;          // 住宿生/走读生
  residence?: string;         // 户籍所在地
  address?: string;           // 收件人地址
  householdType?: string;     // 农业/非农业
  // 中考成绩
  totalScore?: string;        // 投档总分
  chinese?: string;
  math?: string;
  english?: string;
  physics?: string;
  chemistry?: string;
  politics?: string;          // 道德与法治
  pe?: string;                // 体育
  history?: string;
  geography?: string;
  biology?: string;
  isActive: boolean;
  createdAt: string;
}

// 通知
export interface Notice {
  id: string;
  type: "notice" | "homework";
  title: string;
  content: string;
  createdAt: string;
}

// 日汇总统计
export interface DailySummary {
  studentId: string;
  date: string;
  avgRating: number;        // 当日平均星级
  categoryRatings: Record<HabitCategory, number>; // 各维度平均星级
  totalStars: number;       // 当日总星数
}

// 周/月趋势
export interface TrendData {
  date: string;
  avgRating: number;
  categoryRatings: Record<HabitCategory, number>;
}

// 仪表盘统计
export interface DashboardStats {
  studentCount: number;
  todayRatedCount: number;
  todayAvgRating: number;
  weekAvgRating: number;
  topStudents: { studentId: string; name: string; avgRating: number }[];
  noticeCount: number;
}

export const categoryLabels: Record<HabitCategory, { label: string; icon: string; color: string }> = {
  attendance: { label: "考勤与纪律", icon: "📋", color: "text-blue-600 bg-blue-50 border-blue-200" },
  study: { label: "学习习惯", icon: "📚", color: "text-green-600 bg-green-50 border-green-200" },
  life: { label: "生活与卫生", icon: "🏠", color: "text-amber-600 bg-amber-50 border-amber-200" },
  morality: { label: "品德与行为", icon: "🤝", color: "text-purple-600 bg-purple-50 border-purple-200" },
};
