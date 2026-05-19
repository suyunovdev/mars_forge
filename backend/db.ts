import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'local_db.json');

// Types
export interface Department { id: string; name: string; org_id: string; parent_id?: string; }
export interface Employee { id: string; full_name: string; email: string; role: 'admin' | 'employee' | 'manager'; department_id?: string; status?: 'active' | 'deleted'; }
export interface Course { id: string; title: string; description: string; cover_url?: string; status: 'draft' | 'published'; created_at: string; }
export interface Module { id: string; course_id: string; title: string; order: number; }
export interface Lesson { id: string; module_id: string; title: string; lesson_type: 'text' | 'video' | 'quiz'; content: any; order: number; }
export interface Assignment { id: string; course_id: string; assignee_type: 'employee' | 'department'; assignee_id: string; due_date?: string; }
export interface Enrollment { id: string; user_id: string; course_id: string; status: 'not_started' | 'in_progress' | 'completed'; progress_percent: number; }
export interface LessonProgress { user_id: string; lesson_id: string; status: 'not_started' | 'completed'; }
export interface AIJob { id: string; status: 'pending' | 'processing' | 'done' | 'failed'; result_json?: any; error?: string; }

export interface DBSchema {
  departments: Department[];
  employees: Employee[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  assignments: Assignment[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  aiJobs: AIJob[];
}

const defaultData: DBSchema = {
  departments: [
    { id: 'd1', org_id: 'org1', name: 'Ishlab chiqarish' },
    { id: 'd2', org_id: 'org1', name: 'Logistika' },
    { id: 'd3', org_id: 'org1', name: 'Moliya' }
  ],
  employees: [
    { id: 'u1', full_name: 'Admin Adminov', email: 'admin@demo.uz', role: 'admin', department_id: 'd1' },
    { id: 'u2', full_name: 'Manager Managerov', email: 'manager@demo.uz', role: 'manager', department_id: 'd2' },
    { id: 'u3', full_name: 'Worker Workerov', email: 'worker@demo.uz', role: 'employee', department_id: 'd3' },
  ],
  courses: [
    { id: 'c1', title: 'ERP - Sklad moduli', description: 'ERP tizimi bilan ishlash', status: 'published', created_at: new Date().toISOString() },
    { id: 'c2', title: 'Sotuv texnikasi', description: 'Mijozlar bilan ishlash qoidalari', status: 'published', created_at: new Date().toISOString() }
  ],
  modules: [
    { id: 'm1', course_id: 'c1', title: 'Kirish', order: 1 }
  ],
  lessons: [
    { id: 'l1', module_id: 'm1', title: 'Tizimga kirish', lesson_type: 'text', content: { markdown: 'ERP tizimiga hush kelibsiz. Login qiling.' }, order: 1 },
    { id: 'l2', module_id: 'm1', title: 'Dastlabki bilimlar', lesson_type: 'quiz', content: { questions: [{ question: 'ERP nima?', options: ['Enterprise Resource Planning', 'Education Role Play', 'Entity Relationship Process', 'Email Read Protocol'], correct: 0 }] }, order: 2 }
  ],
  assignments: [
    { id: 'a1', course_id: 'c1', assignee_type: 'employee', assignee_id: 'u3' }
  ],
  enrollments: [
    { id: 'e1', user_id: 'u3', course_id: 'c1', status: 'not_started', progress_percent: 0 }
  ],
  lessonProgress: [],
  aiJobs: []
};

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
}

export function readDB(): DBSchema {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch(e) {
    return defaultData;
  }
}

export function writeDB(data: DBSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function updateDB(updater: (db: DBSchema) => void) {
  const db = readDB();
  updater(db);
  writeDB(db);
}
