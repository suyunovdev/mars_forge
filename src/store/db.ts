const DB_KEY = 'lms_db';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export type Role = 'admin' | 'employee' | 'manager';
export type CourseStatus = 'draft' | 'published';
export type LessonType = 'text' | 'quiz' | 'video';
export type EnrollStatus = 'not_started' | 'in_progress' | 'completed';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'matching' | 'ordering' | 'essay';

export interface Department { id: string; name: string; org_id: string; parent_id?: string; }
export interface Employee { id: string; full_name: string; email: string; password: string; role: Role; department_id?: string; status: 'active' | 'deleted'; }
export interface Course { id: string; title: string; description: string; status: CourseStatus; created_at: string; }
export interface Module { id: string; course_id: string; title: string; order: number; }

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  // multiple_choice
  options?: string[];
  correct?: number;
  // true_false — correct: 0 = True, 1 = False
  // short_answer
  expectedAnswer?: string;
  // matching
  matchPairs?: { left: string; right: string }[];
  // ordering
  orderItems?: string[];
  correctOrder?: number[]; // correct indexes order
  // essay — free text, no auto-grade
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type: LessonType;
  content: {
    markdown?: string;
    questions?: QuizQuestion[];
    videoUrl?: string; // for video type
  };
  order: number;
}

export interface Assignment { id: string; course_id: string; assignee_type: 'employee' | 'department'; assignee_id: string; due_date?: string; }
export interface Enrollment { id: string; user_id: string; course_id: string; status: EnrollStatus; progress_percent: number; completed_at?: string; }
export interface LessonProgress { user_id: string; lesson_id: string; completed_at: string; }
export interface AuthUser { id: string; email: string; role: Role; full_name: string; }

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  score: number; // 0-100
}

