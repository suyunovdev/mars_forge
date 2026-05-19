import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { auth } from './store/db';

import { Login }           from './views/Login';
import { AdminLayout }     from './views/admin/AdminLayout';
import { AdminDashboard }  from './views/admin/AdminDashboard';
import { AdminAIImport }   from './views/admin/AdminAIImport';
import { AdminCourses }    from './views/admin/AdminCourses';
import { AdminCourseDetail } from './views/admin/AdminCourseDetail';
import { AdminEmployees }  from './views/admin/AdminEmployees';
import { AdminDepartments } from './views/admin/AdminDepartments';
import { ManagerLayout }   from './views/manager/ManagerLayout';
import { ManagerDashboard } from './views/manager/ManagerDashboard';
import { ManagerTeam }     from './views/manager/ManagerTeam';
import { ManagerEmployeeDetail } from './views/manager/ManagerEmployeeDetail';
import { EmployeeLayout }  from './views/employee/EmployeeLayout';
import { EmployeeDashboard } from './views/employee/EmployeeDashboard';
import { CourseViewer }    from './views/employee/CourseViewer';
import { Certificate }     from './views/employee/Certificate';

/** Redirect logged-in users to their role's home page */
function RoleHome() {
  const user = auth.getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')    return <Navigate to="/admin/dashboard"  replace />;
  if (user.role === 'manager')  return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/my-courses" replace />;
}

/** Guard: redirect to /login if not authenticated */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = auth.getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Guard: only admin role */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = auth.getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Guard: only manager role */
function RequireManager({ children }: { children: React.ReactNode }) {
  const user = auth.getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'manager') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* "/" → role-based home */}
        <Route path="/" element={<RoleHome />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ── Admin / Metodist ── */}
        <Route
          path="/admin"
          element={<RequireAdmin><AdminLayout /></RequireAdmin>}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="import"       element={<AdminAIImport />} />
          <Route path="courses"      element={<AdminCourses />} />
          <Route path="courses/:id"  element={<AdminCourseDetail />} />
          <Route path="employees"    element={<AdminEmployees />} />
          <Route path="departments"  element={<AdminDepartments />} />
        </Route>

        {/* ── Manager / Rahbar ── */}
        <Route
          path="/manager"
          element={<RequireManager><ManagerLayout /></RequireManager>}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"              element={<ManagerDashboard />} />
          <Route path="team"                   element={<ManagerTeam />} />
          <Route path="employee/:employeeId"   element={<ManagerEmployeeDetail />} />
        </Route>

        {/* ── Employee / Xodim ── */}
        <Route
          path="/employee"
          element={<RequireAuth><EmployeeLayout /></RequireAuth>}
        >
          <Route index element={<Navigate to="my-courses" replace />} />
          <Route path="my-courses"             element={<EmployeeDashboard />} />
          <Route path="course/:id"             element={<CourseViewer />} />
          <Route path="certificate/:courseId"  element={<Certificate />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
