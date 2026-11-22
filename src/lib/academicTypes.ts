// ===== ACADEMIC OS TYPES (SCMS S1 CSE-3) =====

export interface AcademicExam {
  id: string;
  subject: string;
  courseCode: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30–12:00 IST" or "Not announced"
  type: 'practical' | 'theory' | 'internal' | 'viva' | 'other';
  batch?: string;
  room?: string;
  notes?: string;
}

export interface TimetablePeriod {
  periodNumber: number;
  timeRange: string; // e.g. "8:45 - 9:35"
  subject: string;
  courseCode?: string;
  teacherCode?: string;
  room: string;
  isLab?: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface DailyTimetable {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periods: TimetablePeriod[];
  lunchTime: string;
}

export interface MessMeal {
  name: string; // Breakfast, Lunch, Snacks, Dinner
  time: string;
  items: string[];
  notes?: string;
}

export interface DailyMessMenu {
  day: DayOfWeek;
  breakfast: MessMeal;
  lunch: MessMeal;
  snacks: MessMeal;
  dinner: MessMeal;
}

export interface AcademicHomework {
  id: string;
  title: string;
  subject: string;
  courseCode?: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  completed?: boolean;
}

export interface SyllabusModule {
  moduleNumber: number;
  title: string;
  contactHours: number;
  topics: SyllabusTopic[];
}

export interface SubjectSyllabus {
  code: string;
  name: string;
  shortName: string;
  credits: number;
  type: 'Theory' | 'Lab' | 'Activity';
  modules: SyllabusModule[];
  examDate?: string;
  textBooks?: string[];
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
}

export interface InternalMarks {
  subjectCode: string;
  subjectName: string;
  iat1?: number; // out of 10
  iat2?: number; // out of 10
  cta?: number; // out of 10 or 15
  attendance?: number; // out of 5
  labAssessment?: number; // out of 10
  totalCie: number; // out of 40 or 50
  targetSemesterMarks?: number; // out of 60
}

export interface AcademicProfile {
  studentInfo: {
    name: string;
    college: string;
    course: string;
    semester: string;
    classGroup: string;
    batch: string;
    scheme: string;
    room: string;
  };
  exams: AcademicExam[];
  homework: AcademicHomework[];
  syllabusProgress: Record<string, boolean>; // topicId -> boolean
  messMenu: DailyMessMenu[];
  attendance: Record<string, { total: number; attended: number }>;
  internalMarks: Record<string, { iat1?: number; iat2?: number; cta?: number; attendance?: number }>;
  quickNotes: string;
}
