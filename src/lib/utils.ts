import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 生成唯一 ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 格式化日期
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 格式化日期时间
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// 相对时间
export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diff = now - past;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(dateStr);
}

// 行为类型标签
export const behaviorTypeLabels: Record<string, { label: string; color: string; icon: string }> = {
  praise: { label: "表扬", color: "text-green-600 bg-green-50 border-green-200", icon: "👍" },
  violation: { label: "违纪", color: "text-red-600 bg-red-50 border-red-200", icon: "⚠️" },
  score: { label: "积分", color: "text-blue-600 bg-blue-50 border-blue-200", icon: "⭐" },
  attendance: { label: "考勤", color: "text-orange-600 bg-orange-50 border-orange-200", icon: "📅" },
};

// 沟通类型标签
export const communicationTypeLabels: Record<string, { label: string; color: string; icon: string }> = {
  notice: { label: "通知", color: "text-blue-600 bg-blue-50 border-blue-200", icon: "📢" },
  homework: { label: "作业", color: "text-purple-600 bg-purple-50 border-purple-200", icon: "📚" },
  feedback: { label: "反馈", color: "text-orange-600 bg-orange-50 border-orange-200", icon: "💬" },
  log: { label: "记录", color: "text-gray-600 bg-gray-50 border-gray-200", icon: "📝" },
};
