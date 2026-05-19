import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { auth, db, Certificate as CertificateType, Course, Employee } from '../../store/db';
import { useApp } from '../../contexts/AppContext';

export function Certificate() {
  const { t } = useApp();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const user = auth.getUser();

  const [cert, setCert] = useState<CertificateType | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (!user || !courseId) { navigate('/employee/my-courses'); return; }
    const certificate = db.certificates.getByUserAndCourse(user.id, courseId);
    if (!certificate) {
      navigate('/employee/my-courses');
      return;
    }
    setCert(certificate);
    const foundCourse = db.courses.find(courseId);
    setCourse(foundCourse);
    const emp = db.employees.find(user.id);
    setEmployee(emp);
  }, [user, courseId]);

  if (!cert || !course || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #certificate-root { display: block !important; }
        }
      `}</style>

      {/* Screen wrapper */}
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
        {/* Back button (hidden on print) */}
        <div className="w-full max-w-3xl mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate('/employee/my-courses')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition"
          >
            {t('cert.back')}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
          >
            {t('cert.print')}
          </button>
        </div>

        {/* Certificate */}
        <div
          id="certificate-root"
          className="w-full max-w-3xl bg-white border-4 border-double border-amber-400 rounded-2xl p-10 md:p-16 shadow-2xl print:shadow-none print:border-amber-400 print:rounded-none print:w-full print:max-w-none print:p-12"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-300 mb-6">
              <span className="text-4xl">🏆</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-600 tracking-widest uppercase mb-2">
              MARS FORGE
            </h1>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wider uppercase px-4">
                {t('cert.title')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-center text-gray-500 text-base mb-8 italic">
            {t('cert.subtitle')}
          </p>

          {/* Recipient name */}
          <div className="text-center mb-8">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 border-b-2 border-amber-400 pb-3 inline-block px-8">
              {employee.full_name}
            </p>
          </div>

          {/* Course name */}
          <div className="text-center mb-10">
            <p className="text-lg text-gray-600 mb-2">&ldquo;</p>
            <p className="text-xl md:text-2xl font-semibold text-gray-800 italic px-8">
              {course.title}
            </p>
            <p className="text-lg text-gray-600 mt-2">&rdquo;</p>
            <p className="text-base text-gray-600 mt-3">{t('cert.completed')}</p>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between pt-8 border-t-2 border-dashed border-amber-200">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('cert.date')}</p>
              <p className="text-sm font-semibold text-gray-700">{issuedDate}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-amber-400 flex items-center justify-center mx-auto mb-1">
                <span className="text-xl font-bold text-amber-600">MF</span>
              </div>
              <p className="text-xs text-gray-400">Mars Forge LMS</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('cert.score')}</p>
              <p className="text-2xl font-bold text-amber-600">{cert.score}%</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
