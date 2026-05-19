import React, { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, UploadCloud, X } from 'lucide-react';
import { db, Employee, Department, Role } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

type FormData = {
  full_name: string;
  email: string;
  password: string;
  role: Role;
  department_id: string;
};

const emptyForm: FormData = { full_name: '', email: '', password: '', role: 'employee', department_id: '' };

export function AdminEmployees() {
  const { t } = useApp();
  const [employees, setEmployees] = useState<Employee[]>(() => db.employees.list());
  const departments: Department[] = db.departments.list();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [csvNotification, setCsvNotification] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() {
    setEmployees(db.employees.list());
  }

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(emp: Employee) {
    setEditingId(emp.id);
    setForm({ full_name: emp.full_name, email: emp.email, password: emp.password, role: emp.role, department_id: emp.department_id ?? '' });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      db.employees.update(editingId, {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        department_id: form.department_id || undefined,
      });
      notify("Xodim ma'lumotlari yangilandi");
    } else {
      db.employees.create({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        department_id: form.department_id || undefined,
      });
      notify("Yangi xodim qo'shildi");
    }
    setShowModal(false);
    setEditingId(null);
    refresh();
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      db.employees.softDelete(id);
      setDeleteConfirm(null);
      refresh();
      notify("Xodim o'chirildi");
    } else {
      setDeleteConfirm(id);
    }
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const imported = db.employees.importCSV(text);
      refresh();
      setCsvNotification(`${imported.length} ${t('employees.csvImported')}`);
      setTimeout(() => setCsvNotification(''), 3000);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function getDeptName(deptId?: string) {
    if (!deptId) return '—';
    return departments.find(d => d.id === deptId)?.name ?? '—';
  }

  const roleColors: Record<Role, string> = {
    admin: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    manager: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    employee: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };
  const roleLabels: Record<Role, string> = {
    admin: t('role.admin'),
    manager: t('role.manager'),
    employee: t('role.employee'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employees.title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{employees.length} ta faol xodim</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium transition"
          >
            <UploadCloud size={16} /> {t('employees.csvImport')}
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
          >
            <Plus size={16} /> {t('employees.new')}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {notification}
        </div>
      )}
      {csvNotification && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm">
          {csvNotification}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-100/80 dark:bg-slate-800/50">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('employees.fullName')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('employees.email')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('employees.department')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('employees.role')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{emp.full_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{emp.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">{emp.email}</td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">{getDeptName(emp.department_id)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColors[emp.role]}`}>
                    {roleLabels[emp.role]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200 transition">
                      <Pencil size={15} />
                    </button>
                    {deleteConfirm === emp.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(emp.id)} className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition">
                          {t('common.yes')}
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold transition">
                          {t('common.no')}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(emp.id)} className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                  {t('employees.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {editingId ? t('employees.editTitle') : t('employees.newTitle')}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{t('employees.fullName')}</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{t('employees.email')}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">Parol</label>
                <input
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? "O'zgartirmaslik uchun bo'sh qoldiring" : ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{t('employees.department')}</label>
                <select
                  value={form.department_id}
                  onChange={e => setForm({ ...form, department_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm"
                >
                  <option value="">— Tanlang —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{t('employees.role')}</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm"
                >
                  <option value="employee">{t('role.employee')}</option>
                  <option value="manager">{t('role.manager')}</option>
                  <option value="admin">{t('role.admin')}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition">
                  {t('common.save')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium text-sm transition">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
