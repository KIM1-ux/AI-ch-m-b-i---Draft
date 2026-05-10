import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadKnowledge = async (file: File) => {
  // 1. Đẩy file vật lý lên Firebase Storage
  const storageRef = ref(storage, `knowledge/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  // 2. Lưu thông tin metadata vào Firestore (Bảng KnowledgeBase)
  return await addDoc(collection(db, "knowledge_base"), {
    file_name: file.name,
    url: url,
    is_active: true,
    createdAt: new Date()
  });
};
