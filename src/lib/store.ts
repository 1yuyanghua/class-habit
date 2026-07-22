import type {
  Student,
  HabitItem,
  HabitScore,
  ClassInfo,
  Notice,
  HabitCategory,
  Exam,
  ExamScore,
} from "./types";
import { generateId } from "./utils";

const CURRENT_VERSION = "6";

const STORAGE_KEYS = {
  classInfo: "hm_class_info",
  students: "hm_students",
  habitItems: "hm_habit_items",
  habitScores: "hm_habit_scores",
  exams: "hm_exams",
  examScores: "hm_exam_scores",
  notices: "hm_notices",
  session: "hm_session",
  initialized: "hm_initialized",
  dataVersion: "hm_data_version",
};

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  if (!data) return [];
  try { return JSON.parse(data) as T[]; } catch { return []; }
}

function readOne<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try { return JSON.parse(data) as T; } catch { return null; }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function writeOne<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ============ 初始化 ============
export function initializeData() {
  if (typeof window === "undefined") return;

  const savedVersion = localStorage.getItem(STORAGE_KEYS.dataVersion);
  const existingStudents = read<Student>(STORAGE_KEYS.students);
  // 检测学生数据是否包含完整字段（以 totalScore 为标志）
  const needStudentUpdate = existingStudents.length > 0 && !existingStudents[0].totalScore;

  if (localStorage.getItem(STORAGE_KEYS.initialized) && savedVersion === CURRENT_VERSION && !needStudentUpdate) {
    return;
  }

  const now = new Date().toISOString();

  const classInfo: ClassInfo = {
    id: "default-class",
    name: "26工业机器人2",
    grade: "2026级",
    term: "2026-2027学年第一学期",
    teacherName: "班主任",
    teacherPhone: "13800000000",
    teacherPassword: "1234",
    createdAt: now,
  };

  // 习惯评价项
  const habitItems: HabitItem[] = [
    // 考勤与纪律
    { id: "hi-1", category: "attendance", name: "按时到校", description: "不迟到不早退", sortOrder: 1 },
    { id: "hi-2", category: "attendance", name: "课堂纪律", description: "上课认真听讲，不交头接耳", sortOrder: 2 },
    { id: "hi-3", category: "attendance", name: "晚自习纪律", description: "晚自习保持安静，专注学习", sortOrder: 3 },
    { id: "hi-14", category: "attendance", name: "手机管理", description: "不违规使用手机，按规定上交保管", sortOrder: 14 },
    // 学习习惯
    { id: "hi-4", category: "study", name: "作业完成", description: "按时完成并提交作业", sortOrder: 4 },
    { id: "hi-5", category: "study", name: "课堂笔记", description: "认真做课堂笔记", sortOrder: 5 },
    { id: "hi-6", category: "study", name: "预习复习", description: "课前预习，课后复习", sortOrder: 6 },
    { id: "hi-7", category: "study", name: "课堂发言", description: "积极回答问题，参与讨论", sortOrder: 7 },
    // 生活与卫生
    { id: "hi-8", category: "life", name: "宿舍内务", description: "宿舍整洁，物品摆放有序", sortOrder: 8 },
    { id: "hi-9", category: "life", name: "个人卫生", description: "仪表整洁，勤洗手勤换衣", sortOrder: 9 },
    { id: "hi-10", category: "life", name: "公共区域", description: "维护教室和公共区域卫生", sortOrder: 10 },
    { id: "hi-15", category: "life", name: "仪容仪表", description: "校服穿戴整齐，发型符合规范，不佩戴饰品", sortOrder: 15 },
    // 品德与行为
    { id: "hi-11", category: "morality", name: "尊师重道", description: "尊重老师，礼貌待人", sortOrder: 11 },
    { id: "hi-12", category: "morality", name: "帮助同学", description: "主动帮助有困难的同学", sortOrder: 12 },
    { id: "hi-13", category: "morality", name: "团队协作", description: "积极参与集体活动", sortOrder: 13 },
  ];

  // 真实学生数据 - 26工业机器人2班
  const students: Student[] = [
    { id: "stu-1", studentNo: "155", studentCode: "G440981201107101152", name: "李璨熙", gender: "男", seatNo: 1, parentName: "黄韵祯", parentPhone: "13420290905", parentPassword: "0905", birthDate: "2011-07-10", originSchool: "中山市火炬高技术产业开发区第二中学", boarding: "住宿生", residence: "广东省中山市火炬开发区中山六路66号建大花园15栋2004房", address: "广东省中山市火炬开发区广联博爵15栋20楼2004号房", householdType: "非农业", totalScore: "451", chinese: "82B", math: "88B+", english: "37C", physics: "87B+", chemistry: "85B+", politics: "77B+", pe: "80A+", history: "72B", geography: "80B+", biology: "78B+", isActive: true, createdAt: now },
    { id: "stu-2", studentNo: "156", studentCode: "G440783201009104538", name: "余政烨", gender: "男", seatNo: 2, parentName: "廖瑞兰", parentPhone: "13078699833", parentPassword: "9833", birthDate: "2010-09-10", originSchool: "中山市石岐中学", boarding: "住宿生", residence: "广东省开平市三埠街道办事处三围冲间村向北5巷1号", address: "广东省中山市石岐区宏基路岐乐花园1期1栋13-16梯403房", householdType: "农业", totalScore: "451", chinese: "85B+", math: "79B+", english: "52B", physics: "78B+", chemistry: "86B+", politics: "88A", pe: "80A+", history: "93A", geography: "96A", biology: "87B+", isActive: true, createdAt: now },
    { id: "stu-3", studentNo: "157", studentCode: "G35058320101220107X", name: "洪梓竣", gender: "男", seatNo: 3, parentName: "洪梓竣", parentPhone: "13531789518", parentPassword: "9518", birthDate: "2010-12-20", originSchool: "中山市北区中学", boarding: "住宿生", residence: "福建省南安市英都镇民山街227号", address: "中山市石岐区白水井正街1号602", householdType: "非农业", totalScore: "447", chinese: "89B+", math: "84B+", english: "58B", physics: "78B+", chemistry: "64B", politics: "80B+", pe: "80A+", history: "71B", geography: "82B+", biology: "87B+", isActive: true, createdAt: now },
    { id: "stu-4", studentNo: "158", studentCode: "G361122201109204849", name: "夏熙窈", gender: "女", seatNo: 4, parentName: "吴燕燕", parentPhone: "13527163637", parentPassword: "3637", birthDate: "2011-09-20", originSchool: "中山市东区远洋学校", boarding: "住宿生", residence: "广东省中山市东区华夏街63号", address: "广东省中山市东区库充糖贝街12号", householdType: "其他", totalScore: "477", chinese: "79B", math: "91B+", english: "57B", physics: "84B+", chemistry: "95A", politics: "83B+", pe: "80A+", history: "86A", geography: "78B+", biology: "77B+", isActive: true, createdAt: now },
    { id: "stu-5", studentNo: "159", studentCode: "G450125201011280317", name: "郑通宇", gender: "男", seatNo: 5, parentName: "郑通宇", parentPhone: "15398870513", parentPassword: "0513", birthDate: "2010-11-28", originSchool: "中山市东区艳阳学校", boarding: "住宿生", residence: "广西上林县巷贤镇高贤社区鹅庄40号0201室", address: "广东省中山市东区白沙湾涌下直街1巷2号", householdType: "农业", totalScore: "457", chinese: "86B+", math: "96A", english: "42B", physics: "83B+", chemistry: "78B+", politics: "76B+", pe: "80A+", history: "67B", geography: "90B+", biology: "70B", isActive: true, createdAt: now },
    { id: "stu-6", studentNo: "160", studentCode: "G442000201108250859", name: "梁学谦", gender: "男", seatNo: 6, parentName: "罗燕虹", parentPhone: "13380893141", parentPassword: "3141", birthDate: "2011-08-25", originSchool: "中山市西区初级中学", boarding: "走读生", residence: "广东省中山市西区后山新堤街50号之一", address: "石岐区悦来南路28号丝绸公司1部", householdType: "非农业", totalScore: "410", chinese: "64C", math: "60B", english: "96B+", physics: "67B", chemistry: "54B", politics: "75B+", pe: "74A", history: "57C", geography: "88B+", biology: "77B+", isActive: true, createdAt: now },
    { id: "stu-7", studentNo: "161", studentCode: "G450821201104084334", name: "冯俊杰", gender: "男", seatNo: 7, parentName: "谢朋燕", parentPhone: "13715573189", parentPassword: "3189", birthDate: "2011-04-08", originSchool: "中山市西区铁城初级中学（校本部）", boarding: "住宿生", residence: "广东省中山市西区沙朗农场五队", address: "西区新长江顺心居9栋2座402", householdType: "农业", totalScore: "451", chinese: "80B", math: "96A", english: "47B", physics: "75B+", chemistry: "83B+", politics: "75B+", pe: "78A+", history: "68B", geography: "80B+", biology: "92A", isActive: true, createdAt: now },
    { id: "stu-8", studentNo: "162", studentCode: "G522626201011180045", name: "肖玉柔", gender: "女", seatNo: 8, parentName: "刘小红", parentPhone: "15625383815", parentPassword: "3815", birthDate: "2010-11-18", originSchool: "中山市小榄花城中学", boarding: "住宿生", residence: "贵州省岑巩县天马镇塘湾村大坳组14号", address: "木林森有限公司2号门", householdType: "农业", totalScore: "465", chinese: "93A", math: "73B", english: "61B", physics: "75B+", chemistry: "92A", politics: "90A", pe: "80A+", history: "76B+", geography: "90B+", biology: "95A", isActive: true, createdAt: now },
    { id: "stu-9", studentNo: "163", studentCode: "G441224201006045724", name: "梁嘉雅", gender: "女", seatNo: 9, parentName: "欧月梅", parentPhone: "13672318577", parentPassword: "8577", birthDate: "2010-06-04", originSchool: "中山市永宁中学", boarding: "住宿生", residence: "广东省中山市小榄镇广成路438号九洲花园14幢504房", address: "广东省中山市小榄镇广成路438号九洲花园14幢504房", householdType: "非农业", totalScore: "461", chinese: "81B", math: "65B", english: "93B+", physics: "81B+", chemistry: "68B", politics: "79B+", pe: "80A+", history: "63B", geography: "88B+", biology: "83B+", isActive: true, createdAt: now },
    { id: "stu-10", studentNo: "164", studentCode: "G450924201103053215", name: "周添翔", gender: "男", seatNo: 10, parentName: "周佐剑", parentPhone: "13590876014", parentPassword: "6014", birthDate: "2011-03-05", originSchool: "中山市永宁中学", boarding: "住宿生", residence: "广西兴业县龙安镇螺网村一队81-1号", address: "广东省中山市小榄镇永宁西上南垄街南三巷11号", householdType: "农业", totalScore: "478", chinese: "81B", math: "89B+", english: "72B+", physics: "83B+", chemistry: "81B+", politics: "89A", pe: "80A+", history: "92A", geography: "88B+", biology: "88B+", isActive: true, createdAt: now },
    { id: "stu-11", studentNo: "165", studentCode: "G441481201106236294", name: "陈晋", gender: "男", seatNo: 11, parentName: "王仕珍", parentPhone: "13823991070", parentPassword: "1070", birthDate: "2011-06-23", originSchool: "小榄镇第一中学", boarding: "住宿生", residence: "广东省中山市小榄镇升平中路63号银菊花园90栋202房", address: "中山市小榄镇升平中路银菊花园90栋202号", householdType: "非农业", totalScore: "448", chinese: "80B", math: "84B+", english: "55B", physics: "79B+", chemistry: "80B+", politics: "71B", pe: "78A+", history: "65B", geography: "84B+", biology: "85B+", isActive: true, createdAt: now },
    { id: "stu-12", studentNo: "166", studentCode: "G450821201102072815", name: "李民源", gender: "男", seatNo: 12, parentName: "黄丽凤", parentPhone: "15976042515", parentPassword: "2515", birthDate: "2011-02-07", originSchool: "小榄镇第一中学", boarding: "住宿生", residence: "广东省中山市小榄镇沙口东路3号", address: "广东省中山市小榄镇宝源路68号榄悦轩10栋1402", householdType: "非农业", totalScore: "453", chinese: "85B+", math: "76B", english: "68B", physics: "78B+", chemistry: "73B", politics: "78B+", pe: "80A+", history: "85A", geography: "86B+", biology: "78B+", isActive: true, createdAt: now },
    { id: "stu-13", studentNo: "167", studentCode: "G442000201105164672", name: "黄俊杰", gender: "男", seatNo: 13, parentName: "陈淑娟", parentPhone: "13549873193", parentPassword: "3193", birthDate: "2011-05-16", originSchool: "小榄镇第一中学", boarding: "住宿生", residence: "广东省中山市小榄镇联文街北十五巷4号", address: "中山市小榄镇东堤路德星里3号", householdType: "农业", totalScore: "451", chinese: "82B", math: "83B+", english: "55B", physics: "81B+", chemistry: "78B+", politics: "93A", pe: "80A+", history: "81B+", geography: "92B+", biology: "82B+", isActive: true, createdAt: now },
    { id: "stu-14", studentNo: "168", studentCode: "G441224201104021718", name: "梁宝鸿", gender: "男", seatNo: 14, parentName: "陈丽娇", parentPhone: "13420043846", parentPassword: "3846", birthDate: "2011-04-02", originSchool: "中山市小榄镇第二中学", boarding: "住宿生", residence: "广东省怀集县坳仔镇盆布村委会中心村", address: "中山市小榄镇泰弘南路13号尚骏花园3栋1902房", householdType: "农业", totalScore: "457", chinese: "85B+", math: "48B", english: "86B+", physics: "81B+", chemistry: "86B+", politics: "90A", pe: "80A+", history: "73B", geography: "96A", biology: "78B+", isActive: true, createdAt: now },
    { id: "stu-15", studentNo: "169", studentCode: "G451025201104183394", name: "许泽锋", gender: "男", seatNo: 15, parentName: "梁萍", parentPhone: "18718498453", parentPassword: "8453", birthDate: "2011-04-18", originSchool: "中山市翔鸿学校", boarding: "住宿生", residence: "广西靖西市安德镇三西村华山内屯14-1号", address: "广东省中山市小榄镇九洲基环村南路41号三楼301房", householdType: "农业", totalScore: "477", chinese: "91B+", math: "62B", english: "89B+", physics: "75B+", chemistry: "91A", politics: "87B+", pe: "78A+", history: "82B+", geography: "92B+", biology: "92A", isActive: true, createdAt: now },
    { id: "stu-16", studentNo: "170", studentCode: "G442000201009028152", name: "周志恒", gender: "男", seatNo: 16, parentName: "周培钊", parentPhone: "13528270223", parentPassword: "0223", birthDate: "2010-09-02", originSchool: "中山市小榄镇旭日初级中学", boarding: "走读生", residence: "广东省中山市东升镇太平北路43号", address: "广东省中山市东升镇太平北路43号", householdType: "其他", totalScore: "417", chinese: "70C", math: "90B+", english: "36C", physics: "79B+", chemistry: "69B", politics: "78B+", pe: "80A+", history: "75B+", geography: "88B+", biology: "76B+", isActive: true, createdAt: now },
    { id: "stu-17", studentNo: "171", studentCode: "G441781201010033835", name: "谢俊濠", gender: "男", seatNo: 17, parentName: "谢丽怡", parentPhone: "13549856824", parentPassword: "6824", birthDate: "2010-10-03", originSchool: "中山市小榄镇旭日初级中学", boarding: "住宿生", residence: "广东省中山市东升镇迎宾路30号6卡", address: "中山市小榄镇坦背民乐街4号", householdType: "非农业", totalScore: "452", chinese: "71C", math: "87B+", english: "68B", physics: "87B+", chemistry: "67B", politics: "75B+", pe: "79A+", history: "93A", geography: "96A", biology: "74B", isActive: true, createdAt: now },
    { id: "stu-18", studentNo: "172", studentCode: "G442000201011078554", name: "霍俊杰", gender: "男", seatNo: 18, parentName: "宁秋桂", parentPhone: "13590777637", parentPassword: "7637", birthDate: "2010-11-07", originSchool: "中山市小榄镇旭日初级中学", boarding: "住宿生", residence: "广东省中山市东升镇二圣西路32号", address: "广东省中山市东升镇二圣西路32号", householdType: "农业", totalScore: "471", chinese: "80B", math: "88B+", english: "58B", physics: "91A", chemistry: "86B+", politics: "80B+", pe: "77A+", history: "75B+", geography: "88B+", biology: "90A", isActive: true, createdAt: now },
    { id: "stu-19", studentNo: "173", studentCode: "G442000201101318152", name: "梁天朗", gender: "男", seatNo: 19, parentName: "李玲", parentPhone: "13415373336", parentPassword: "3336", birthDate: "2011-01-31", originSchool: "中山市小榄镇旭日初级中学", boarding: "住宿生", residence: "广东省中山市东升镇永丰路7号", address: "广东省中山市东升镇永丰路7号", householdType: "农业", totalScore: "453", chinese: "77B", math: "85B+", english: "60B", physics: "82B+", chemistry: "78B+", politics: "79B+", pe: "79A+", history: "79B+", geography: "78B+", biology: "66B", isActive: true, createdAt: now },
    { id: "stu-20", studentNo: "174", studentCode: "G442000201104227192", name: "钟向展", gender: "男", seatNo: 20, parentName: "冯翠玉", parentPhone: "13726066155", parentPassword: "6155", birthDate: "2011-04-22", originSchool: "中山市小榄镇旭日初级中学", boarding: "住宿生", residence: "广东省中山市东升镇同茂路66号", address: "中山市小榄镇同茂路66号", householdType: "农业", totalScore: "447", chinese: "84B+", math: "89B+", english: "39C", physics: "90A", chemistry: "87B+", politics: "83B+", pe: "67B+", history: "82B+", geography: "92B+", biology: "81B+", isActive: true, createdAt: now },
    { id: "stu-21", studentNo: "175", studentCode: "G440804201102241318", name: "詹林达", gender: "男", seatNo: 21, parentName: "詹水娟", parentPhone: "13537742873", parentPassword: "2873", birthDate: "2011-02-24", originSchool: "中山市小榄镇旭日初级中学", boarding: "住宿生", residence: "广东省湛江市坡头区官渡镇木侯村39号", address: "中山小榄东升新胜村永新路二街3号", householdType: "农业", totalScore: "464", chinese: "82B", math: "56B", english: "100A", physics: "78B+", chemistry: "76B+", politics: "84B+", pe: "80A+", history: "81B+", geography: "88B+", biology: "79B+", isActive: true, createdAt: now },
    { id: "stu-22", studentNo: "176", studentCode: "G450921201012183234", name: "林世耀", gender: "男", seatNo: 22, parentName: "冯常萍", parentPhone: "13928126672", parentPassword: "6672", birthDate: "2010-12-18", originSchool: "中山市丽景学校", boarding: "走读生", residence: "广西容县杨村镇大军村木二队35号", address: "广东省中山市横栏镇远洋启宸9栋2302", householdType: "农业", totalScore: "413", chinese: "75B", math: "64B", english: "31C", physics: "78B+", chemistry: "94A", politics: "79B+", pe: "80A+", history: "83B+", geography: "88B+", biology: "84B+", isActive: true, createdAt: now },
    { id: "stu-23", studentNo: "177", studentCode: "G442000201007185736", name: "欧振豪", gender: "男", seatNo: 23, parentName: "王美燕", parentPhone: "18125398678", parentPassword: "8678", birthDate: "2010-07-18", originSchool: "中山市海洲初级中学", boarding: "住宿生", residence: "广东省中山市古镇镇民乐坊围田一巷11号", address: "广东省中山市古镇镇海洲村民乐围田一巷11号", householdType: "非农业", totalScore: "452", chinese: "84B+", math: "75B", english: "50B", physics: "86B+", chemistry: "85B+", politics: "82B+", pe: "80A+", history: "81B+", geography: "84B+", biology: "85B+", isActive: true, createdAt: now },
    { id: "stu-24", studentNo: "178", studentCode: "G440882201012143713", name: "柯庆丰", gender: "男", seatNo: 24, parentName: "陈琴英", parentPhone: "13425427878", parentPassword: "7878", birthDate: "2010-12-14", originSchool: "中山市曹步初级中学", boarding: "住宿生", residence: "广东省雷州市企水镇田头村182号", address: "中山市胜球阳光花园34栋1403", householdType: "农业", totalScore: "446", chinese: "80B", math: "61B", english: "97B+", physics: "69B", chemistry: "66B", politics: "75B+", pe: "80A+", history: "80B+", geography: "78B+", biology: "87B+", isActive: true, createdAt: now },
    { id: "stu-25", studentNo: "179", studentCode: "G411525201101030552", name: "季宇航", gender: "男", seatNo: 25, parentName: "张愉", parentPhone: "18988557110", parentPassword: "7110", birthDate: "2011-01-03", originSchool: "中山市曹步初级中学", boarding: "住宿生", residence: "广东省中山市古镇镇华廷路8号天宏绿茵豪庭6幢301房", address: "广东省中山市古镇镇华廷路8号天宏绿茵豪庭6幢301房", householdType: "非农业", totalScore: "446", chinese: "81B", math: "87B+", english: "64B", physics: "66B", chemistry: "75B+", politics: "75B+", pe: "80A+", history: "75B+", geography: "84B+", biology: "83B+", isActive: true, createdAt: now },
    { id: "stu-26", studentNo: "180", studentCode: "G442000201012266135", name: "黄敬豪", gender: "男", seatNo: 26, parentName: "冯秋婵", parentPhone: "13531891451", parentPassword: "1451", birthDate: "2010-12-26", originSchool: "中山市横栏中学", boarding: "走读生", residence: "广东省中山市横栏镇茂龙东路德龙六巷586号", address: "中山市横栏镇新茂九队586号之二", householdType: "农业", totalScore: "410", chinese: "65C", math: "65B", english: "76B+", physics: "65B", chemistry: "69B", politics: "73B", pe: "77A+", history: "68B", geography: "68B", biology: "73B", isActive: true, createdAt: now },
    { id: "stu-27", studentNo: "181", studentCode: "G44200020110711613X", name: "林俊杰", gender: "男", seatNo: 27, parentName: "林惠文", parentPhone: "13590732710", parentPassword: "2710", birthDate: "2011-07-11", originSchool: "中山市横栏中学", boarding: "走读生", residence: "广东省中山市横栏镇茂龙西路关帝三巷298号", address: "广东省中山市横栏镇茂龙西路关帝三巷298号", householdType: "农业", totalScore: "413", chinese: "63C", math: "90B+", english: "44B", physics: "71B", chemistry: "72B", politics: "85B+", pe: "80A+", history: "73B", geography: "88B+", biology: "68B", isActive: true, createdAt: now },
    { id: "stu-28", studentNo: "182", studentCode: "G420683201010184214", name: "刘骐源", gender: "男", seatNo: 28, parentName: "黄黎丽", parentPhone: "15918281773", parentPassword: "1773", birthDate: "2010-10-18", originSchool: "中山市横栏中学", boarding: "走读生", residence: "广东省中山市横栏镇新天二路89号星恒园16幢1701房", address: "广东省中山市横栏镇新天二路89号星恒园16栋1701", householdType: "非农业", totalScore: "416", chinese: "77B", math: "77B", english: "51B", physics: "67B", chemistry: "71B", politics: "78B+", pe: "80A+", history: "78B+", geography: "90B+", biology: "84B+", isActive: true, createdAt: now },
    { id: "stu-29", studentNo: "183", studentCode: "G451281201009094977", name: "袁孙林", gender: "男", seatNo: 29, parentName: "袁国安", parentPhone: "13549882758", parentPassword: "2758", birthDate: "2010-09-09", originSchool: "中山市横栏伟智学校", boarding: "住宿生", residence: "广西河池市宜州区庆远镇龙塘社区鸡吃水一组55号", address: "中山市横栏镇裕祥村南苑路三巷1号（伟智学校）", householdType: "农业", totalScore: "480", chinese: "88B+", math: "75B", english: "71B+", physics: "84B+", chemistry: "91A", politics: "89A", pe: "80A+", history: "89A", geography: "86B+", biology: "86B+", isActive: true, createdAt: now },
    { id: "stu-30", studentNo: "184", studentCode: "G442000201108267394", name: "伍韬丞", gender: "男", seatNo: 30, parentName: "梁建平", parentPhone: "13590734607", parentPassword: "4607", birthDate: "2011-08-26", originSchool: "中山市港口中学", boarding: "住宿生", residence: "广东省中山市港口镇西河街68号", address: "中山市港口镇胜隆村万隆大街5号", householdType: "农业", totalScore: "447", chinese: "77B", math: "88B+", english: "63B", physics: "79B+", chemistry: "67B", politics: "85B+", pe: "80A+", history: "68B", geography: "84B+", biology: "74B", isActive: true, createdAt: now },
    { id: "stu-31", studentNo: "185", studentCode: "G430524201101250113", name: "陈时平", gender: "男", seatNo: 31, parentName: "陈旭", parentPhone: "18928177995", parentPassword: "7995", birthDate: "2011-01-25", originSchool: "中山市港口中学", boarding: "住宿生", residence: "广东省中山市港口镇木河迳西路9号天明御华庭8幢101房", address: "中山市港口镇木河迳西路天明御华庭8栋101", householdType: "非农业", totalScore: "446", chinese: "72B", math: "68B", english: "89B+", physics: "71B", chemistry: "73B", politics: "88A", pe: "80A+", history: "84B+", geography: "84B+", biology: "70B", isActive: true, createdAt: now },
    { id: "stu-32", studentNo: "186", studentCode: "G430407201001170114", name: "黎开元", gender: "男", seatNo: 32, parentName: "罗超", parentPhone: "18928188777", parentPassword: "8777", birthDate: "2010-01-17", originSchool: "中山市华辰实验中学", boarding: "住宿生", residence: "广东省中山市小榄镇东俊横街21号", address: "广东省中山市小榄镇东俊横街21号", householdType: "非农业", totalScore: "449", chinese: "90B+", math: "85B+", english: "47B", physics: "80B+", chemistry: "85B+", politics: "85B+", pe: "70B+", history: "85A", geography: "96A", biology: "90A", isActive: true, createdAt: now },
    { id: "stu-33", studentNo: "187", studentCode: "G442000201008147379", name: "梁立恒", gender: "男", seatNo: 33, parentName: "梁小龙", parentPhone: "18689373199", parentPassword: "3199", birthDate: "2010-08-14", originSchool: "中山市华辰实验中学", boarding: "住宿生", residence: "广东省中山市港口镇翠港新村翠园西街2号", address: "广东省中山市港口镇美景花园Y3栋304", householdType: "非农业", totalScore: "449", chinese: "77B", math: "85B+", english: "55B", physics: "86B+", chemistry: "75B+", politics: "90A", pe: "78A+", history: "86A", geography: "74B", biology: "78B+", isActive: true, createdAt: now },
    { id: "stu-34", studentNo: "188", studentCode: "G440902201010022444", name: "梁心瑜", gender: "女", seatNo: 34, parentName: "梁亚幸", parentPhone: "15119692388", parentPassword: "2388", birthDate: "2010-10-02", originSchool: "中山市沙溪初级中学", boarding: "住宿生", residence: "广东省中山市沙溪镇涌头恬园街1号荣利豪庭7幢902房", address: "中山市沙溪镇涌头恬园街1号荣利豪庭7幢902房", householdType: "非农业", totalScore: "470", chinese: "83B", math: "78B+", english: "92B+", physics: "79B+", chemistry: "70B", politics: "74B", pe: "75A", history: "68B", geography: "90B+", biology: "73B", isActive: true, createdAt: now },
    { id: "stu-35", studentNo: "189", studentCode: "G440784201001052717", name: "陈靖安", gender: "男", seatNo: 35, parentName: "李宝聪", parentPhone: "13532058789", parentPassword: "8789", birthDate: "2010-01-05", originSchool: "中山市沙溪初级中学", boarding: "住宿生", residence: "广东省鹤山市址山镇云新村民委员会上环村65号", address: "中山市沙溪镇港园村港头大街二巷2号", householdType: "农业", totalScore: "448", chinese: "75B", math: "80B+", english: "47B", physics: "89A", chemistry: "86B+", politics: "78B+", pe: "80A+", history: "81B+", geography: "88B+", biology: "82B+", isActive: true, createdAt: now },
    { id: "stu-36", studentNo: "190", studentCode: "G442000200910123334", name: "张景文", gender: "男", seatNo: 36, parentName: "彭柳芬", parentPhone: "13411692332", parentPassword: "2332", birthDate: "2009-10-12", originSchool: "中山市黄圃镇中学", boarding: "住宿生", residence: "广东省中山市黄圃镇广隆街五巷1号之二", address: "广东省中山市黄圃镇广隆街五巷1号之二", householdType: "农业", totalScore: "453", chinese: "86B+", math: "84B+", english: "64B", physics: "82B+", chemistry: "72B", politics: "83B+", pe: "72A", history: "72B", geography: "88B+", biology: "79B+", isActive: true, createdAt: now },
    { id: "stu-37", studentNo: "191", studentCode: "G441622201010244717", name: "黄彦彬", gender: "男", seatNo: 37, parentName: "黄志敏", parentPhone: "13539804500", parentPassword: "4500", birthDate: "2010-10-24", originSchool: "中山市黄圃镇马新初级中学", boarding: "住宿生", residence: "广东省中山市黄圃镇兴圃大道中38号奥城花园31栋1002房", address: "广州市番禺区钟村街汉溪路36号", householdType: "非农业", totalScore: "449", chinese: "89B+", math: "75B", english: "46B", physics: "82B+", chemistry: "90A", politics: "84B+", pe: "76A+", history: "91A", geography: "78B+", biology: "88B+", isActive: true, createdAt: now },
    { id: "stu-38", studentNo: "192", studentCode: "G442000201107164035", name: "李逸朗", gender: "男", seatNo: 38, parentName: "陈彩杏", parentPhone: "18814245032", parentPassword: "5032", birthDate: "2011-07-16", originSchool: "中山市南头镇初级中学", boarding: "住宿生", residence: "广东省中山市南头镇民安村十二队", address: "广东省中山市南头镇民安村允益北街十一号之一", householdType: "农业", totalScore: "452", chinese: "81B", math: "84B+", english: "60B", physics: "82B+", chemistry: "74B", politics: "77B+", pe: "78A+", history: "67B", geography: "84B+", biology: "87B+", isActive: true, createdAt: now },
    { id: "stu-39", studentNo: "193", studentCode: "G440802201012090832", name: "梁骥", gender: "男", seatNo: 39, parentName: "冯燕", parentPhone: "13420261438", parentPassword: "1438", birthDate: "2010-12-09", originSchool: "中山市东凤中学", boarding: "住宿生", residence: "广东省中山市东凤镇东海五路28号佛奥阳光花园68幢1503房", address: "广东省中山市东凤镇东海5路28号佛奥阳光花园68栋1503房", householdType: "非农业", totalScore: "449", chinese: "83B", math: "77B", english: "67B", physics: "80B+", chemistry: "69B", politics: "86B+", pe: "80A+", history: "71B", geography: "96A", biology: "87B+", isActive: true, createdAt: now },
    { id: "stu-40", studentNo: "194", studentCode: "G441581201105133133", name: "林伟栋", gender: "男", seatNo: 40, parentName: "林丽君", parentPhone: "13690466599", parentPassword: "6599", birthDate: "2011-05-13", originSchool: "中山市东凤东海学校", boarding: "住宿生", residence: "广东省陆丰市博美镇图美村委会过山沟村新乡四区四横巷3号", address: "中山市东凤东海学校", householdType: "农业", totalScore: "486", chinese: "84B+", math: "98A", english: "67B", physics: "86B+", chemistry: "79B+", politics: "74B", pe: "80A+", history: "86A", geography: "86B+", biology: "86B+", isActive: true, createdAt: now },
    { id: "stu-41", studentNo: "195", studentCode: "G360428201104085530", name: "刘浩然", gender: "男", seatNo: 41, parentName: "柳效勤", parentPhone: "15907605561", parentPassword: "5561", birthDate: "2011-04-08", originSchool: "中山市三角中学", boarding: "住宿生", residence: "江西省九江市都昌县徐埠镇马矶村刘文进", address: "广东省中山市三角镇嘉怡华庭三栋一梯七楼706", householdType: "其他", totalScore: "483", chinese: "90B+", math: "83B+", english: "61B", physics: "87B+", chemistry: "91A", politics: "85B+", pe: "80A+", history: "79B+", geography: "98A", biology: "77B+", isActive: true, createdAt: now },
    { id: "stu-42", studentNo: "196", studentCode: "G441423201009094411", name: "苏诺炫", gender: "男", seatNo: 42, parentName: "张细金", parentPhone: "18933311289", parentPassword: "1289", birthDate: "2010-09-09", originSchool: "中山市浪网中学", boarding: "住宿生", residence: "广东省中山市民众镇民众社区居民委员会闲庭路1号丽豪花园1幢901房", address: "广东省中山市民众街道浪网福源一街五福巷13号", householdType: "非农业", totalScore: "452", chinese: "86B+", math: "69B", english: "72B+", physics: "77B+", chemistry: "75B+", politics: "86B+", pe: "80A+", history: "89A", geography: "76B+", biology: "90A", isActive: true, createdAt: now },
    { id: "stu-43", studentNo: "197", studentCode: "G50023520100917557X", name: "王子赫", gender: "男", seatNo: 43, parentName: "杨亮", parentPhone: "18300106607", parentPassword: "6607", birthDate: "2010-09-17", originSchool: "中山市南朗街道云衢中学", boarding: "走读生", residence: "广东省中山市南朗镇玉竹街3号1幢204房", address: "中山市南朗镇玉竹街3号1栋204房", householdType: "非农业", totalScore: "411", chinese: "83B", math: "74B", english: "45B", physics: "69B", chemistry: "67B", politics: "82B+", pe: "80A+", history: "85A", geography: "86B+", biology: "89B+", isActive: true, createdAt: now },
    { id: "stu-44", studentNo: "198", studentCode: "G441781201107161438", name: "徐贤武", gender: "男", seatNo: 44, parentName: "徐文邦", parentPhone: "13286930182", parentPassword: "0182", birthDate: "2011-07-16", originSchool: "中山市博爱初级中学", boarding: "住宿生", residence: "广东省阳春市松柏镇冲垌村委会潭京村28号", address: "广东省中山市三乡镇平南村金辉路20号", householdType: "农业", totalScore: "450", chinese: "68C", math: "98A", english: "48B", physics: "87B+", chemistry: "82B+", politics: "78B+", pe: "75A", history: "80B+", geography: "94A", biology: "85B+", isActive: true, createdAt: now },
    { id: "stu-45", studentNo: "199", studentCode: "G431026201102140078", name: "胡文杰", gender: "男", seatNo: 45, parentName: "胡青全", parentPhone: "15900063442", parentPassword: "3442", birthDate: "2011-02-14", originSchool: "中山市三乡南峰学校", boarding: "住宿生", residence: "湖南省汝城县马桥镇石泉村塘门口组", address: "广东省中山市神湾镇瑞泰大街12号四楼", householdType: "农业", totalScore: "480", chinese: "84B+", math: "78B+", english: "78B+", physics: "82B+", chemistry: "87B+", politics: "89A", pe: "80A+", history: "77B+", geography: "74B", biology: "87B+", isActive: true, createdAt: now },
    { id: "stu-46", studentNo: "200", studentCode: "G442000201101260958", name: "布振浩", gender: "男", seatNo: 46, parentName: "布建明", parentPhone: "13532019821", parentPassword: "9821", birthDate: "2011-01-26", originSchool: "中山市坦洲中学", boarding: "住宿生", residence: "广东省中山市坦洲镇德育街68号", address: "广东省中山市坦洲镇德育街68号", householdType: "农业", totalScore: "469", chinese: "78B", math: "87B+", english: "69B+", physics: "85B+", chemistry: "78B+", politics: "88A", pe: "80A+", history: "64B", geography: "82B+", biology: "83B+", isActive: true, createdAt: now },
    { id: "stu-47", studentNo: "201", studentCode: "G450423201001100435", name: "谢采霖", gender: "男", seatNo: 47, parentName: "黎秋连", parentPhone: "19976246467", parentPassword: "6467", birthDate: "2010-01-10", originSchool: "中山市坦洲实验中学", boarding: "住宿生", residence: "广东省中山市坦洲镇大兴路82号碧涛花园20幢5门606房", address: "中山市坦洲镇碧涛花园春田阁B栋606房", householdType: "其他", totalScore: "500", chinese: "76B", math: "82B+", english: "102A", physics: "87B+", chemistry: "81B+", politics: "87B+", pe: "80A+", history: "61B", geography: "88B+", biology: "84B+", isActive: true, createdAt: now },
    { id: "stu-48", studentNo: "202", studentCode: "G440784201011062716", name: "张峻熙", gender: "男", seatNo: 48, parentName: "贺秀娜", parentPhone: "13824737276", parentPassword: "7276", birthDate: "2010-11-06", originSchool: "中山市板芙镇第一中学", boarding: "住宿生", residence: "广东省鹤山市址山镇云中村民委员会红星村56号之一", address: "雅芙花园14栋303房", householdType: "农业", totalScore: "452", chinese: "88B+", math: "92B+", english: "43B", physics: "80B+", chemistry: "78B+", politics: "85B+", pe: "79A+", history: "82B+", geography: "100A+", biology: "80B+", isActive: true, createdAt: now },
    { id: "stu-49", studentNo: "203", studentCode: "G421121201107082016", name: "童翊", gender: "男", seatNo: 49, parentName: "刘杰琪", parentPhone: "13822026322", parentPassword: "6322", birthDate: "2011-07-08", originSchool: "中山市板芙镇第一中学", boarding: "住宿生", residence: "广东省中山市板芙镇芙中一横路18号联城花园B幢303房", address: "广东省中山市板芙镇雅芙花园19栋403", householdType: "非农业", totalScore: "448", chinese: "86B+", math: "81B+", english: "46B", physics: "85B+", chemistry: "78B+", politics: "79B+", pe: "80A+", history: "78B+", geography: "94A", biology: "87B+", isActive: true, createdAt: now },
    { id: "stu-50", studentNo: "204", studentCode: "G430481201009090753", name: "李晓东", gender: "男", seatNo: 50, parentName: "蒋春燕", parentPhone: "18318952356", parentPassword: "2356", birthDate: "2010-09-09", originSchool: "中山市神湾神舟学校", boarding: "住宿生", residence: "湖南省耒阳市小水镇燎亮村2组", address: "广东省中山市大涌镇大兴路大兴公寓318", householdType: "农业", totalScore: "448", chinese: "75B", math: "71B", english: "92B+", physics: "61B", chemistry: "77B+", politics: "80B+", pe: "80A+", history: "64B", geography: "60B", biology: "67B", isActive: true, createdAt: now },
  ];

  // 通知
  const notices: Notice[] = [
    {
      id: "notice-1",
      type: "notice",
      title: "欢迎来到26工业机器人2班",
      content: "新学期开始了！希望同学们在这里养成良好习惯，努力学习，健康成长。家长朋友们可以通过本系统查看孩子的每日表现情况。",
      createdAt: now,
    },
  ];

  // 评分数据初始化为空数组（不生成示例数据）
  const habitScores: HabitScore[] = [];

  // 数据版本升级策略：如果已有其他数据但学生缺少字段，只替换学生数据和班级信息，保留评分、通知等
  if (needStudentUpdate && existingStudents.length > 0) {
    writeOne(STORAGE_KEYS.classInfo, classInfo);
    write(STORAGE_KEYS.habitItems, habitItems);
    write(STORAGE_KEYS.students, students);
  } else if (savedVersion === "5") {
    // 版本5→6升级：仅更新 habitItems（新增手机管理、仪容仪表），保留其他数据
    write(STORAGE_KEYS.habitItems, habitItems);
  } else {
    writeOne(STORAGE_KEYS.classInfo, classInfo);
    write(STORAGE_KEYS.habitItems, habitItems);
    write(STORAGE_KEYS.students, students);
    write(STORAGE_KEYS.notices, notices);
    write(STORAGE_KEYS.habitScores, habitScores);
  }

  // 版本5新增：初始化成绩管理的空数据
  if (savedVersion !== "5") {
    write<Exam>(STORAGE_KEYS.exams, []);
    write<ExamScore>(STORAGE_KEYS.examScores, []);
  }

  localStorage.setItem(STORAGE_KEYS.initialized, "true");
  localStorage.setItem(STORAGE_KEYS.dataVersion, CURRENT_VERSION);
}

