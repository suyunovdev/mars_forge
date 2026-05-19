export type Lang = 'uz' | 'ru';

const translations = {
  uz: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.aiImport': 'AI Import',
    'nav.courses': 'Kurslar',
    'nav.employees': 'Xodimlar',
    'nav.departments': "Bo'limlar",
    'nav.teamProgress': 'Jamoa progressi',
    'nav.myCourses': 'Mening kurslarim',
    'nav.logout': 'Chiqish',

    // Auth
    'auth.title': 'Tizimga kirish',
    'auth.email': 'Email manzil',
    'auth.password': 'Parol',
    'auth.login': 'Kirish',
    'auth.loggingIn': 'Kirish...',
    'auth.demo': "Demo hisob ma'lumotlari",
    'auth.errNotFound': 'Bunday email manzil topilmadi',
    'auth.errPassword': "Parol noto'g'ri",
    'auth.errSystem': 'Tizimda xato yuz berdi',
    'auth.role.admin': 'Admin',
    'auth.role.manager': 'Rahbar',
    'auth.role.employee': 'Xodim',

    // Common
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor qilish',
    'common.delete': "O'chirish",
    'common.edit': 'Tahrirlash',
    'common.add': "Qo'shish",
    'common.back': '← Orqaga',
    'common.loading': 'Yuklanmoqda...',
    'common.noData': "Ma'lumot yo'q",
    'common.actions': 'Amallar',
    'common.publish': 'Nashr etish',
    'common.unpublish': 'Qoralama',
    'common.published': 'Nashr etilgan',
    'common.draft': 'Qoralama',
    'common.search': 'Qidirish...',
    'common.confirmDelete': "Rostdan ham o'chirib tashlamoqchimisiz?",
    'common.yes': 'Ha',
    'common.no': "Yo'q",

    // Dashboard (Admin)
    'admin.dashboard.title': 'Dashboard',
    'admin.dashboard.employees': 'Jami xodimlar',
    'admin.dashboard.courses': 'Faol kurslar',
    'admin.dashboard.assignments': 'Tayinlashlar',
    'admin.dashboard.avgProgress': "Umumiy o'zlashtirish",
    'admin.dashboard.deptProgress': "Bo'limlar bo'yicha progress",
    'admin.dashboard.people': 'kishi',

    // Courses
    'courses.title': 'Kurslar',
    'courses.new': 'Yangi kurs',
    'courses.name': 'Kurs nomi',
    'courses.status': 'Holati',
    'courses.modules': 'Modullar',
    'courses.date': 'Sana',
    'courses.empty': 'Kurslar mavjud emas. AI Import orqali yarating.',
    'courses.assign': 'Tayinlash',
    'courses.assignTitle': 'Kursni tayinlash',
    'courses.assignTo': 'Tayinlash',
    'courses.toEmployee': 'Xodimga',
    'courses.toDepartment': "Bo'limga",
    'courses.selectEmployee': 'Xodimni tanlang...',
    'courses.selectDepartment': "Bo'limni tanlang...",
    'courses.dueDate': 'Deadline',
    'courses.newTitle': 'Kurs nomi',
    'courses.newDesc': 'Tavsif',
    'courses.createTitle': 'Yangi kurs yaratish',

    // Course Detail
    'courseDetail.modules': 'Modullar',
    'courseDetail.addModule': "Modul qo'shish",
    'courseDetail.addLesson': "Dars qo'shish",
    'courseDetail.moduleName': 'Modul nomi',
    'courseDetail.lessonName': 'Dars nomi',
    'courseDetail.lessonType': 'Dars turi',
    'courseDetail.text': 'Matn',
    'courseDetail.quiz': 'Test',
    'courseDetail.content': 'Kontent (markdown)',
    'courseDetail.questions': 'Savollar',
    'courseDetail.addQuestion': "Savol qo'shish",
    'courseDetail.question': 'Savol',
    'courseDetail.option': 'Variant',
    'courseDetail.correct': "To'g'ri javob",
    'courseDetail.assignments': 'Tayinlashlar',
    'courseDetail.addAssignment': "Tayinlash qo'shish",
    'courseDetail.editLesson': 'Darsni tahrirlash',
    'courseDetail.newLesson': 'Yangi dars',
    'courseDetail.editModule': 'Modulni tahrirlash',
    'courseDetail.descPlaceholder': "Kurs haqida qisqacha ma'lumot...",

    // Employees
    'employees.title': 'Xodimlar',
    'employees.new': 'Yangi xodim',
    'employees.csvImport': 'CSV Import',
    'employees.fullName': 'F.I.O.',
    'employees.email': 'Email',
    'employees.department': "Bo'lim",
    'employees.role': 'Rol',
    'employees.empty': 'Xodimlar mavjud emas.',
    'employees.selectDept': "Bo'limni tanlang...",
    'employees.csvImported': 'ta xodim import qilindi!',
    'employees.editTitle': 'Xodimni tahrirlash',
    'employees.newTitle': "Yangi xodim qo'shish",

    // Departments
    'departments.title': "Bo'limlar",
    'departments.new': "Yangi bo'lim",
    'departments.name': "Bo'lim nomi",
    'departments.count': 'Faol xodimlar',
    'departments.empty': "Bo'limlar mavjud emas.",
    'departments.errHasEmployees': "Ushbu bo'limni o'chirib bo'lmaydi: unga biriktirilgan faol xodimlar mavjud.",
    'departments.editTitle': "Bo'limni tahrirlash",
    'departments.newTitle': "Yangi bo'lim qo'shish",
    'departments.placeholder': "Masalan: IT bo'limi",
    'departments.people': 'kishi',

    // AI Import
    'aiImport.title': 'AI Import',
    'aiImport.upload': 'PDF, Word, PowerPoint fayllarni yuklang',
    'aiImport.generate': 'Hujjatdan kurs yaratish',
    'aiImport.processing': "AI kurs strukturasi o'qimoqda...",
    'aiImport.done': 'Generatsiya muvaffaqiyatli yakunlandi!',
    'aiImport.publish': 'Katalogga nashr etish',
    'aiImport.retry': 'Qayta yuklash',
    'aiImport.preview': 'Kurs strukturasi',
    'aiImport.emptyPreview': "Natija shu yerda ko'rsatiladi",
    'aiImport.noApiKey': "GEMINI_API_KEY sozlanmagan. .env faylga haqiqiy API kalitini kiriting.",
    'aiImport.module': 'Modul',
    'aiImport.selectFile': 'Fayl tanlanmagan',

    // Employee dashboard
    'emp.myCourses': 'Mening kurslarim',
    'emp.mandatory': 'Majburiy',
    'emp.start': "O'qishni boshlash",
    'emp.continue': 'Davom etish',
    'emp.completed': 'Tugatilgan',
    'emp.completed_pct': '% tugatildi',
    'emp.empty': "Sizga tayinlangan kurslar yo'q.",
    'emp.due': 'Deadline',

    // Course Viewer
    'viewer.lesson': 'dars',
    'viewer.prev': 'Oldingi dars',
    'viewer.next': 'Keyingi dars va tugallash',
    'viewer.completeAndNext': 'Tugallash va keyingisi',
    'viewer.back': '← Orqaga',
    'viewer.congrats': 'Tabriklaymiz!',
    'viewer.allDone': 'Kursni muvaffaqiyatli tugatdingiz!',
    'viewer.checkAnswers': 'Javoblarni tekshirish',
    'viewer.quizScore': 'Natija',
    'viewer.correct': "To'g'ri",
    'viewer.wrong': "Noto'g'ri",
    'viewer.selectAnswer': 'Javobni tanlang',
    'viewer.videoLesson': 'Video dars',

    // Video
    'lesson.video': 'Video',

    // AI Tutor
    'tutor.title': 'AI Tutor',
    'tutor.placeholder': 'Savol bering...',
    'tutor.send': 'Yuborish',
    'tutor.welcome': "Salom! Dars bo'yicha savollaringizga javob beraman.",
    'tutor.noApiKey': 'API kalit kerak',
    'tutor.thinking': "O'ylayapman...",

    // Certificate
    'cert.title': 'Sertifikat',
    'cert.subtitle': 'Ushbu sertifikat tasdiqlaydi ki:',
    'cert.completed': 'kursini muvaffaqiyatli tamomladi.',
    'cert.date': 'Sana',
    'cert.score': 'Ball',
    'cert.print': 'Chop etish / PDF saqlash',
    'cert.get': 'Sertifikat olish',
    'cert.notFound': 'Sertifikat topilmadi',
    'cert.back': '← Orqaga',

    // Question types
    'q.multiple_choice': "Ko'p tanlov",
    'q.true_false': "To'g'ri/Noto'g'ri",
    'q.short_answer': 'Qisqa javob',
    'q.matching': 'Moslashtirish',
    'q.ordering': 'Tartibga solish',
    'q.essay': 'Insho',
    'q.trueOption': "To'g'ri",
    'q.falseOption': "Noto'g'ri",
    'q.yourAnswer': 'Javobingiz',
    'q.matchLeft': 'Chap',
    'q.matchRight': "O'ng",
    'q.addPair': "Juft qo'shish",
    'q.addItem': "Element qo'shish",
    'q.moveUp': 'Yuqoriga',
    'q.moveDown': 'Pastga',
    'q.essayPlaceholder': 'Javobingizni yozing...',
    'q.saveEssay': 'Javobni saqlash',
    'q.expectedAnswer': "To'g'ri javob (sistema uchun)",

    // Overdue
    'overdue.label': "Muddati o'tgan",
    'overdue.badge': "⚠️ Muddati o'tgan",
    'overdue.due': 'Muddat',

    // CSV Export
    'export.csv': 'CSV yuklab olish',
    'export.report': 'Hisobot',

    // Employee Detail (Manager)
    'empDetail.title': 'Xodim kartasi',
    'empDetail.courses': 'Kurslar tarixi',
    'empDetail.noCourses': "Tayinlangan kurslar yo'q",
    'empDetail.completedAt': 'Tugallangan sana',
    'empDetail.back': '← Jamoa progressi',

    // Manager
    'manager.dashboard': 'Dashboard',
    'manager.team': "Jamoa a'zolari",
    'manager.department': "Bo'lim",
    'manager.avgProgress': "O'rtacha progress",
    'manager.completed': 'Tugatilgan kurslar',
    'manager.totalEnrollments': 'Jami yozilishlar',
    'manager.teamSize': "Jamoa a'zolari",
    'manager.detail': 'Batafsil →',
    'manager.noCourses': "Kurs yo'q",
    'manager.noTeam': "Bu bo'limda xodimlar yo'q.",
    'manager.assigned': 'ta kurs tayinlangan',
    'manager.teamProgress': 'Jamoa progressi',
    'manager.employee': 'Xodim',

    // Status
    'status.completed': 'Tugatildi',
    'status.in_progress': 'Jarayonda',
    'status.not_started': 'Boshlanmagan',

    // Roles
    'role.admin': 'Admin',
    'role.manager': 'Rahbar',
    'role.employee': 'Xodim',

    // Sidebar brand
    'brand.admin': 'LMS Admin',
    'brand.manager': 'Rahbar paneli',
    'brand.employee': "O'quv portali",

    // Tab filters
    'emp.tab.all': 'Hammasi',
    'emp.tab.inProgress': 'Jarayonda',
    'emp.tab.completed': 'Tugallangan',
    'emp.tab.overdue': "Muddati o'tgan",

    // Manager view
    'manager.viewEmployee': "Ko'rish →",
  },

  ru: {
    // Nav
    'nav.dashboard': 'Главная',
    'nav.aiImport': 'AI Импорт',
    'nav.courses': 'Курсы',
    'nav.employees': 'Сотрудники',
    'nav.departments': 'Отделы',
    'nav.teamProgress': 'Прогресс команды',
    'nav.myCourses': 'Мои курсы',
    'nav.logout': 'Выйти',

    // Auth
    'auth.title': 'Войти в систему',
    'auth.email': 'Email адрес',
    'auth.password': 'Пароль',
    'auth.login': 'Войти',
    'auth.loggingIn': 'Вход...',
    'auth.demo': 'Демо аккаунты',
    'auth.errNotFound': 'Такой email не найден',
    'auth.errPassword': 'Неверный пароль',
    'auth.errSystem': 'Ошибка системы',
    'auth.role.admin': 'Админ',
    'auth.role.manager': 'Руководитель',
    'auth.role.employee': 'Сотрудник',

    // Common
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.add': 'Добавить',
    'common.back': '← Назад',
    'common.loading': 'Загрузка...',
    'common.noData': 'Нет данных',
    'common.actions': 'Действия',
    'common.publish': 'Опубликовать',
    'common.unpublish': 'Черновик',
    'common.published': 'Опубликован',
    'common.draft': 'Черновик',
    'common.search': 'Поиск...',
    'common.confirmDelete': 'Вы уверены, что хотите удалить?',
    'common.yes': 'Да',
    'common.no': 'Нет',

    // Dashboard (Admin)
    'admin.dashboard.title': 'Главная',
    'admin.dashboard.employees': 'Всего сотрудников',
    'admin.dashboard.courses': 'Активных курсов',
    'admin.dashboard.assignments': 'Назначений',
    'admin.dashboard.avgProgress': 'Средний прогресс',
    'admin.dashboard.deptProgress': 'Прогресс по отделам',
    'admin.dashboard.people': 'чел.',

    // Courses
    'courses.title': 'Курсы',
    'courses.new': 'Новый курс',
    'courses.name': 'Название курса',
    'courses.status': 'Статус',
    'courses.modules': 'Модули',
    'courses.date': 'Дата',
    'courses.empty': 'Курсов нет. Создайте через AI Импорт.',
    'courses.assign': 'Назначить',
    'courses.assignTitle': 'Назначить курс',
    'courses.assignTo': 'Назначить',
    'courses.toEmployee': 'Сотруднику',
    'courses.toDepartment': 'Отделу',
    'courses.selectEmployee': 'Выберите сотрудника...',
    'courses.selectDepartment': 'Выберите отдел...',
    'courses.dueDate': 'Дедлайн',
    'courses.newTitle': 'Название курса',
    'courses.newDesc': 'Описание',
    'courses.createTitle': 'Создать новый курс',

    // Course Detail
    'courseDetail.modules': 'Модули',
    'courseDetail.addModule': 'Добавить модуль',
    'courseDetail.addLesson': 'Добавить урок',
    'courseDetail.moduleName': 'Название модуля',
    'courseDetail.lessonName': 'Название урока',
    'courseDetail.lessonType': 'Тип урока',
    'courseDetail.text': 'Текст',
    'courseDetail.quiz': 'Тест',
    'courseDetail.content': 'Контент (markdown)',
    'courseDetail.questions': 'Вопросы',
    'courseDetail.addQuestion': 'Добавить вопрос',
    'courseDetail.question': 'Вопрос',
    'courseDetail.option': 'Вариант',
    'courseDetail.correct': 'Правильный ответ',
    'courseDetail.assignments': 'Назначения',
    'courseDetail.addAssignment': 'Добавить назначение',
    'courseDetail.editLesson': 'Редактировать урок',
    'courseDetail.newLesson': 'Новый урок',
    'courseDetail.editModule': 'Редактировать модуль',
    'courseDetail.descPlaceholder': 'Краткое описание курса...',

    // Employees
    'employees.title': 'Сотрудники',
    'employees.new': 'Новый сотрудник',
    'employees.csvImport': 'CSV Импорт',
    'employees.fullName': 'ФИО',
    'employees.email': 'Email',
    'employees.department': 'Отдел',
    'employees.role': 'Роль',
    'employees.empty': 'Сотрудников нет.',
    'employees.selectDept': 'Выберите отдел...',
    'employees.csvImported': 'сотрудников импортировано!',
    'employees.editTitle': 'Редактировать сотрудника',
    'employees.newTitle': 'Добавить сотрудника',

    // Departments
    'departments.title': 'Отделы',
    'departments.new': 'Новый отдел',
    'departments.name': 'Название отдела',
    'departments.count': 'Активных сотрудников',
    'departments.empty': 'Отделов нет.',
    'departments.errHasEmployees': 'Нельзя удалить отдел: в нём есть активные сотрудники.',
    'departments.editTitle': 'Редактировать отдел',
    'departments.newTitle': 'Добавить новый отдел',
    'departments.placeholder': 'Например: IT отдел',
    'departments.people': 'чел.',

    // AI Import
    'aiImport.title': 'AI Импорт',
    'aiImport.upload': 'Загрузите PDF, Word, PowerPoint файлы',
    'aiImport.generate': 'Создать курс из документа',
    'aiImport.processing': 'AI читает структуру курса...',
    'aiImport.done': 'Генерация успешно завершена!',
    'aiImport.publish': 'Опубликовать в каталог',
    'aiImport.retry': 'Загрузить ещё раз',
    'aiImport.preview': 'Структура курса',
    'aiImport.emptyPreview': 'Результат появится здесь',
    'aiImport.noApiKey': 'GEMINI_API_KEY не настроен. Добавьте настоящий API ключ в файл .env.',
    'aiImport.module': 'Модуль',
    'aiImport.selectFile': 'Файл не выбран',

    // Employee dashboard
    'emp.myCourses': 'Мои курсы',
    'emp.mandatory': 'Обязательный',
    'emp.start': 'Начать обучение',
    'emp.continue': 'Продолжить',
    'emp.completed': 'Завершён',
    'emp.completed_pct': '% завершено',
    'emp.empty': 'Вам не назначены курсы.',
    'emp.due': 'Дедлайн',

    // Course Viewer
    'viewer.lesson': 'урок',
    'viewer.prev': 'Предыдущий урок',
    'viewer.next': 'Следующий урок',
    'viewer.completeAndNext': 'Завершить и далее',
    'viewer.back': '← Назад',
    'viewer.congrats': 'Поздравляем!',
    'viewer.allDone': 'Вы успешно завершили курс!',
    'viewer.checkAnswers': 'Проверить ответы',
    'viewer.quizScore': 'Результат',
    'viewer.correct': 'Правильно',
    'viewer.wrong': 'Неправильно',
    'viewer.selectAnswer': 'Выберите ответ',
    'viewer.videoLesson': 'Видео урок',

    // Video
    'lesson.video': 'Видео',

    // AI Tutor
    'tutor.title': 'AI Тьютор',
    'tutor.placeholder': 'Задайте вопрос...',
    'tutor.send': 'Отправить',
    'tutor.welcome': 'Привет! Отвечу на ваши вопросы по уроку.',
    'tutor.noApiKey': 'Нужен API ключ',
    'tutor.thinking': 'Думаю...',

    // Certificate
    'cert.title': 'Сертификат',
    'cert.subtitle': 'Настоящий сертификат подтверждает, что:',
    'cert.completed': 'успешно завершил(а) курс.',
    'cert.date': 'Дата',
    'cert.score': 'Балл',
    'cert.print': 'Распечатать / Сохранить PDF',
    'cert.get': 'Получить сертификат',
    'cert.notFound': 'Сертификат не найден',
    'cert.back': '← Назад',

    // Question types
    'q.multiple_choice': 'Множественный выбор',
    'q.true_false': 'Верно/Неверно',
    'q.short_answer': 'Краткий ответ',
    'q.matching': 'Сопоставление',
    'q.ordering': 'Упорядочивание',
    'q.essay': 'Эссе',
    'q.trueOption': 'Верно',
    'q.falseOption': 'Неверно',
    'q.yourAnswer': 'Ваш ответ',
    'q.matchLeft': 'Левая',
    'q.matchRight': 'Правая',
    'q.addPair': 'Добавить пару',
    'q.addItem': 'Добавить элемент',
    'q.moveUp': 'Вверх',
    'q.moveDown': 'Вниз',
    'q.essayPlaceholder': 'Напишите ваш ответ...',
    'q.saveEssay': 'Сохранить ответ',
    'q.expectedAnswer': 'Правильный ответ (для системы)',

    // Overdue
    'overdue.label': 'Просрочено',
    'overdue.badge': '⚠️ Просрочено',
    'overdue.due': 'Срок',

    // CSV Export
    'export.csv': 'Скачать CSV',
    'export.report': 'Отчёт',

    // Employee Detail (Manager)
    'empDetail.title': 'Карточка сотрудника',
    'empDetail.courses': 'История курсов',
    'empDetail.noCourses': 'Нет назначенных курсов',
    'empDetail.completedAt': 'Дата завершения',
    'empDetail.back': '← Прогресс команды',

    // Manager
    'manager.dashboard': 'Главная',
    'manager.team': 'Члены команды',
    'manager.department': 'Отдел',
    'manager.avgProgress': 'Средний прогресс',
    'manager.completed': 'Завершённых курсов',
    'manager.totalEnrollments': 'Всего записей',
    'manager.teamSize': 'Членов команды',
    'manager.detail': 'Подробнее →',
    'manager.noCourses': 'Курсов нет',
    'manager.noTeam': 'В этом отделе нет сотрудников.',
    'manager.assigned': 'курсов назначено',
    'manager.teamProgress': 'Прогресс команды',
    'manager.employee': 'Сотрудник',

    // Status
    'status.completed': 'Завершён',
    'status.in_progress': 'В процессе',
    'status.not_started': 'Не начат',

    // Roles
    'role.admin': 'Админ',
    'role.manager': 'Руководитель',
    'role.employee': 'Сотрудник',

    // Sidebar brand
    'brand.admin': 'LMS Админ',
    'brand.manager': 'Панель руководителя',
    'brand.employee': 'Учебный портал',

    // Tab filters
    'emp.tab.all': 'Все',
    'emp.tab.inProgress': 'В процессе',
    'emp.tab.completed': 'Завершённые',
    'emp.tab.overdue': 'Просроченные',

    // Manager view
    'manager.viewEmployee': 'Смотреть →',
  },
} as const;

type TranslationKey = keyof typeof translations.uz;

export function getTranslation(lang: Lang, key: TranslationKey): string {
  return (translations[lang] as Record<string, string>)[key] ?? (translations.uz as Record<string, string>)[key] ?? key;
}

export { type TranslationKey };
export default translations;
