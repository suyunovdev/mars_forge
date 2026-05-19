import { useState } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../../services/gemini';

export function AdminSettings() {
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setStoredApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const masked = apiKey ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 8)) : '';

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sozlamalar</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          AI xizmatlarini sozlash
        </p>
      </div>

      {/* Gemini API Key card */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <KeyRound size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Gemini API Kaliti</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              AI kurs import va AI Tutor ishlashi uchun kerak
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mb-4 p-3 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 space-y-1">
          <p>1. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">Google AI Studio <ExternalLink size={10} /></a> saytiga kiring</p>
          <p>2. "Create API Key" tugmasini bosing</p>
          <p>3. Kalitni nusxalab quyidagi maydonga joylashtiring</p>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setSaved(false); }}
            placeholder="AIza..."
            className="w-full pr-10 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm font-mono placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition"
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Status */}
        {getStoredApiKey() && !saved && (
          <p className="text-xs text-emerald-500 mb-3 flex items-center gap-1.5">
            <CheckCircle size={12} />
            Kalit saqlangan: <span className="font-mono">{masked}</span>
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Saqlandi' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}