// ============ 会话管理（登录） ============
export const sessionStore = {
  get: () => readOne<{ role: "teacher" | "parent"; studentId?: string }>(STORAGE_KEYS.session),
  set: (data: { role: "teacher" | "parent"; studentId?: string }) => writeOne(STORAGE_KEYS.session, data),
  clear: () => localStorage.removeItem(STORAGE_KEYS.session),
};

// ============ 班级信息 ============
export const classInfoStore = {
  get: () => readOne<ClassInfo>(STORAGE_KEYS.classInfo),
  update: (data: ClassInfo) => writeOne(STORAGE_KEYS.classInfo, data),
};

// ============ 学生 ============
export const studentStore = {
  getAll: () => read<Student>(STORAGE_KEYS.students),
  getById: (id: string) => read<Student>(STORAGE_KEYS.students).find((s) => s.id === id) || null,
  getByPhone: (phone: string) => read<Student>(STORAGE_KEYS.students).find((s) => s.parentPhone === phone) || null,
  create: (data: Omit<Student, "id" | "createdAt">) => {
    const students = read<Student>(STORAGE_KEYS.students);
    const newStudent: Student = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    students.push(newStudent);
    write(STORAGE_KEYS.students, students);
    return newStudent;
  },
  update: (id: string, data: Partial<Student>) => {
    const students = read<Student>(STORAGE_KEYS.students);
    const idx = students.findIndex((s) => s.id === id);
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...data };
      write(STORAGE_KEYS.students, students);
    }
  },
  delete: (id: string) => {
    write(STORAGE_KEYS.students, read<Student>(STORAGE_KEYS.students).filter((s) => s.id !== id));
    write(STORAGE_KEYS.habitScores, read<HabitScore>(STORAGE_KEYS.habitScores).filter((s) => s.studentId !== id));
    write(STORAGE_KEYS.examScores, read<ExamScore>(STORAGE_KEYS.examScores).filter((s) => s.studentId !== id));
  },
};

