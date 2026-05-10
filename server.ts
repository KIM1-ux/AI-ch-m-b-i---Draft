import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-do-not-use-in-prod";

// Mock Database Schema
type UserRole = 'student' | 'teacher';
type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: number;
};

type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

type Document = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: DocumentStatus;
  is_active: boolean;
  created_at: number;
};

type SubmissionStatus = 'pending' | 'approved' | 'revising' | 'appealing';
type Submission = {
  id: string;
  student_name: string;
  topic_id: string | null;
  topic_title: string;
  submission_date: number;
  content: string;
  ai_score: number;
  final_score: number | null;
  status: SubmissionStatus;
  ai_feedback: string;
  confidence_score: number;
  teacher_note: string;
};

// In-memory Database
let dbUsers: User[] = [
  {
    id: "user-1",
    name: "Nguyễn Hà",
    email: "teacher@test.com",
    password_hash: bcrypt.hashSync("password123", 10),
    role: "teacher",
    created_at: Date.now()
  },
  {
    id: "user-2",
    name: "Nguyễn Anh Thư",
    email: "student@test.com",
    password_hash: bcrypt.hashSync("password123", 10),
    role: "student",
    created_at: Date.now()
  }
];
let dbDocuments: Document[] = [];
let dbSubmissions: Submission[] = [
  {
    id: "sub-1",
    student_name: "Minh Quân",
    topic_id: null,
    topic_title: "Chiến dịch Điện Biên Phủ",
    submission_date: Date.now() - 86400000,
    content: "Chiến dịch Điện Biên Phủ không chỉ mang ý nghĩa quân sự mà còn là đòn giáng mạnh vào hệ thống thực dân...",
    ai_score: 9.5,
    final_score: null,
    status: "pending",
    ai_feedback: '{"overview": ["Bài làm rất xuất sắc, lập luận chặt chẽ và có góc nhìn mới lạ."], "strengths": ["Lập luận sắc bén", "Liên hệ tốt"], "weaknesses": [], "rubric_scores": [{"criteria": "Chính xác sự kiện", "score": 9, "maxScore": 10}, {"criteria": "Logic", "score": 8, "maxScore": 10}, {"criteria": "Diễn đạt", "score": 8, "maxScore": 10}]}',
    confidence_score: 65,
    teacher_note: ""
  },
  {
    id: "sub-2",
    student_name: "Bảo Trâm",
    topic_id: "2",
    topic_title: "Cách mạng tháng Tám 1945",
    submission_date: Date.now() - 40000000,
    content: "Cách mạng diễn ra rất nhanh và quân Nhật đầu hàng.",
    ai_score: 3.0,
    final_score: null,
    status: "pending",
    ai_feedback: '{"overview": ["Thiếu quá nhiều diễn biến quan trọng. Lập luận sơ sài."], "strengths": [], "weaknesses": ["Thiếu ý chính", "Chưa phân tích nguyên nhân"], "rubric_scores": [{"criteria": "Chính xác sự kiện", "score": 4, "maxScore": 10}, {"criteria": "Logic", "score": 3, "maxScore": 10}, {"criteria": "Diễn đạt", "score": 4, "maxScore": 10}]}',
    confidence_score: 80,
    teacher_note: ""
  },
  {
    id: "sub-3",
    student_name: "Nguyên Anh",
    topic_id: "3",
    topic_title: "Chiến tranh lạnh",
    submission_date: Date.now() - 120000000,
    content: "Chiến tranh lạnh kết thúc mở ra cục diện đa cực...",
    ai_score: 8.0,
    final_score: 8.0,
    status: "approved",
    ai_feedback: '{"overview": ["Kiến thức khá tốt, tuy nhiên phần liên hệ thực tế cần mở rộng thêm."], "strengths": ["Nắm vững kiến thức"], "weaknesses": ["Thiếu liên hệ"], "rubric_scores": [{"criteria": "Chính xác sự kiện", "score": 8, "maxScore": 10}, {"criteria": "Logic", "score": 8, "maxScore": 10}, {"criteria": "Diễn đạt", "score": 7, "maxScore": 10}]}',
    confidence_score: 95,
    teacher_note: "Em đã làm rất tốt, cố gắng phát huy nhé."
  },
  {
    id: "sub-4",
    student_name: "Thùy Linh",
    topic_id: null,
    topic_title: "Hiệp định Paris 1973",
    submission_date: Date.now() - 10000000,
    content: "Hiệp định Paris buộc Mỹ phải rút quân về nước, chấm dứt chiến tranh.",
    ai_score: 7.5,
    final_score: null,
    status: "appealing",
    ai_feedback: '{"overview": ["Chưa phân tích rõ vai trò của mặt trận ngoại giao."], "strengths": ["Nhớ mốc thời gian"], "weaknesses": ["Lập luận mỏng"], "rubric_scores": [{"criteria": "Chính xác sự kiện", "score": 7, "maxScore": 10}, {"criteria": "Logic", "score": 6, "maxScore": 10}, {"criteria": "Diễn đạt", "score": 8, "maxScore": 10}]}',
    confidence_score: 88,
    teacher_note: ""
  }
];

