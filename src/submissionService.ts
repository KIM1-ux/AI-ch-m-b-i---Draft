import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveSubmission = async (data: any) => {
  try {
    return await addDoc(collection(db, "submissions"), {
      student_id: data.studentId,
      topic_id: data.topicId,
      content: data.content,
      status: "pending",
      ai_score: data.aiScore,
      final_score: data.aiScore, 
      // Dữ liệu nhận xét chi tiết (JSON)
      feedback_data: {
        positive: data.feedback.positive,
        improvements: data.feedback.improvements,
        suggestions: data.feedback.suggestions
      },
      // Dữ liệu điểm Rubric để vẽ biểu đồ mạng nhện (JSON)
      rubric_details: data.rubricDetails, 
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi lưu bài:", error);
    throw error;
  }
};
