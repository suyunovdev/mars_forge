import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { db, Department } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

type FormData = { name: string };
const emptyForm: FormData = { name: '' };

export function AdminDepartments() {
  const { t } = useApp();
  const [departments, setDepartments] = useState<Department[]>(() => db.departments.list());
  const employees = db.employees.list();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  function refresh() {
    setDepartments(db.departments.list());
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

  function openEdit(dep: Department) {
    setEditingId(dep.id);
    setForm({ name: dep.name });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      db.departments.update(editingId, { name: form.name });
      notify("Bo'lim yangilandi");
    } else {
      db.departments.create({ name: form.name, org_id: 'org1' });
      notify("Yangi bo'lim qo'shildi");
    }
    setShowModal(false);
    setEditingId(null);
    refresh();
  }

  function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    const empCount = employees.filter(e => e.department_id === id).length;
    if (empCount > 0) {
      setDeleteError(prev => ({ ...prev, [id]: t('departments.errHasEmployees') }));
      setDeleteConfirm(null);
      return;
    }
    db.departments.delete(id);
    setDeleteConfirm(null);
    refresh();
    notify("Bo'lim o'chirildi");
  }

  function getEmpCount(deptId: string) {
    return employees.filter(e => e.department_id === deptId).length;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('departments.title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{departments.length} ta bo'lim</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
        >
          <Plus size={16} /> {t('departments.new')}
        </button>
      </div>

      {notification && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
          {notification}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-100/80 dark:bg-slate-800/50">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('departments.name')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('departments.count')}</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {departments.map(dep => (
              <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{dep.name}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400">
                    {getEmpCount(dep.id)} {t('departments.people')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {deleteError[dep.id] && (
                      <span className="text-xs text-red-400 mr-2 max-w-48 text-right">{deleteError[dep.id]}</span>
                    )}
                    <button onClick={() => openEdit(dep)} className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200 transition">
                      <Pencil size={15} />
                    </button>
                    {deleteConfirm === dep.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(dep.id)} className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition">
                          {t('common.yes')}
                        </button>
                        <button onClick={() => { setDeleteConfirm(null); setDeleteError(prev => { const n = { ...prev }; delete n[dep.id]; return n; }); }} className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold transition">
                          {t('common.no')}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { handleDelete(dep.id); setDeleteError(prev => { const n = { ...prev }; delete n[dep.id]; return n; }); }} className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                  {t('departments.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {editingId ? t('departments.editTitle') : t('departments.newTitle')}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">{t('departments.name')}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ name: e.target.value })}
                  placeholder={t('departments.placeholder')}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
              <div className="flex gap-3">
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
