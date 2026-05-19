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

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'GEMINI_API_KEY topilmadi. Iltimos, .env faylida GEMINI_API_KEY=your_key_here qo\'ying va loyihani qayta ishga tushiring.'
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

export async function generateCourseFromPdf(file: File): Promise<CourseStructure> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const base64Data = await fileToBase64(file);

  const prompt = `Siz professional ta'lim kontent mutaxassisisiz. Quyidagi PDF hujjatni tahlil qilib, undan korporativ o'quv kursi strukturasini yarating.

Talablar:
1. Kurs nomini PDF mazmuniga asoslangan holda o'zbek tilida yozing
2. Kursni 2-4 ta mantiqiy modulga bo'ling
3. Har bir modulda 2-4 ta dars bo'lsin
4. Har bir dars matnini PDF dan olingan ma'lumotlarga asoslab yozing (o'zbek tilida)
5. Dars mazmunini markdown formatida yozing
6. Professional va tushunarli tilda yozing

Faqat strukturalangan JSON qaytaring, boshqa hech narsa yozmang.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
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
      },
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