// ============ 习惯评价项 ============
export const habitItemStore = {
  getAll: () => read<HabitItem>(STORAGE_KEYS.habitItems).sort((a, b) => a.sortOrder - b.sortOrder),
  getByCategory: (cat: HabitCategory) =>
    read<HabitItem>(STORAGE_KEYS.habitItems).filter((i) => i.category === cat).sort((a, b) => a.sortOrder - b.sortOrder),
  create: (data: Omit<HabitItem, "id">) => {
    const items = read<HabitItem>(STORAGE_KEYS.habitItems);
    const newItem: HabitItem = { ...data, id: generateId() };
    items.push(newItem);
    write(STORAGE_KEYS.habitItems, items);
    return newItem;
  },
  delete: (id: string) => {
    write(STORAGE_KEYS.habitItems, read<HabitItem>(STORAGE_KEYS.habitItems).filter((i) => i.id !== id));
    write(STORAGE_KEYS.habitScores, read<HabitScore>(STORAGE_KEYS.habitScores).filter((s) => s.itemId !== id));
  },
};

// ============ 习惯评分 ============
export const habitScoreStore = {
  getAll: () => read<HabitScore>(STORAGE_KEYS.habitScores),
  getByDate: (date: string) => read<HabitScore>(STORAGE_KEYS.habitScores).filter((s) => s.date === date),
  getByStudent: (studentId: string) =>
    read<HabitScore>(STORAGE_KEYS.habitScores).filter((s) => s.studentId === studentId),
  getByStudentAndDate: (studentId: string, date: string) =>
    read<HabitScore>(STORAGE_KEYS.habitScores).filter((s) => s.studentId === studentId && s.date === date),
  upsert: (date: string, studentId: string, itemId: string, rating: number, remark: string = "") => {
    const scores = read<HabitScore>(STORAGE_KEYS.habitScores);
    const existing = scores.find(
      (s) => s.date === date && s.studentId === studentId && s.itemId === itemId
    );
    if (existing) {
      existing.rating = rating;
      existing.remark = remark;
      existing.recordedAt = new Date().toISOString();
    } else {
      scores.push({
        id: generateId(),
        date,
        studentId,
        itemId,
        rating,
        remark,
        recordedAt: new Date().toISOString(),
      });
    }
    write(STORAGE_KEYS.habitScores, scores);
  },
  bulkUpsert: (records: { date: string; studentId: string; itemId: string; rating: number; remark?: string }[]) => {
    const scores = read<HabitScore>(STORAGE_KEYS.habitScores);
    records.forEach((rec) => {
      const existing = scores.find(
        (s) => s.date === rec.date && s.studentId === rec.studentId && s.itemId === rec.itemId
      );
      if (existing) {
        existing.rating = rec.rating;
        existing.remark = rec.remark || "";
        existing.recordedAt = new Date().toISOString();
      } else {
        scores.push({
          id: generateId(),
          date: rec.date,
          studentId: rec.studentId,
          itemId: rec.itemId,
          rating: rec.rating,
          remark: rec.remark || "",
          recordedAt: new Date().toISOString(),
        });
      }
    });
    write(STORAGE_KEYS.habitScores, scores);
  },
};