export interface DBSchema {
  departments: Department[];
  employees: Employee[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  assignments: Assignment[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  certificates: Certificate[];
}

const SEED: DBSchema = {
  departments: [
    { id: 'd1', name: 'Ishlab chiqarish', org_id: 'org1' },
    { id: 'd2', name: 'Logistika', org_id: 'org1' },
    { id: 'd3', name: 'Moliya', org_id: 'org1' },
    { id: 'd4', name: 'IT bo\'lim', org_id: 'org1' },
  ],
  employees: [
    { id: 'u1', full_name: 'Admin User', email: 'admin@demo.uz', password: 'admin', role: 'admin', department_id: 'd4', status: 'active' },
    { id: 'u2', full_name: 'Manager User', email: 'manager@demo.uz', password: 'manager', role: 'manager', department_id: 'd1', status: 'active' },
    { id: 'u3', full_name: 'Worker One', email: 'worker@demo.uz', password: 'worker', role: 'employee', department_id: 'd1', status: 'active' },
    { id: 'u4', full_name: 'Worker Two', email: 'worker2@demo.uz', password: 'worker2', role: 'employee', department_id: 'd2', status: 'active' },
    { id: 'u5', full_name: 'Worker Three', email: 'worker3@demo.uz', password: 'worker3', role: 'employee', department_id: 'd3', status: 'active' },
  ],
  courses: [
    { id: 'c1', title: 'Xavfsizlik asoslari', description: 'Ishlab chiqarishda xavfsizlik texnikasi va qoidalari', status: 'published', created_at: '2025-01-10T08:00:00Z' },
    { id: 'c2', title: 'Logistika menejment', description: 'Zanjir ta\'minoti va logistika boshqaruvi', status: 'published', created_at: '2025-02-15T09:00:00Z' },
    { id: 'c3', title: 'Moliya hisobot', description: 'Moliyaviy hisobotlarni tuzish va tahlil qilish', status: 'draft', created_at: '2025-03-20T10:00:00Z' },
  ],
  modules: [
    { id: 'm1', course_id: 'c1', title: '1-modul: Asosiy qoidalar', order: 1 },
    { id: 'm2', course_id: 'c1', title: '2-modul: Amaliy mashqlar', order: 2 },
    { id: 'm3', course_id: 'c2', title: '1-modul: Logistika tizimi', order: 1 },
  ],
  lessons: [
    {
      id: 'l1', module_id: 'm1', title: 'Kirish va umumiy qoidalar', lesson_type: 'text',
      content: { markdown: '# Xavfsizlik qoidalari\n\nIshlab chiqarishda xavfsizlik birinchi o\'rinda turadi.\n\n## Asosiy tamoyillar\n\n- Har doim himoya vositalarini kiyish\n- Mashina ishlatishdan oldin tekshirish\n- Favqulodda holatda darhol xabar berish\n\n## Muhim eslatma\n\nBarcha xodimlar ushbu qoidalarni bilishlari shart.' },
      order: 1
    },
    {
      id: 'l2', module_id: 'm1', title: 'Xavfsizlik bilimi testi', lesson_type: 'quiz',
      content: {
        questions: [
          { id: 'q1', type: 'multiple_choice', question: 'Himoya ko\'zoynagi qachon kiyilishi kerak?', options: ['Faqat payvandlashda', 'Faqat kimyoviy ishlarda', 'Har doim ishlab chiqarishda', 'Hech qachon'], correct: 2 },
          { id: 'q2', type: 'multiple_choice', question: 'Avariya holatida birinchi navbatda nima qilish kerak?', options: ['O\'zingizni saqlab qoling', 'Mashinani o\'chiring', 'Menejerga xabar bering', 'Chiqishga yuguring'], correct: 2 },
        ]
      },
      order: 2
    },
    {
      id: 'l3', module_id: 'm2', title: 'Amaliy mashq: Jihozlarni tekshirish', lesson_type: 'text',
      content: { markdown: '# Jihozlarni tekshirish tartibi\n\n## Har kuni bajarish kerak\n\n1. Elektr kabellari holatini tekshiring\n2. Himoya panellari o\'rnida ekanligini tekshiring\n3. Favqulodda to\'xtatish tugmasini sinab ko\'ring\n\n## Haftalik tekshiruv\n\n- Yog\'lash joylari\n- Bolt va gaykalar mahkamligini tekshirish\n- Filtr tozaligini tekshirish' },
      order: 1
    },
    {
      id: 'l4', module_id: 'm3', title: 'Logistika tizimi nima?', lesson_type: 'text',
      content: { markdown: '# Logistika tizimi\n\nLogistika — mahsulotlarni ishlab chiqaruvchidan iste\'molchiga yetkazib berish jarayonini boshqarish fanidir.\n\n## Asosiy elementlar\n\n- **Transport** — mahsulotni joydan joyga olib o\'tish\n- **Saqlash** — ombor xizmatlariga boshqarish\n- **Axborot** — buyurtmalar va yetkazib berish ma\'lumotlari' },
      order: 1
    },
    {
      id: 'l5', module_id: 'm3', title: 'Logistika tizimi testi', lesson_type: 'quiz',
      content: {
        questions: [
          { id: 'q3', type: 'multiple_choice', question: 'Logistika zanjirining asosiy maqsadi nima?', options: ['Xarajatlarni kamaytirish', 'Mahsulotni vaqtida yetkazib berish', 'Faqat transport xarajatlari', 'Ombor boshqaruvi'], correct: 1 },
          { id: 'q4', type: 'multiple_choice', question: 'JIT (Just-In-Time) nima degani?', options: ['Har doim kechikish', 'O\'z vaqtida yetkazib berish', 'Ko\'p zaxira saqlash', 'Tez transport'], correct: 1 },
        ]
      },
      order: 2
    },
  ],
  assignments: [
    { id: 'a1', course_id: 'c1', assignee_type: 'employee', assignee_id: 'u3', due_date: '2025-06-30' },
    { id: 'a2', course_id: 'c1', assignee_type: 'employee', assignee_id: 'u4', due_date: '2025-06-30' },
    { id: 'a3', course_id: 'c2', assignee_type: 'employee', assignee_id: 'u3', due_date: '2025-07-15' },
    { id: 'a4', course_id: 'c1', assignee_type: 'department', assignee_id: 'd1', due_date: '2025-06-30' },
  ],
  enrollments: [
    { id: 'e1', user_id: 'u3', course_id: 'c1', status: 'in_progress', progress_percent: 25 },
    { id: 'e2', user_id: 'u3', course_id: 'c2', status: 'not_started', progress_percent: 0 },
    { id: 'e3', user_id: 'u4', course_id: 'c1', status: 'not_started', progress_percent: 0 },
  ],
  lessonProgress: [],
  certificates: [],
};

function load(): DBSchema {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED));
      return JSON.parse(JSON.stringify(SEED)) as DBSchema;
    }
    const parsed = JSON.parse(raw) as DBSchema;
    // Migrate: ensure certificates array exists
    if (!parsed.certificates) {
      parsed.certificates = [];
    }
    // Migrate: ensure quiz questions have id and type
    parsed.lessons = parsed.lessons.map(lesson => {
      if (lesson.lesson_type === 'quiz' && lesson.content.questions) {
        lesson.content.questions = lesson.content.questions.map(q => ({
          id: (q as QuizQuestion).id ?? uid(),
          type: (q as QuizQuestion).type ?? 'multiple_choice',
          ...q,
        }));
      }
      return lesson;
    });
    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(SEED)) as DBSchema;
  }
}

