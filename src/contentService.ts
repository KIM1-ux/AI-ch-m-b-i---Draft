import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Lưu Đề bài (Bảng Topics)
export const createTopic = async (teacherId: string, topicData: any) => {
  return await addDoc(collection(db, "topics"), {
    teacher_id: teacherId,
    title: topicData.title,
    description: topicData.description,
    model_answer: topicData.modelAnswer,
    createdAt: serverTimestamp()
  });
};

// Lưu Cấu hình AI (Bảng AI_Configs)
export const saveAIConfig = async (teacherId: string, configData: any) => {
  return await addDoc(collection(db, "ai_configs"), {
    teacher_id: teacherId,
    system_instruction: configData.instruction,
    feedback_tone: configData.tone, // Hàn lâm, Thân thiện...
    rubric_weights: configData.rubrics, // JSON mảng tiêu chí
    createdAt: serverTimestamp()
  });
};