// ============ 通知 ============
export const noticeStore = {
  getAll: () => read<Notice>(STORAGE_KEYS.notices).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  create: (data: Omit<Notice, "id" | "createdAt">) => {
    const notices = read<Notice>(STORAGE_KEYS.notices);
    const newNotice: Notice = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    notices.push(newNotice);
    write(STORAGE_KEYS.notices, notices);
    return newNotice;
  },
  delete: (id: string) => {
    write(STORAGE_KEYS.notices, read<Notice>(STORAGE_KEYS.notices).filter((n) => n.id !== id));
  },
};

// ============ 数据导出/导入 ============
export function exportAllData(): string {
  const data: Record<string, string | null> = {};
  Object.entries(STORAGE_KEYS).forEach(([_, key]) => {
    data[key] = localStorage.getItem(key);
  });
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): void {
  const data = JSON.parse(jsonStr) as Record<string, string>;
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) localStorage.setItem(key, value);
  });
  localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// 仅清空所有评分记录，保留学生档案、班级信息、评价项、通知
export function clearAllScores(): void {
  write<HabitScore>(STORAGE_KEYS.habitScores, []);
}

// ============ 成绩管理 - 考试 ============
export const examStore = {
  getAll: () => read<Exam>(STORAGE_KEYS.exams).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ),
  getById: (id: string) => read<Exam>(STORAGE_KEYS.exams).find((e) => e.id === id) || null,
  create: (data: Omit<Exam, "id" | "createdAt">) => {
    const exams = read<Exam>(STORAGE_KEYS.exams);
    const newExam: Exam = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    exams.push(newExam);
    write(STORAGE_KEYS.exams, exams);
    return newExam;
  },
  update: (id: string, data: Partial<Exam>) => {
    const exams = read<Exam>(STORAGE_KEYS.exams);
    const idx = exams.findIndex((e) => e.id === id);
    if (idx >= 0) {
      exams[idx] = { ...exams[idx], ...data };
      write(STORAGE_KEYS.exams, exams);
    }
  },
  delete: (id: string) => {
    write(STORAGE_KEYS.exams, read<Exam>(STORAGE_KEYS.exams).filter((e) => e.id !== id));
    write(STORAGE_KEYS.examScores, read<ExamScore>(STORAGE_KEYS.examScores).filter((s) => s.examId !== id));
  },
};

