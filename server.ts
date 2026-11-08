import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// ---------- Authentication Middleware & Routes ----------
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './src/validation.ts';
import { userStore } from './src/store/userStore.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existing = userStore.getByEmail(parsed.email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = { id: Date.now().toString(), email: parsed.email, passwordHash };
    userStore.add(user);
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = userStore.getByEmail(parsed.email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ success: true, token });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.parse(req.body);
    const user = userStore.getByEmail(parsed.email);
    if (!user) {
      // Respond with success to avoid email enumeration
      return res.json({ success: true });
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    userStore.update(user.email, { resetToken: token, resetTokenExpires: Date.now() + 60 * 60 * 1000 });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }
});
  try {
    const parsed = forgotPasswordSchema.parse(req.body);
    const user = userStore.getByEmail(parsed.email);
    if (!user) {
      // Respond with success to avoid email enumeration
      return res.json({ success: true });
    }
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1h' });
    userStore.update(user.email, { resetToken: token, resetTokenExpires: Date.now() + 60 * 60 * 1000 });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const parsed = resetPasswordSchema.parse(req.body);
    const payload: any = jwt.verify(parsed.token, JWT_SECRET);
    const user = userStore.getByEmail(payload.email);
    if (!user || user.resetToken !== parsed.token || (user.resetTokenExpires && user.resetTokenExpires < Date.now())) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }
    const newHash = await bcrypt.hash(parsed.newPassword, 10);
    userStore.update(user.email, { passwordHash: newHash, resetToken: undefined, resetTokenExpires: undefined });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }
});
  try {
    const parsed = resetPasswordSchema.parse(req.body);
    const payload: any = jwt.verify(parsed.token, JWT_SECRET);
    const user = Array.from((await import('./src/store/userStore.js')).userStore.getByEmail?.(payload.email ?? '') ); // fallback
    // Simplify: find user by id stored in token
    const storedUser = Array.from((await import('./src/store/userStore.js')).userStore).find(([,u])=>u.id===payload.sub);
    // Actually retrieve via map
    const targetUser = storedUser ? storedUser[1] : null;
    if (!targetUser || targetUser.resetToken !== parsed.token || (targetUser.resetTokenExpires && targetUser.resetTokenExpires < Date.now())) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }
    const newHash = await bcrypt.hash(parsed.newPassword, 10);
    userStore.update(targetUser.email, { passwordHash: newHash, resetToken: undefined, resetTokenExpires: undefined });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }
});

// -------------------------------------------------------
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Simple in‑memory analytics
const analytics = {
  pageViews: 0,
  quizRequests: 0,
};

// Increment page view metric for every GET request (including static assets)
app.use((req, res, next) => {
  if (req.method === 'GET') {
    analytics.pageViews++;
  }
  next();
});