let dbAiConfig = {
  system_instruction: "",
  rubric_weights: {
    accuracy: 20,
    completeness: 30,
    logic: 20,
    critical: 15,
    expression: 15
  },
  feedback_tone: "friendly",
  updated_at: Date.now()
};

// Ensure uploads dir exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

export async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // AUTHENTICATION MIDDLEWARE
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: "Access token missing" });
    
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  };

  // AUTH APIs
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: "Mising required fields" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Mật khẩu phải từ 6 ký tự trở lên" });
      }

      const existingUser = dbUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: "Email này đã được sử dụng" });
      }

      const password_hash = await bcrypt.hash(password, 10);
      
      const newUser: User = {
        id: uuidv4(),
        name,
        email,
        password_hash,
        role: role as UserRole,
        created_at: Date.now()
      };
      
      dbUsers.push(newUser);
      
      const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ success: true, token, user: { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email } });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });
      }
      
      const user = dbUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: "Email hoặc mật khẩu không chính xác" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: "Email hoặc mật khẩu không chính xác" });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ success: true, token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // KNOWLEDGE BASE APIs
  // API 1: GET /api/knowledge/stats
  app.get("/api/knowledge/stats", (req, res) => {
    const total_files = dbDocuments.length;
    const total_size_bytes = dbDocuments.reduce((sum, doc) => sum + doc.file_size, 0);
    const total_size_mb = (total_size_bytes / (1024 * 1024)).toFixed(1);
    const ai_ready = dbDocuments.length > 0 && dbDocuments.every(doc => doc.status === 'ready' || doc.status === 'error');
    const is_processing = dbDocuments.some(doc => doc.status === 'processing');

    res.json({
      total_files,
      total_size_mb,
      ai_ready,
      is_processing
    });
  });

  // API 2: GET /api/knowledge/list
  app.get("/api/knowledge/list", (req, res) => {
    const sortedDocs = [...dbDocuments].sort((a, b) => b.created_at - a.created_at);
    res.json(sortedDocs);
  });

  // API 3: POST /api/knowledge/upload
  app.post("/api/knowledge/upload", upload.array('files'), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const newDocs: Document[] = files.map(file => {
      const ext = path.extname(file.originalname).substring(1) || "unknown";
      return {
        id: uuidv4(),
        file_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        file_type: ext,
        status: 'processing',
        is_active: true,
        created_at: Date.now()
      };
    });

    dbDocuments.push(...newDocs);

    // Simulate RAG Background Process
    newDocs.forEach(doc => {
      setTimeout(() => {
        const dbDoc = dbDocuments.find(d => d.id === doc.id);
        if (dbDoc) {
          dbDoc.status = 'ready';
        }
      }, 4000 + Math.random() * 3000);
    });

    res.json({ success: true, message: "Files uploading and processing started" });
  });

  // API 4: PATCH /api/knowledge/toggle-active/:id
  app.patch("/api/knowledge/toggle-active/:id", (req, res) => {
    const docId = req.params.id;
    const doc = dbDocuments.find(d => d.id === docId);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    doc.is_active = !doc.is_active;
    res.json({ success: true, is_active: doc.is_active });
  });

  // API 5: DELETE /api/knowledge/:id
  app.delete("/api/knowledge/:id", (req, res) => {
    const docId = req.params.id;
    const docIndex = dbDocuments.findIndex(d => d.id === docId);
    if (docIndex === -1) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    try {
      if (fs.existsSync(dbDocuments[docIndex].file_path)) {
        fs.unlinkSync(dbDocuments[docIndex].file_path);
      }
    } catch (e) {
      console.error("Error deleting file:", e);
    }
    
    dbDocuments.splice(docIndex, 1);
    res.json({ success: true });
  });

  const rubricMap = {
    accuracy: "Tính chính xác (sự kiện, mốc thời gian)",
    completeness: "Mức độ đầy đủ của ý",
    logic: "Tư duy logic & Phân tích",
    critical: "Tư duy phản biện & Liên hệ thực tế",
    expression: "Diễn đạt và bố cục bài viết"
  };

  // DASHBOARD APIs
  app.post("/api/submissions", (req, res) => {
    const { student_name, topic_id, topic_title, content } = req.body;
    
    // RAG context info
    const activeDocs = dbDocuments.filter(d => d.is_active && d.status === 'ready');
    const kbInfo = activeDocs.length > 0 ? `(Tham chiếu RAG: ${activeDocs.map(d => d.file_name).join(", ")})` : "";

    // Generate rubric scores based on dbAiConfig weights
    const rubric_details = Object.entries(dbAiConfig.rubric_weights).map(([k, w]) => {
      const score = Math.floor(Math.random() * 5 * 10) / 10 + 5; // random score between 5.0 and 10.0
      return {
        criteria: rubricMap[k as keyof typeof rubricMap] || k,
        weight: (w as number) / 100, // convert percentage to decimal
        score: score,
        maxScore: 10
      };
    });

    const ai_score = rubric_details.reduce((acc, curr) => acc + (curr.score * curr.weight), 0);
    const final_score_rounded = Math.round(ai_score * 10) / 10;
    
    const newSubmission = {
      id: `sub-${Date.now()}`,
      student_name: student_name || "Học sinh ẩn danh",
      topic_id: topic_id || null,
      topic_title: topic_title || "Bài làm tự do",
      submission_date: Date.now(),
      content: content || "",
      ai_score: final_score_rounded,
      final_score: null,
      status: "pending" as SubmissionStatus,
      ai_feedback: JSON.stringify({
        status: "success",
        data: {
          rubric_details: rubric_details,
          final_score: final_score_rounded,
          feedbacks: {
            positive: ["Hoàn thành đúng thời gian quy định.", "Trình bày rõ ràng, bám sát các sự kiện lịch sử (Theo dữ liệu Knowledge Base)."],
            improvements: ["Cần phân tích sâu hơn về bối cảnh lịch sử.", "Để ý lỗi dùng từ ngữ (trái với Knowledge Base đưa ra)."],
            suggestions: ["Bổ sung sâu hơn về số liệu thực tế.", `Văn phong và kiến thức phù hợp. ${kbInfo}`]
          }
        }
      }),
      confidence_score: Math.floor(Math.random() * 40) + 60,
      teacher_note: ""
    };

    dbSubmissions.push(newSubmission);
    
    res.json({ success: true, submission: newSubmission });
  });

  app.get("/api/dashboard/summary", (req, res) => {
    const totalSubmissions = dbSubmissions.length;
    const pendingApprovals = dbSubmissions.filter(s => s.status === 'pending').length;
    const approved = dbSubmissions.filter(s => s.status === 'approved');
    const classAverage = approved.length > 0 
      ? (approved.reduce((acc, curr) => acc + (curr.final_score !== null ? curr.final_score : curr.ai_score), 0) / approved.length).toFixed(1)
      : 0;

    const recentPending = dbSubmissions
      .filter(s => s.status === 'pending')
      .sort((a, b) => b.submission_date - a.submission_date)
      .slice(0, 3)
      .map(s => ({
        id: s.id,
        student_name: s.student_name,
        topic: s.topic_title,
        ai_score: s.ai_score,
        confidence: s.confidence_score,
        flag_reason: s.confidence_score < 70 ? "AI tự tin thấp, cần duyệt" : "Chờ xác nhận điểm"
      }));

    res.json({
      totalSubmissions,
      classAverage,
      pendingApprovals,
      recentPending
    });
  });

  app.get("/api/dashboard/analytics", (req, res) => {
    // Mock Trend Data
    const trendData = [
      { name: 'Tuần 1', score: 6.5 },
      { name: 'Tuần 2', score: 7.0 },
      { name: 'Tuần 3', score: 7.8 },
      { name: 'Tuần 4', score: 8.2 },
    ];

    // Mock Skills Heatmap based on the instruction
    const skillsHeatmap = [
      { id: 'knowledge', label: 'Kiến thức cốt lõi', weak: 15, average: 35, good: 50 },
      { id: 'logic', label: 'Tư duy logic', weak: 20, average: 45, good: 35 },
      { id: 'critical', label: 'Phản biện', weak: 65, average: 20, good: 15 }, // Example of a highly weak skill
      { id: 'expression', label: 'Diễn đạt', weak: 10, average: 50, good: 40 },
      { id: 'relation', label: 'Liên hệ thực tế', weak: 40, average: 40, good: 20 },
    ];

    const weakSkills = skillsHeatmap.filter(s => s.weak > 50).map(s => s.label);
    let insightText = "Phổ điểm của lớp đang ổn định.";
    if (weakSkills.length > 0) {
      insightText = `Cảnh báo: ${weakSkills[0]} đang có xu hướng yếu (hơn 50% học sinh dưới điểm trung bình).`;
    }

    res.json({
      trendData,
      skillsHeatmap,
      insightText
    });
  });

  app.get("/api/dashboard/top-errors", (req, res) => {
    const topErrors = [
      { id: 1, label: "Nhầm lẫn niên đại (Sai sự kiện cơ bản)", count: 24, trend: 'up', trend_value: '+5% so với tuần trước' },
      { id: 2, label: "Lập luận thiếu nguyên nhân sâu xa", count: 18, trend: 'up', trend_value: '+2% so với tuần trước' },
      { id: 3, label: "Sai thuật ngữ lịch sử", count: 12, trend: 'down', trend_value: '-10% so với tuần trước' },
      { id: 4, label: "Thiếu liên hệ thực tiễn", count: 8, trend: 'down', trend_value: '-3% so với tuần trước' },
    ];
    res.json(topErrors);
  });
  app.get("/api/submissions", (req, res) => {
    let results = [...dbSubmissions];
    
    // Simple mock filter
    if (req.query.status && req.query.status !== 'all') {
      results = results.filter(s => s.status === req.query.status);
    }
    
    if (req.query.search) {
      const q = (req.query.search as string).toLowerCase();
      results = results.filter(s => 
        s.student_name.toLowerCase().includes(q) || 
        s.topic_title.toLowerCase().includes(q)
      );
    }
    
    // Sort descending by submission_date
    results.sort((a, b) => b.submission_date - a.submission_date);

    res.json(results);
  });

  app.get("/api/submissions/stats", (req, res) => {
    const total_submissions = dbSubmissions.length;
    const pending_submissions = dbSubmissions.filter(s => s.status === 'pending').length;
    const appealing_submissions = dbSubmissions.filter(s => s.status === 'appealing').length;
    
    const approved = dbSubmissions.filter(s => s.status === 'approved');
    const class_average = approved.length > 0 
      ? (approved.reduce((acc, curr) => acc + (curr.final_score !== null ? curr.final_score : curr.ai_score), 0) / approved.length).toFixed(1)
      : 0;

    res.json({
      total_submissions,
      pending_submissions,
      appealing_submissions,
      class_average
    });
  });

  app.patch("/api/submissions/:id/approve", (req, res) => {
    const subId = req.params.id;
    const { final_score, teacher_note } = req.body;
    const sub = dbSubmissions.find(s => s.id === subId);
    
    if (!sub) return res.status(404).json({ error: "Not found" });
    
    sub.status = "approved";
    if (final_score !== undefined) {
      sub.final_score = final_score;
    } else {
      sub.final_score = sub.ai_score;
    }
    if (teacher_note !== undefined) sub.teacher_note = teacher_note;

    res.json({ success: true, submission: sub });
  });

  app.get("/api/submissions/:id", (req, res) => {
    const subId = req.params.id;
    const sub = dbSubmissions.find(s => s.id === subId);
    if (!sub) return res.status(404).json({ error: "Not found" });
    res.json(sub);
  });

  app.put("/api/submissions/:id", (req, res) => {
    const subId = req.params.id;
    const sub = dbSubmissions.find(s => s.id === subId);
    if (!sub) return res.status(404).json({ error: "Not found" });
    if (req.body.content) sub.content = req.body.content;
    res.json(sub);
  });

  app.post("/api/submissions/:id/regrade", (req, res) => {
    const subId = req.params.id;
    const sub = dbSubmissions.find(s => s.id === subId);
    if (!sub) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, message: "Use stream endpoint instead" }); // Legacy
  });

  app.get("/api/submissions/:id/regrade-stream", (req, res) => {
    const subId = req.params.id;
    const sub = dbSubmissions.find(s => s.id === subId);
    
    if (!sub) {
      return res.status(404).json({ error: "Not found" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // RAG context info
    const activeDocs = dbDocuments.filter(d => d.is_active && d.status === 'ready');
    const kbInfo = activeDocs.length > 0 ? `(Tham chiếu RAG cập nhật: ${activeDocs.map(d => d.file_name).join(", ")})` : "";

    let generalFeedback = "Bài đã được chấm lại theo Rubric mới cập nhật.";
    if (dbAiConfig.feedback_tone === 'strict') generalFeedback += " Đã khắt khe hơn với các sai lệch sự kiện.";
    if (dbAiConfig.feedback_tone === 'friendly') generalFeedback += " Rất đáng khen vì em đã có sự cố gắng.";

    // Generate rubric scores based on dbAiConfig weights
    const rubric_details = Object.entries(dbAiConfig.rubric_weights).map(([k, w]) => {
      const score = Math.floor(Math.random() * 5 * 10) / 10 + 5; // random score between 5.0 and 10.0
      return {
        criteria: rubricMap[k as keyof typeof rubricMap] || k,
        weight: (w as number) / 100,
        score: score,
        maxScore: 10
      };
    });

    const ai_score = rubric_details.reduce((acc, curr) => acc + (curr.score * curr.weight), 0);
    const final_score_rounded = Math.round(ai_score * 10) / 10;
    
    sub.ai_score = final_score_rounded;
    
    const newFeedback = {
      status: "success",
      data: {
        rubric_details: rubric_details,
        final_score: final_score_rounded,
        feedbacks: {
          positive: [] as string[],
          improvements: [] as string[],
          suggestions: [generalFeedback, kbInfo] as string[]
        }
      }
    };

    let step = 0;
    const interval = setInterval(() => {
      step++;
      
      if (step === 1) {
        newFeedback.data.feedbacks.suggestions.push("Đã cập nhật theo tiêu chí mới nhất.");
        res.write(`data: ${JSON.stringify({ partialFeedback: newFeedback })}\n\n`);
      } else if (step === 2) {
        newFeedback.data.feedbacks.positive.push("Trình bày mạch lạc, đối chiếu tốt với Knowledge Base.", "Lập luận có cải thiện đáng kể.");
        res.write(`data: ${JSON.stringify({ partialFeedback: newFeedback })}\n\n`);
      } else if (step === 3) {
        newFeedback.data.feedbacks.improvements.push(`Cần đưa thêm luận điểm từ ${activeDocs[0]?.file_name || 'tài liệu học tập'}.`, "Một số chỗ diễn đạt chưa tối ưu.");
        res.write(`data: ${JSON.stringify({ partialFeedback: newFeedback })}\n\n`);
      } else if (step === 4) {
        // Complete
        sub.ai_feedback = JSON.stringify(newFeedback);
        sub.status = "pending";
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 600); // Send chunk every 600ms
  });

  // CONFIG APIs
  app.get("/api/config", (req, res) => {
    res.json(dbAiConfig);
  });

  app.post("/api/config/save", (req, res) => {
    const { system_instruction, rubric_weights, feedback_tone } = req.body;
    dbAiConfig = {
      system_instruction: system_instruction ?? dbAiConfig.system_instruction,
      rubric_weights: rubric_weights ?? dbAiConfig.rubric_weights,
      feedback_tone: feedback_tone ?? dbAiConfig.feedback_tone,
      updated_at: Date.now()
    };
    res.json({ success: true, config: dbAiConfig });
  });

  // STUDENT API
  app.get("/api/student/dashboard/summary", (req, res) => {
    // Simulated auth: get student name from query, default to "Minh Quân"
    const student_name = (req.query.student_name as string) || "Minh Quân";
    
    const submissions = dbSubmissions.filter(s => s.student_name === student_name);
    const totalSubmissions = submissions.length;
    
    const approved = submissions.filter(s => s.status === 'approved');
    const averageScore = approved.length > 0 
      ? (approved.reduce((acc, curr) => acc + (curr.final_score !== null ? curr.final_score : curr.ai_score), 0) / approved.length).toFixed(1)
      : "-";

    // MOCK: determine best skill. In reality, we would parse ai_feedback or separate rubric scores.
    const bestSkill = approved.length > 0 ? "Tư duy logic" : "-";

    res.json({
      totalSubmissions,
      averageScore,
      bestSkill
    });
  });

  app.get("/api/student/dashboard/performance", (req, res) => {
    const student_name = (req.query.student_name as string) || "Minh Quân";
    // MOCK data for the progressive chart
    const progress_data = [
      { week: 'Tuần 1', score: 6.5 },
      { week: 'Tuần 2', score: 7.0 },
      { week: 'Tuần 3', score: 8.5 },
      { week: 'Tuần 4', score: 9.0 }
    ];

    // MOCK data for Radar chart
    const skills_radar = [
      { subject: 'Kiến thức', A: 85 },
      { subject: 'Logic', A: 90 },
      { subject: 'Phản biện', A: 75 },
      { subject: 'Diễn đạt', A: 80 },
      { subject: 'Liên hệ', A: 65 }
    ];

    res.json({
      progress_data,
      skills_radar
    });
  });

  app.get("/api/student/submissions", (req, res) => {
    const student_name = (req.query.student_name as string) || "Minh Quân";
    
    let submissions = dbSubmissions
      .filter(s => s.student_name === student_name)
      .map(s => {
        return {
          id: s.id,
          topic_title: s.topic_title || "Bài làm tự do",
          submission_date: s.submission_date,
          status: s.status,
          final_score: s.final_score !== null ? s.final_score : s.ai_score
        };
      });

    res.json(submissions);
  });

  app.get("/api/student/submissions/latest", (req, res) => {
    const student_name = (req.query.student_name as string) || "Minh Quân";
    
    const recentSubmissions = dbSubmissions
      .filter(s => s.student_name === student_name)
      .sort((a, b) => b.submission_date - a.submission_date)
      .slice(0, 5)
      .map(s => {
        let displayStatus = "";
        let colorClass = "";
        if (s.status === 'approved') { displayStatus = "Đã chấm"; colorClass = "bg-emerald-50 text-emerald-600 border-emerald-100"; }
        else if (s.status === 'pending') { displayStatus = "Chờ duyệt"; colorClass = "bg-amber-50 text-amber-600 border-amber-100"; }
        else if (s.status === 'appealing') { displayStatus = "Đang phúc khảo"; colorClass = "bg-purple-50 text-purple-600 border-purple-100"; }
        else { displayStatus = s.status; colorClass = "bg-slate-50 text-slate-600 border-slate-100"; }
        
        return {
          id: s.id,
          title: s.topic_title || "Bài làm tự do",
          date: new Date(s.submission_date).toLocaleDateString('vi-VN'),
          status: displayStatus,
          statusColor: colorClass,
          score: s.final_score !== null ? s.final_score.toFixed(1) : (s.ai_score ? s.ai_score.toFixed(1) : "-")
        };
      });

    res.json(recentSubmissions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
