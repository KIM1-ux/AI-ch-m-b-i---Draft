import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";

// Lưu lịch sử cấu hình mỗi khi giáo viên thay đổi Prompt (Versioning)
export const logConfigChange = async (teacherId: string, oldConfig: any) => {
  await addDoc(collection(db, "config_history"), {
    teacher_id: teacherId,
    old_system_instruction: oldConfig.instruction,
    old_rubric_weights: oldConfig.rubrics,
    changedAt: new Date()
  });
};

// Lấy dữ liệu để vẽ biểu đồ Dashboard (Performance Logs)
export const getStudentPerformance = async (studentId: string) => {
  const q = query(
    collection(db, "submissions"), 
    where("student_id", "==", studentId),
    orderBy("timestamp", "asc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    date: doc.data().timestamp.toDate().toLocaleDateString(),
    score: doc.data().final_score
  }));
};