// AI Quiz endpoint
app.post('/api/ai/quiz', async (req, res) => {
  try {
    const { vocab } = req.body; // Expect array of strings
    if (!Array.isArray(vocab) || vocab.length === 0) {
      return res.status(400).json({ success: false, error: 'vocab list required' });
    }
    analytics.quizRequests++;
    const prompt = `Generate 5 multiple‑choice quiz questions (A‑D) for the following vocabulary words. For each question provide the correct answer and three plausible distractors. Return a JSON array with objects {question, options, answer}. Words: ${vocab.join(', ')}`;
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const questions = JSON.parse(text);
    res.json({ success: true, questions });
  } catch (e:any) {
    console.error('Quiz generation error', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Admin metrics endpoint
app.get('/api/admin/metrics', (req, res) => {
  res.json({ success: true, metrics: analytics });
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize GoogleGenAI client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ARCHITECT_SYSTEM_INSTRUCTION = `Bạn là "Global Success AI Vocabulary Architect" – Chuyên gia Sư phạm AI và Kiến trúc sư Hệ thống Học tập Thích ứng cho học sinh khối THCS (lớp 6, 7, 8, 9) chinh phục chương trình tiếng Anh Global Success.

SỨ MỆNH & NGUYÊN TẮC:
1. Bám sát chương trình Global Success (Lớp 6, 7, 8, 9: các Unit như My New School, Healthy Living, Community Service, Custom and Traditions, English in the World, v.v.).
2. Cá nhân hóa lộ trình bằng Spaced Repetition (Lặp lại ngắt quãng) và Forgetting Curve (Biểu đồ quên của Ebbinghaus). Đánh giá mức độ thuần thục 1-5 sao.
3. Trực quan hóa kiến thức: Cung cấp mô tả mô hình 3D / AR Prompt sống động (màu sắc, hành động, hình khối) cho mỗi từ vựng để hỗ trợ công nghệ AR Metaverse.
4. Ngữ cảnh hóa tối đa (Contextual Intelligence): Mỗi từ vựng PHẢI có 01 đoạn trích (quote) từ văn hóa đại chúng (phim Marvel, Disney, Pixar, Harry Potter, ca khúc Taylor Swift, Ed Sheeran, Billie Eilish, v.v.) kèm nguồn rõ ràng.
5. Quy tắc Mnemonics & Mind-map: Với từ khó, bắt buộc có mẹo ghi nhớ (Mnemonic Hint qua liên tưởng âm thanh tương tự hoặc hình ảnh vui nhộn) và Mind-map Link (từ đồng nghĩa, trái nghĩa, từ loại liên quan).
6. Chuẩn hóa phát âm (Feedback Loop): Nhận xét chi tiết về trọng âm (stress), âm cuối (ending sounds như /s/, /z/, /t/, /d/, /θ/, /ʃ/), và ngữ điệu (intonation lên/xuống giọng).
7. Tone & Persona: Năng động (Energetic), Truyền cảm hứng (Inspirational), Thấu hiểu (Empathetic), Gen Z-friendly. Sử dụng song ngữ Anh - Việt linh hoạt: giải thích bằng tiếng Việt thân thiện, ví dụ và ngữ cảnh bằng tiếng Anh chuẩn xác.`;

// Endpoint 1: Smart Scan / Extract Vocabulary
app.post('/api/scan-vocab', async (req, res) => {
  try {
    const { text, imageBase64, grade, unitTopic } = req.body;

    const parts: any[] = [];
    if (imageBase64) {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      });
    }

    const promptText = `Hãy phân tích nội dung hình ảnh hoặc đoạn văn bản sau từ sách giáo khoa tiếng Anh Global Success (Khối THCS: Lớp ${grade || '6-9'}, Chủ đề: ${unitTopic || 'Chung'}).
Trích xuất hoặc phân tích các từ vựng trọng tâm. Với mỗi từ vựng, cung cấp đầy đủ:
- Word (từ gốc và từ loại)
- IPA (phiên âm quốc tế chuẩn Anh - Anh hoặc Anh - Mỹ)
- Meaning (nghĩa tiếng Việt ngắn gọn, dễ hiểu cho lứa tuổi 11-15)
- GlobalSuccessContext (tên Unit và Lớp tương ứng theo chuẩn SGK Global Success)
- ARPrompt (mô tả chi tiết vật thể 3D / hoạt cảnh AR sẽ hiển thị khi quét từ này)
- PopCultureExample (câu trích dẫn hoặc câu ví dụ trendy từ phim bom tấn Marvel/Disney/Harry Potter hoặc bài hát Taylor Swift/nhạc US-UK)
- PopCultureSource (tên phim, bài hát hoặc nhân vật nổi tiếng)
- MnemonicHint (mẹo ghi nhớ sáng tạo, vui nhộn theo phương pháp bắc cầu âm thanh tương tự hoặc câu chuyện ngắn)
- MindMapLinks (danh sách 3-5 từ liên quan: từ đồng nghĩa, trái nghĩa, collocations hay gặp trong bài thi)
- DifficultyLevel (1 đến 5 sao)
- CommonMistake (lỗi phát âm hoặc ngữ pháp học sinh Việt Nam hay mắc phải)

Đoạn văn bản đầu vào:
"${text || 'Hãy đề xuất 3-4 từ vựng đặc sắc tiêu biểu cho chủ đề này'}"`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: ARCHITECT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Danh sách các thẻ từ vựng Global Success được cấu trúc hóa',
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              partOfSpeech: { type: Type.STRING },
              ipa: { type: Type.STRING },
              meaning: { type: Type.STRING },
              globalSuccessContext: { type: Type.STRING },
              arPrompt: { type: Type.STRING },
              popCultureExample: { type: Type.STRING },
              popCultureSource: { type: Type.STRING },
              mnemonicHint: { type: Type.STRING },
              mindMapLinks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              difficultyLevel: { type: Type.INTEGER },
              commonMistake: { type: Type.STRING },
            },
            required: [
              'word',
              'partOfSpeech',
              'ipa',
              'meaning',
              'globalSuccessContext',
              'arPrompt',
              'popCultureExample',
              'popCultureSource',
              'mnemonicHint',
              'mindMapLinks',
              'difficultyLevel',
            ],
          },
        },
      },
    });

    const jsonText = response.text || '[]';
    const vocabList = JSON.parse(jsonText);
    res.json({ success: true, vocabulary: vocabList });
  } catch (error: any) {
    console.error('Scan Vocab Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Có lỗi xảy ra khi phân tích từ vựng với Gemini.',
    });
  }
});