function save(data: DBSchema): void {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function getDB(): DBSchema {
  return load();
}

// AUTH
export const auth = {
  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('lms_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user: AuthUser): void {
    localStorage.setItem('lms_user', JSON.stringify(user));
  },
  clearUser(): void {
    localStorage.removeItem('lms_user');
  },
};

export const db = {
  departments: {
    list(): Department[] {
      return getDB().departments;
    },
    create(data: Omit<Department, 'id'>): Department {
      const d = getDB();
      const item: Department = { ...data, id: uid() };
      d.departments.push(item);
      save(d);
      return item;
    },
    update(id: string, data: Partial<Omit<Department, 'id'>>): Department | null {
      const d = getDB();
      const idx = d.departments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      d.departments[idx] = { ...d.departments[idx], ...data };
      save(d);
      return d.departments[idx];
    },
    delete(id: string): boolean {
      const d = getDB();
      const before = d.departments.length;
      d.departments = d.departments.filter(x => x.id !== id);
      save(d);
      return d.departments.length < before;
    },
  },

  employees: {
    list(): Employee[] {
      return getDB().employees.filter(e => e.status !== 'deleted');
    },
    find(id: string): Employee | null {
      return getDB().employees.find(e => e.id === id) ?? null;
    },
    findByEmail(email: string): Employee | null {
      return getDB().employees.find(e => e.email === email && e.status !== 'deleted') ?? null;
    },
    create(data: Omit<Employee, 'id' | 'status'>): Employee {
      const d = getDB();
      const item: Employee = { ...data, id: uid(), status: 'active' };
      d.employees.push(item);
      save(d);
      return item;
    },
    update(id: string, data: Partial<Omit<Employee, 'id'>>): Employee | null {
      const d = getDB();
      const idx = d.employees.findIndex(e => e.id === id);
      if (idx === -1) return null;
      d.employees[idx] = { ...d.employees[idx], ...data };
      save(d);
      return d.employees[idx];
    },
    softDelete(id: string): boolean {
      const d = getDB();
      const idx = d.employees.findIndex(e => e.id === id);
      if (idx === -1) return false;
      d.employees[idx].status = 'deleted';
      save(d);
      return true;
    },
    importCSV(csvText: string): Employee[] {
      const lines = csvText.trim().split('\n');
      const created: Employee[] = [];
      const d = getDB();
      // skip header if it starts with non-email looking text
      const start = lines[0]?.toLowerCase().includes('email') ? 1 : 0;
      for (let i = start; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length < 3) continue;
        const [full_name, email, password, role, department_id] = parts;
        if (!email || !full_name) continue;
        const emp: Employee = {
          id: uid(),
          full_name,
          email,
          password: password ?? 'password123',
          role: (role as Role) ?? 'employee',
          department_id: department_id ?? undefined,
          status: 'active',
        };
        d.employees.push(emp);
        created.push(emp);
      }
      save(d);
      return created;
    },
  },

  courses: {
    list(): (Course & { modules_count: number })[] {
      const d = getDB();
      return d.courses.map(c => ({
        ...c,
        modules_count: d.modules.filter(m => m.course_id === c.id).length,
      }));
    },
    find(id: string): Course | null {
      return getDB().courses.find(c => c.id === id) ?? null;
    },
    findWithModules(id: string): (Course & { modules: (Module & { lessons: Lesson[] })[] }) | null {
      const d = getDB();
      const course = d.courses.find(c => c.id === id);
      if (!course) return null;
      const modules = d.modules
        .filter(m => m.course_id === id)
        .sort((a, b) => a.order - b.order)
        .map(m => ({
          ...m,
          lessons: d.lessons
            .filter(l => l.module_id === m.id)
            .sort((a, b) => a.order - b.order),
        }));
      return { ...course, modules };
    },
    create(data: { title: string; description: string }): Course {
      const d = getDB();
      const item: Course = {
        id: uid(),
        title: data.title,
        description: data.description,
        status: 'draft',
        created_at: new Date().toISOString(),
      };
      d.courses.push(item);
      save(d);
      return item;
    },
    update(id: string, data: Partial<Omit<Course, 'id' | 'created_at'>>): Course | null {
      const d = getDB();
      const idx = d.courses.findIndex(c => c.id === id);
      if (idx === -1) return null;
      d.courses[idx] = { ...d.courses[idx], ...data };
      save(d);
      return d.courses[idx];
    },
    delete(id: string): boolean {
      const d = getDB();
      const moduleIds = d.modules.filter(m => m.course_id === id).map(m => m.id);
      d.lessons = d.lessons.filter(l => !moduleIds.includes(l.module_id));
      d.modules = d.modules.filter(m => m.course_id !== id);
      d.assignments = d.assignments.filter(a => a.course_id !== id);
      d.enrollments = d.enrollments.filter(e => e.course_id !== id);
      const before = d.courses.length;
      d.courses = d.courses.filter(c => c.id !== id);
      save(d);
      return d.courses.length < before;
    },
    toggleStatus(id: string): Course | null {
      const d = getDB();
      const idx = d.courses.findIndex(c => c.id === id);
      if (idx === -1) return null;
      d.courses[idx].status = d.courses[idx].status === 'published' ? 'draft' : 'published';
      save(d);
      return d.courses[idx];
    },
    createFromAI(result: { title: string; description: string; modules: { title: string; lessons: { title: string; content: string }[] }[] }): Course {
      const d = getDB();
      const courseId = uid();
      const course: Course = {
        id: courseId,
        title: result.title,
        description: result.description,
        status: 'draft',
        created_at: new Date().toISOString(),
      };
      d.courses.push(course);
      result.modules.forEach((mod, mi) => {
        const moduleId = uid();
        const module: Module = { id: moduleId, course_id: courseId, title: mod.title, order: mi + 1 };
        d.modules.push(module);
        mod.lessons.forEach((les, li) => {
          const lesson: Lesson = {
            id: uid(),
            module_id: moduleId,
            title: les.title,
            lesson_type: 'text',
            content: { markdown: les.content },
            order: li + 1,
          };
          d.lessons.push(lesson);
        });
      });
      save(d);
      return course;
    },
  },

  modules: {
    listByCourse(courseId: string): Module[] {
      return getDB().modules.filter(m => m.course_id === courseId).sort((a, b) => a.order - b.order);
    },
    create(data: Omit<Module, 'id'>): Module {
      const d = getDB();
      const item: Module = { ...data, id: uid() };
      d.modules.push(item);
      save(d);
      return item;
    },
    update(id: string, data: Partial<Omit<Module, 'id'>>): Module | null {
      const d = getDB();
      const idx = d.modules.findIndex(m => m.id === id);
      if (idx === -1) return null;
      d.modules[idx] = { ...d.modules[idx], ...data };
      save(d);
      return d.modules[idx];
    },
    delete(id: string): boolean {
      const d = getDB();
      d.lessons = d.lessons.filter(l => l.module_id !== id);
      const before = d.modules.length;
      d.modules = d.modules.filter(m => m.id !== id);
      save(d);
      return d.modules.length < before;
    },
  },

  lessons: {
    listByModule(moduleId: string): Lesson[] {
      return getDB().lessons.filter(l => l.module_id === moduleId).sort((a, b) => a.order - b.order);
    },
    find(id: string): Lesson | null {
      return getDB().lessons.find(l => l.id === id) ?? null;
    },
    create(data: Omit<Lesson, 'id'>): Lesson {
      const d = getDB();
      const item: Lesson = { ...data, id: uid() };
      d.lessons.push(item);
      save(d);
      return item;
    },
    update(id: string, data: Partial<Omit<Lesson, 'id'>>): Lesson | null {
      const d = getDB();
      const idx = d.lessons.findIndex(l => l.id === id);
      if (idx === -1) return null;
      d.lessons[idx] = { ...d.lessons[idx], ...data };
      save(d);
      return d.lessons[idx];
    },
    delete(id: string): boolean {
      const d = getDB();
      const before = d.lessons.length;
      d.lessons = d.lessons.filter(l => l.id !== id);
      save(d);
      return d.lessons.length < before;
    },
  },

  assignments: {
    list(): Assignment[] {
      return getDB().assignments;
    },
    assignCourse(data: Omit<Assignment, 'id'>): Assignment {
      const d = getDB();
      const item: Assignment = { ...data, id: uid() };
      d.assignments.push(item);
      // Auto-enroll if employee
      if (data.assignee_type === 'employee') {
        const existing = d.enrollments.find(e => e.user_id === data.assignee_id && e.course_id === data.course_id);
        if (!existing) {
          d.enrollments.push({ id: uid(), user_id: data.assignee_id, course_id: data.course_id, status: 'not_started', progress_percent: 0 });
        }
      } else if (data.assignee_type === 'department') {
        // enroll all employees in department
        const empls = d.employees.filter(e => e.department_id === data.assignee_id && e.status !== 'deleted');
        for (const emp of empls) {
          const existing = d.enrollments.find(e => e.user_id === emp.id && e.course_id === data.course_id);
          if (!existing) {
            d.enrollments.push({ id: uid(), user_id: emp.id, course_id: data.course_id, status: 'not_started', progress_percent: 0 });
          }
        }
      }
      save(d);
      return item;
    },
    getAssignedCourses(userId: string): (Course & { enrollment: Enrollment | null; due_date?: string; is_overdue: boolean })[] {
      const d = getDB();
      const user = d.employees.find(e => e.id === userId);
      if (!user) return [];
      const now = new Date().toISOString().slice(0, 10);
      // find all course ids assigned to this user or their department
      const assignedCourseMap = new Map<string, string | undefined>(); // courseId -> due_date
      for (const a of d.assignments) {
        if (a.assignee_type === 'employee' && a.assignee_id === userId) {
          assignedCourseMap.set(a.course_id, a.due_date);
        }
        if (a.assignee_type === 'department' && a.assignee_id === user.department_id) {
          if (!assignedCourseMap.has(a.course_id)) {
            assignedCourseMap.set(a.course_id, a.due_date);
          }
        }
      }
      // also add courses the user is enrolled in
      for (const e of d.enrollments.filter(e => e.user_id === userId)) {
        if (!assignedCourseMap.has(e.course_id)) {
          assignedCourseMap.set(e.course_id, undefined);
        }
      }
      return d.courses
        .filter(c => assignedCourseMap.has(c.id) && c.status === 'published')
        .map(c => {
          const enrollment = d.enrollments.find(e => e.user_id === userId && e.course_id === c.id) ?? null;
          const due_date = assignedCourseMap.get(c.id);
          const is_overdue = !!(due_date && due_date < now && enrollment?.status !== 'completed');
          return {
            ...c,
            enrollment,
            due_date,
            is_overdue,
          };
        });
    },
  },

  lessonProgress: {
    isCompleted(userId: string, lessonId: string): boolean {
      return getDB().lessonProgress.some(lp => lp.user_id === userId && lp.lesson_id === lessonId);
    },
    complete(userId: string, lessonId: string, courseId: string): void {
      const d = getDB();
      const alreadyDone = d.lessonProgress.some(lp => lp.user_id === userId && lp.lesson_id === lessonId);
      if (!alreadyDone) {
        d.lessonProgress.push({ user_id: userId, lesson_id: lessonId, completed_at: new Date().toISOString() });
      }
      // Recalculate progress
      const moduleIds = d.modules.filter(m => m.course_id === courseId).map(m => m.id);
      const totalLessons = d.lessons.filter(l => moduleIds.includes(l.module_id)).length;
      const completedLessons = d.lessons
        .filter(l => moduleIds.includes(l.module_id))
        .filter(l => d.lessonProgress.some(lp => lp.user_id === userId && lp.lesson_id === l.id)).length;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const enrollIdx = d.enrollments.findIndex(e => e.user_id === userId && e.course_id === courseId);
      const newStatus: EnrollStatus = progressPercent >= 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'not_started';
      if (enrollIdx !== -1) {
        d.enrollments[enrollIdx].progress_percent = progressPercent;
        d.enrollments[enrollIdx].status = newStatus;
        if (newStatus === 'completed' && !d.enrollments[enrollIdx].completed_at) {
          d.enrollments[enrollIdx].completed_at = new Date().toISOString();
        }
      } else {
        d.enrollments.push({
          id: uid(),
          user_id: userId,
          course_id: courseId,
          status: newStatus,
          progress_percent: progressPercent,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
        });
      }
      save(d);
    },
  },

  certificates: {
    issue(userId: string, courseId: string, score: number): Certificate {
      const d = getDB();
      // Check if already issued
      const existing = d.certificates.find(c => c.user_id === userId && c.course_id === courseId);
      if (existing) return existing;
      const cert: Certificate = {
        id: uid(),
        user_id: userId,
        course_id: courseId,
        issued_at: new Date().toISOString(),
        score: Math.round(score),
      };
      d.certificates.push(cert);
      save(d);
      return cert;
    },
    getByUser(userId: string): (Certificate & { course: Course })[] {
      const d = getDB();
      return d.certificates
        .filter(c => c.user_id === userId)
        .map(c => {
          const course = d.courses.find(co => co.id === c.course_id);
          if (!course) return null;
          return { ...c, course };
        })
        .filter((x): x is Certificate & { course: Course } => x !== null);
    },
    getByUserAndCourse(userId: string, courseId: string): Certificate | null {
      const d = getDB();
      return d.certificates.find(c => c.user_id === userId && c.course_id === courseId) ?? null;
    },
  },

  stats: {
    getManagerStats(managerId: string) {
      const d = getDB();
      const manager = d.employees.find(e => e.id === managerId);
      if (!manager) return null;
      const deptId = manager.department_id;
      const dept = deptId ? d.departments.find(dep => dep.id === deptId) : null;
      const now = new Date().toISOString().slice(0, 10);

      const teamMembers = d.employees.filter(
        e => e.department_id === deptId && e.status !== 'deleted' && e.id !== managerId
      );

      const teamProgress = teamMembers.map(emp => {
        const enrollments = d.enrollments
          .filter(e => e.user_id === emp.id)
          .map(e => {
            const course = d.courses.find(c => c.id === e.course_id);
            if (!course) return null;
            // Find assignment for due_date
            const assignment = d.assignments.find(
              a => a.course_id === e.course_id &&
              (
                (a.assignee_type === 'employee' && a.assignee_id === emp.id) ||
                (a.assignee_type === 'department' && a.assignee_id === emp.department_id)
              )
            ) ?? null;
            const is_overdue = !!(assignment?.due_date && assignment.due_date < now && e.status !== 'completed');
            return { enrollment: e, course, assignment, is_overdue };
          })
          .filter((x): x is { enrollment: Enrollment; course: Course; assignment: Assignment | null; is_overdue: boolean } => x !== null);
        return { employee: emp, enrollments };
      });

      const allEnrollments = teamMembers.flatMap(emp =>
        d.enrollments.filter(e => e.user_id === emp.id)
      );
      const avgProgress =
        allEnrollments.length > 0
          ? Math.round(allEnrollments.reduce((s, e) => s + e.progress_percent, 0) / allEnrollments.length)
          : 0;
      const completedCount = allEnrollments.filter(e => e.status === 'completed').length;

      return {
        department: dept ?? null,
        teamSize: teamMembers.length,
        avgProgress,
        completedEnrollments: completedCount,
        totalEnrollments: allEnrollments.length,
        teamProgress,
      };
    },

    getDashboard(): {
      activeEmployees: number;
      publishedCourses: number;
      totalAssignments: number;
      avgProgress: number;
      departments: { name: string; count: number; progress: number }[];
    } {
      const d = getDB();
      const activeEmployees = d.employees.filter(e => e.status !== 'deleted').length;
      const publishedCourses = d.courses.filter(c => c.status === 'published').length;
      const totalAssignments = d.assignments.length;
      const enrollments = d.enrollments;
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((s, e) => s + e.progress_percent, 0) / enrollments.length)
        : 0;
      const departments = d.departments.map(dep => {
        const empls = d.employees.filter(e => e.department_id === dep.id && e.status !== 'deleted');
        const count = empls.length;
        const emplIds = empls.map(e => e.id);
        const depEnrollments = d.enrollments.filter(e => emplIds.includes(e.user_id));
        const progress = depEnrollments.length > 0
          ? Math.round(depEnrollments.reduce((s, e) => s + e.progress_percent, 0) / depEnrollments.length)
          : 0;
        return { name: dep.name, count, progress };
      });
      return { activeEmployees, publishedCourses, totalAssignments, avgProgress, departments };
    },
  },
};
