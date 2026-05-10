import { createContext, useContext, useState, ReactNode } from "react";

export interface QuestionRow {
  id: string;
  topic: string;
  question: string;
  modelAnswer: string;
  hasCustomRubric: boolean;
  isVisible: boolean;
}

interface QuestionBankContextProps {
  questions: QuestionRow[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionRow[]>>;
  addQuestion: (q: QuestionRow) => void;
  updateQuestion: (id: string, field: keyof QuestionRow, value: any) => void;
  deleteQuestion: (id: string) => void;
}

const initialData: QuestionRow[] = [
  {
    id: "1",
    topic: "Lịch sử VN 1945-1954",
    question: "Phân tích nguyên nhân thắng lợi của Cách mạng tháng Tám năm 1945.",
    modelAnswer: "1. Nguyên nhân khách quan: Phát xít Nhật đầu hàng Đồng minh...\n2. Nguyên nhân chủ quan: Sự lãnh đạo của Đảng và Chủ tịch Hồ Chí Minh...\n3. Quá trình chuẩn bị lâu dài (15 năm)...\n4. Khối đại đoàn kết toàn dân tộc...",
    hasCustomRubric: false,
    isVisible: true
  },
  {
    id: "2",
    topic: "Lịch sử Thế giới 1945-nay",
    question: "Trình bày sự ra đời và mục đích hoạt động của Liên Hợp Quốc.",
    modelAnswer: "1. Hoàn cảnh: Hội nghị Ianta (2/1945)...\n2. Mục đích: Duy trì hòa bình và an ninh thế giới...\n3. Phát triển các mối quan hệ hữu nghị...\n4. Thúc đẩy hợp tác quốc tế...",
    hasCustomRubric: true,
    isVisible: true
  }
];

const QuestionBankContext = createContext<QuestionBankContextProps | undefined>(undefined);

export function QuestionBankProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<QuestionRow[]>(initialData);

  const addQuestion = (q: QuestionRow) => setQuestions(prev => [...prev, q]);
  
  const updateQuestion = (id: string, field: keyof QuestionRow, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };
  
  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <QuestionBankContext.Provider value={{ questions, setQuestions, addQuestion, updateQuestion, deleteQuestion }}>
      {children}
    </QuestionBankContext.Provider>
  );
}

export function useQuestionBank() {
  const context = useContext(QuestionBankContext);
  if (context === undefined) {
    throw new Error("useQuestionBank must be used within a QuestionBankProvider");
  }
  return context;
}