// ============ 成绩管理 - 评分 ============
export const examScoreStore = {
  getAll: () => read<ExamScore>(STORAGE_KEYS.examScores),
  getByExam: (examId: string) => read<ExamScore>(STORAGE_KEYS.examScores).filter((s) => s.examId === examId),
  getByStudent: (studentId: string) => read<ExamScore>(STORAGE_KEYS.examScores).filter((s) => s.studentId === studentId),
  getByExamAndStudent: (examId: string, studentId: string) =>
    read<ExamScore>(STORAGE_KEYS.examScores).filter((s) => s.examId === examId && s.studentId === studentId),
  upsert: (examId: string, studentId: string, subject: string, score: number) => {
    const scores = read<ExamScore>(STORAGE_KEYS.examScores);
    const existing = scores.find(
      (s) => s.examId === examId && s.studentId === studentId && s.subject === subject
    );
    if (existing) {
      existing.score = score;
    } else {
      scores.push({ id: generateId(), examId, studentId, subject, score });
    }
    write(STORAGE_KEYS.examScores, scores);
  },
  bulkUpsert: (records: { examId: string; studentId: string; subject: string; score: number }[]) => {
    const scores = read<ExamScore>(STORAGE_KEYS.examScores);
    records.forEach((rec) => {
      const existing = scores.find(
        (s) => s.examId === rec.examId && s.studentId === rec.studentId && s.subject === rec.subject
      );
      if (existing) {
        existing.score = rec.score;
      } else {
        scores.push({ id: generateId(), ...rec });
      }
    });
    write(STORAGE_KEYS.examScores, scores);
  },
  deleteByExamAndStudent: (examId: string, studentId: string) => {
    write(STORAGE_KEYS.examScores,
      read<ExamScore>(STORAGE_KEYS.examScores).filter(
        (s) => !(s.examId === examId && s.studentId === studentId)
      )
    );
  },
};
