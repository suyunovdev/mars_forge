import fs from "fs";
import { Express } from "express";
import jwt from "jsonwebtoken";
import { readDB, updateDB, Course, Module, Lesson } from "./db";
import { processAiImportFast } from "./ai_service";

const SECRET = "corporate-lms-super-secret"; // Demo secret

function generateToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.full_name }, SECRET, { expiresIn: '1d' });
}

export function initRoutes(app: Express, upload: any) {

  // ------------- AUTH -------------
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.employees.find(e => e.email === email);
    // For prototype, we accept any password if the user exists
    if (!user) {
      return res.status(401).json({ error: "Foydalanuvchi topilmadi" });
    }
    const token = generateToken(user);
    res.json({ access_token: token, user });
  });

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      res.json(decoded);
    } catch(e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // ------------- ADMIN: EMPLOYEES -------------
  app.get("/api/employees", (req, res) => {
    const db = readDB();
    res.json(db.employees.filter((e) => e.status !== "deleted"));
  });

  app.post("/api/employees", (req, res) => {
    const { full_name, email, role, department_id } = req.body;
    const newEmp = { id: 'u_' + Date.now(), full_name, email, role, department_id, status: 'active' as const };
    updateDB((db) => { db.employees.push(newEmp); });
    res.json(newEmp);
  });

  app.patch("/api/employees/:id", (req, res) => {
    const id = req.params.id;
    let updated = null;
    updateDB((db) => {
      const idx = db.employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        db.employees[idx] = { ...db.employees[idx], ...req.body };
        updated = db.employees[idx];
      }
    });
    res.json(updated);
  });

  app.delete("/api/employees/:id", (req, res) => {
    const id = req.params.id;
    updateDB((db) => {
      const idx = db.employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        db.employees[idx].status = 'deleted';
      }
    });
    res.json({ success: true });
  });

  app.post("/api/employees/import-csv", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const content = fs.readFileSync(req.file.path, 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const newEmployees: any[] = [];
    lines.forEach((line, index) => {
      // Assuming format: Name, Email, Password, Role
      // skip header if any
      if (index === 0 && line.toLowerCase().includes('ism')) return;
      if (index === 0 && line.toLowerCase().includes('name')) return;
      const parts = line.split(',');
      if (parts.length >= 2) {
        newEmployees.push({
          id: 'u_' + Date.now() + '_' + index,
          full_name: parts[0] ? parts[0].trim() : 'Noma\'lum',
          email: parts[1] ? parts[1].trim() : `user${index}@demo.uz`,
          role: parts[3] ? parts[3].trim() as any : 'employee',
          status: 'active' as const
        });
      }
    });
    updateDB((db) => { db.employees.push(...newEmployees); });
    res.json({ imported: newEmployees.length, status: "success" });
  });

  // ------------- ADMIN: DEPARTMENTS -------------
  app.get("/api/departments", (req, res) => {
    const db = readDB();
    res.json(db.departments);
  });

  app.post("/api/departments", (req, res) => {
    const { name, org_id, parent_id } = req.body;
    const newDep = { id: 'd_' + Date.now(), name, org_id: org_id || 'org1', parent_id };
    updateDB((db) => { db.departments.push(newDep); });
    res.json(newDep);
  });

  app.patch("/api/departments/:id", (req, res) => {
    const id = req.params.id;
    let updated = null;
    updateDB((db) => {
      const idx = db.departments.findIndex(d => d.id === id);
      if (idx !== -1) {
        db.departments[idx] = { ...db.departments[idx], ...req.body };
        updated = db.departments[idx];
      }
    });
    res.json(updated);
  });

  app.delete("/api/departments/:id", (req, res) => {
    const id = req.params.id;
    let success = false;
    let message = '';
    updateDB((db) => {
      const depIdx = db.departments.findIndex(d => d.id === id);
      if (depIdx !== -1) {
        const employeesInDep = db.employees.filter((e) => e.department_id === id && e.status !== 'deleted');
        if (employeesInDep.length > 0) {
           message = "Ushbu bo'limni o'chirib bo'lmaydi: unga biriktirilgan faol xodimlar mavjud. Iltimos, oldin ularni boshqa bo'limga o'tkazing.";
        } else {
           db.departments.splice(depIdx, 1);
           success = true;
        }
      } else {
        message = "Bo'lim topilmadi";
      }
    });
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: message });
    }
  });

  // ------------- ADMIN: COURSES -------------
  app.get("/api/courses", (req, res) => {
    const db = readDB();
    // Return courses with module count
    const result = db.courses.map(c => {
      const mods = db.modules.filter(m => m.course_id === c.id);
      return { ...c, modules_count: mods.length };
    });
    res.json(result);
  });

  app.get("/api/courses/:id", (req, res) => {
    const db = readDB();
    const courseId = req.params.id;
    const course = db.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const modules = db.modules.filter(m => m.course_id === courseId);
    const resultMods = modules.map(m => {
      const lessons = db.lessons.filter(l => l.module_id === m.id);
      return { ...m, lessons };
    });

    res.json({ ...course, modules: resultMods });
  });

  // ------------- AI IMPORT -------------
  app.post("/api/ai/import", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const jobId = 'job_' + Date.now();
    
    updateDB((db) => {
      db.aiJobs.push({ id: jobId, status: 'pending' });
    });

    // Start async processing
    processAiImportFast(jobId, req.file.path);

    res.json({ job_id: jobId });
  });

  app.get("/api/ai/import/:id", (req, res) => {
    const db = readDB();
    const job = db.aiJobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job trace not found" });
    res.json({ status: job.status, result: job.result_json, error: job.error });
  });

  app.post("/api/ai/import/:id/apply", (req, res) => {
    const db = readDB();
    const job = db.aiJobs.find(j => j.id === req.params.id);
    if (!job || job.status !== 'done' || !job.result_json) {
      return res.status(400).json({ error: "Job no ready or missing details" });
    }

    const { course_title, description, modules } = job.result_json;
    const courseId = 'c_' + Date.now();
    
    updateDB((updater) => {
      updater.courses.push({
        id: courseId,
        title: course_title || "Yangi AI Kurs",
        description: description || "",
        status: 'draft',
        created_at: new Date().toISOString()
      });

      if (modules && Array.isArray(modules)) {
        modules.forEach((mod: any, mIndex: number) => {
          const modId = courseId + '_m' + mIndex;
          updater.modules.push({
            id: modId,
            course_id: courseId,
            title: mod.title,
            order: mod.order || mIndex + 1
          });

          if (mod.lessons && Array.isArray(mod.lessons)) {
            mod.lessons.forEach((les: any, lIndex: number) => {
              const lesId = modId + '_l' + lIndex;
              let content = {};
              if (les.lesson_type === 'quiz') {
                content = { questions: les.quiz_questions };
              } else {
                content = { markdown: les.content_markdown };
              }

              updater.lessons.push({
                id: lesId,
                module_id: modId,
                title: les.title,
                lesson_type: les.lesson_type === 'quiz' ? 'quiz' : 'text',
                content: content,
                order: les.order || lIndex + 1
              });
            });
          }
        });
      }
    });

    res.json({ course_id: courseId, status: "success" });
  });

  // ------------- EMPLOYEE ROUTES -------------
  app.get("/api/my/courses", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });
    try {
      const decoded: any = jwt.verify(authHeader.split(" ")[1], SECRET);
      const db = readDB();
      const assignments = db.assignments.filter(a => a.assignee_id === decoded.id);
      const myCourses = assignments.map(a => {
        const course = db.courses.find(c => c.id === a.course_id);
        const enroll = db.enrollments.find(e => e.course_id === a.course_id && e.user_id === decoded.id);
        return { course, enroll, due_date: a.due_date };
      }).filter(c => c.course); // Remove nulls if any
      res.json(myCourses);
    } catch(e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Assign a course
  app.post("/api/assignments", (req, res) => {
    const { course_id, assignee_id, due_date } = req.body;
    updateDB((db) => {
      db.assignments.push({
        id: 'a_' + Date.now(),
        course_id,
        assignee_type: 'employee',
        assignee_id,
        due_date
      });
      // automatically enroll
      db.enrollments.push({
        id: 'e_' + Date.now(),
        user_id: assignee_id,
        course_id,
        status: 'not_started',
        progress_percent: 0
      });
    });
    res.json({ status: "ok" });
  });
  
}
