import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2, AlertTriangle, FileText, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { generateCourseFromFile, CourseStructure, getStoredApiKey } from '../../services/gemini';
import { db } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

type Status = 'idle' | 'processing' | 'done' | 'error';

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
];

const ACCEPTED_EXTS = ['.pdf', '.docx', '.doc', '.pptx', '.ppt'];

function isAcceptedFile(f: File): boolean {
  const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '');
  return ACCEPTED_EXTS.includes(ext) || ACCEPTED_MIME_TYPES.includes(f.type);
}

export function AdminAIImport() {
  const { t } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CourseStructure | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const hasApiKey = !!getStoredApiKey();

  function handleFileSelect(f: File | null) {
    if (!f) return;
    if (!isAcceptedFile(f)) {
      setErrorMsg('Faqat PDF, Word (.docx, .doc) va PowerPoint (.pptx, .ppt) fayllari qabul qilinadi');
      return;
    }
    setFile(f);
    setErrorMsg('');
    setResult(null);
    setStatus('idle');
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0] ?? null;
    handleFileSelect(f);
  }

  async function handleGenerate() {
    if (!file) return;
    setStatus('processing');
    setErrorMsg('');
    try {
      const courseData = await generateCourseFromFile(file);
      setResult(courseData);
      setStatus('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Noma'lum xato";
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  function handleSave() {
    if (!result) return;
    db.courses.createFromAI(result);
    navigate('/admin/courses');
  }

  function handleReset() {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('aiImport.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">PDF, Word, PowerPoint hujjatlardan avtomatik kurs strukturasi yaratish</p>
      </div>

      {/* API Key warning */}
      {!hasApiKey && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Gemini API kaliti topilmadi</p>
            <p className="text-xs text-amber-400 mt-1">
              Admin → <a href="/admin/settings" className="underline font-medium">Sozlamalar</a> bo'limida API kalitingizni kiriting.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t('aiImport.upload')}</h2>

          {status === 'idle' || status === 'error' ? (
            <div className="flex-1 flex flex-col">
              <input
                type="file"
                ref={fileRef}
                accept=".pdf,.docx,.doc,.pptx,.ppt"
                className="hidden"
                onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`flex-1 min-h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition mb-4 ${
                  dragOver
                    ? 'border-red-500 bg-red-500/10'
                    : file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {file ? (
                  <>
                    <FileText size={36} className="text-emerald-400 mb-3" />
                    <p className="text-sm font-medium text-emerald-300">{file.name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                  </>
                ) : (
                  <>
                    <UploadCloud size={36} className="text-gray-400 dark:text-slate-500 mb-3" />
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">PDF, Word, PowerPoint faylni shu yerga tashlang</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">yoki bosib tanlang</p>
                    <p className="text-xs text-gray-300 dark:text-slate-600 mt-2">.pdf · .docx · .doc · .pptx · .ppt</p>
                  </>
                )}
              </div>

              {status === 'error' && errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!file || !hasApiKey}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold transition"
              >
                {t('aiImport.generate')}
              </button>
            </div>
          ) : status === 'processing' ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 size={48} className="text-red-500 animate-spin mb-4" />
              <p className="text-gray-900 dark:text-white font-medium">{t('aiImport.processing')}</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">Bu 10-30 soniya davom etishi mumkin</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <CheckCircle size={48} className="text-emerald-400 mb-4" />
              <p className="text-gray-900 dark:text-white font-semibold mb-2">{t('aiImport.done')}</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 text-center">{t('aiImport.preview')}</p>

              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition mb-3"
              >
                {t('aiImport.publish')}
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium transition"
              >
                {t('aiImport.retry')}
              </button>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto max-h-[600px]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t('aiImport.preview')}</h2>

          {result ? (
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">{result.description}</p>
              </div>

              <div className="space-y-4">
                {result.modules.map((mod, mi) => (
                  <div key={mi} className="rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-100/80 dark:bg-slate-800/50 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-slate-800">
                      <span className="text-xs font-bold text-gray-400 dark:text-slate-500">M{mi + 1}</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{mod.title}</span>
                    </div>
                    <ul className="divide-y divide-gray-200/60 dark:divide-slate-700/50">
                      {mod.lessons.map((les, li) => (
                        <li key={li} className="flex items-center gap-3 px-4 py-2.5">
                          <BookOpen size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-slate-300">{les.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300 dark:text-slate-600">
              <FileText size={36} className="mb-3" />
              <p className="text-sm">{t('aiImport.emptyPreview')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
