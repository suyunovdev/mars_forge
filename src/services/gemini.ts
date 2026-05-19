import { GoogleGenAI, Type } from '@google/genai';

export interface CourseStructure {
  title: string;
  description: string;
  modules: {
    title: string;
    lessons: {
      title: string;
      content: string;
    }[];
  }[];
}

export function getStoredApiKey(): string {
  return localStorage.getItem('lms_gemini_key') ?? '';
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem('lms_gemini_key', key.trim());
}

function getApiKey(): string {
  const key = getStoredApiKey();
  if (!key) {
    throw new Error(
      'Gemini API kaliti topilmadi. Admin → Sozlamalar bo\'limida API kalitingizni kiriting.'
    );
  }
  return key;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error('Faylni o\'qishda xato yuz berdi'));
    reader.readAsDataURL(file);
  });
}

function getMimeType(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
  };
  return mimeMap[ext] ?? file.type ?? 'application/octet-stream';
}

const courseResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ['title', 'content'],
            },
          },
        },
        required: ['title', 'lessons'],
      },
    },
  },
  required: ['title', 'description', 'modules'],
};

const coursePrompt = `Siz professional ta'lim kontent mutaxassisisiz. Quyidagi hujjatni tahlil qilib, undan korporativ o'quv kursi strukturasini yarating.

Talablar:
1. Kurs nomini hujjat mazmuniga asoslangan holda o'zbek tilida yozing
2. Kursni 2-4 ta mantiqiy modulga bo'ling
3. Har bir modulda 2-4 ta dars bo'lsin
4. Har bir dars matnini hujjatdan olingan ma'lumotlarga asoslab yozing (o'zbek tilida)
5. Dars mazmunini markdown formatida yozing
6. Professional va tushunarli tilda yozing

Faqat strukturalangan JSON qaytaring, boshqa hech narsa yozmang.`;

export async function generateCourseFromPdf(file: File): Promise<CourseStructure> {
  return generateCourseFromFile(file);
}

export async function generateCourseFromFile(file: File): Promise<CourseStructure> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const base64Data = await fileToBase64(file);
  const mimeType = getMimeType(file);

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: coursePrompt,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: courseResponseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('AI dan javob olishda xato yuz berdi');
  }

  try {
    const parsed = JSON.parse(text) as CourseStructure;
    return parsed;
  } catch {
    throw new Error('AI javobini qayta ishlashda xato: ' + text.slice(0, 200));
  }
}

export async function generateTutorResponse(
  lessonTitle: string,
  lessonContent: string,
  courseTitle: string,
  history: { role: 'user' | 'model'; text: string }[],
  userMessage: string
): Promise<string> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `Siz korporativ o'quv platformasidagi AI tutorsiz. Faqat joriy dars mavzusi bo'yicha savollarni javoblang. O'zbek tilida javob bering.

Kurs: ${courseTitle}
Dars: ${lessonTitle}
Dars matni:
${lessonContent?.slice(0, 2000) ?? ''}`;

  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
    // Include system context as first user message
    {
      role: 'user',
      parts: [{ text: systemInstruction }],
    },
    {
      role: 'model',
      parts: [{ text: 'Tushundim. Men ushbu dars bo\'yicha savollaringizga javob beraman.' }],
    },
    // Include history
    ...history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    // Current user message
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents,
  });

  const text = response.text;
  if (!text) {
    throw new Error('AI dan javob olishda xato yuz berdi');
  }

  return text;
}