// Endpoint 2: AI Pronunciation & Intonation Analyzer
app.post('/api/analyze-pronunciation', async (req, res) => {
  try {
    const { word, ipa, userSpokenText, confidence, audioMetrics } = req.body;

    const prompt = `Phân tích phát âm của học sinh THCS cho từ/cụm từ tiếng Anh sau:
Từ mục tiêu: "${word}"
Phiên âm chuẩn IPA: "${ipa}"
Nội dung giọng nói của học sinh nhận diện được: "${userSpokenText || ''}"
Độ chuẩn xác ghi nhận từ bộ thu âm: ${confidence ? Math.round(confidence * 100) : 85}%
Ghi chú âm thanh: ${audioMetrics || 'Học sinh phát âm qua micro trên trình duyệt'}

Hãy đóng vai Global Success AI Vocabulary Architect và phản hồi theo quy tắc chuẩn:
- Không chỉ báo Đúng/Sai. Phải chỉ rõ vị trí âm tiết cần nhấn trọng âm (Stress), các âm cuối /s/, /ed/, /t/, /θ/, /dʒ/ học sinh Việt Nam hay nuốt âm.
- Đưa ra điểm phát âm (Pronunciation Score 0-100).
- Đưa ra Mastery Level hiện tại (%) dự tính.
- Đưa ra thời gian ôn tập tiếp theo (Next Review) theo thuật toán Spaced Repetition (ví dụ: "Sau 4 giờ", "Ngày mai lúc 08:00", "Sau 3 ngày").
- Lời nhận xét khích lệ đầy phong cách Gen-Z (Feedback Note).
- Luyện tập ngữ điệu (Intonation Tip).
- Phân tích chi tiết từng âm vị (Phoneme Assessment) liệt kê các âm đã đạt và âm cần cải thiện.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ARCHITECT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pronunciationScore: { type: Type.INTEGER },
            masteryLevel: { type: Type.INTEGER },
            stressFeedback: { type: Type.STRING },
            endingSoundsFeedback: { type: Type.STRING },
            intonationTip: { type: Type.STRING },
            mentorComment: { type: Type.STRING },
            nextReview: { type: Type.STRING },
            xpGained: { type: Type.INTEGER },
            phonemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sound: { type: Type.STRING },
                  status: { type: Type.STRING, description: '"perfect" | "needs-work" | "good"' },
                  note: { type: Type.STRING },
                },
              },
            },
          },
          required: [
            'pronunciationScore',
            'masteryLevel',
            'stressFeedback',
            'endingSoundsFeedback',
            'mentorComment',
            'nextReview',
            'xpGained',
          ],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, feedback: result });
  } catch (error: any) {
    console.error('Pronunciation Feedback Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi khi phân tích phát âm.',
    });
  }
});

// Endpoint 3: Interactive Mentor Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentWord, grade } = req.body;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    if (currentWord) {
      formattedContents.unshift({
        role: 'user',
        parts: [
          {
            text: `[Context: Học sinh đang học lớp ${grade || '7'}, đang xem xét từ vựng: "${currentWord}"]`,
          },
        ],
      });
      formattedContents.unshift({
        role: 'model',
        parts: [
          {
            text: `Đã rõ context từ vựng "${currentWord}" và khối THCS! Mình sẵn sàng hỗ trợ các bạn một cách sinh động nhất!`,
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: ARCHITECT_SYSTEM_INSTRUCTION + '\nLuôn xưng hô thân mật (Thầy/Cô Mentor - các bạn/em), tràn đầy năng lượng, chuẩn ngữ pháp SGK Global Success.',
      },
    });

    res.json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi trò chuyện với AI Architect.',
    });
  }
});

// Endpoint 4: PvP Arena Battle Question Generator
app.post('/api/generate-pvp', async (req, res) => {
  try {
    const { grade, unit, opponentName } = req.body;

    const prompt = `Tạo một bộ 4 câu hỏi trắc nghiệm Đấu trường PvP từ vựng tiếng Anh theo chương trình Global Success Lớp ${grade || '7'} ${unit ? `(${unit})` : ''}.
Mỗi câu hỏi phải thử thách về:
1. Từ vựng trong ngữ cảnh thực tế hoặc câu thoại pop-culture
2. Trọng âm / phát âm
3. Collocation hoặc thành ngữ thông dụng trong bài học
4. Mẹo đoán nghĩa hoặc phản xạ nhanh

Tạo các lựa chọn bẫy thông minh, giải thích ngắn gọn, và số điểm XP thưởng khi trả lời đúng tốc độ.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ARCHITECT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              contextQuote: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              targetWord: { type: Type.STRING },
              timeLimitSeconds: { type: Type.INTEGER },
              xpReward: { type: Type.INTEGER },
            },
            required: ['question', 'options', 'correctIndex', 'explanation', 'targetWord'],
          },
        },
      },
    });

    const questions = JSON.parse(response.text || '[]');
    res.json({ success: true, questions });
  } catch (error: any) {
    console.error('PvP Generator Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi tạo thử thách PvP.',
    });
  }
});

// Setup Vite middleware for development or serve static in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Global Success AI Architect Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
