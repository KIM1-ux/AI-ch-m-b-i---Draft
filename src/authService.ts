import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const handleRegister = async (email: string, password: string, role: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Lưu vào Bảng Users
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      name: name,
      role: role, // 'teacher' hoặc 'student'
      avatar_url: "", 
      createdAt: new Date()
    });
    return { success: true, user };
  } catch (error) {
    throw error;
  }
};

export const handleLogin = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
  
  if (!userDoc.exists()) {
    throw new Error("Không tìm thấy thông tin người dùng.");
  }
  
  return { user: userCredential.user, role: userDoc.data()?.role };
};
