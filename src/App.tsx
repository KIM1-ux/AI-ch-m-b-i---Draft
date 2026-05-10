import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { SubmitView } from "./components/SubmitView";
import { ResultView } from "./components/ResultView";
import { StudentHistory } from "./components/StudentHistory";
import { TeacherSidebar } from "./components/TeacherSidebar";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { QuestionBankManager } from "./components/QuestionBankManager";
import { AIConfig } from "./components/AIConfig";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { SubmissionManager } from "./components/SubmissionManager";
import { QuestionBankProvider } from "./context/QuestionBankContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TopBar } from "./components/TopBar";

function AppContent() {
  const { role, isLoggedIn } = useAuth();
  
  // Custom simple router
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | undefined>();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  useEffect(() => {
    if (currentPath === "/" || currentPath === "") {
      if (role === "teacher") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");
    }
  }, [currentPath, role]);

  // Handle cross-role route typing
  if (currentPath.startsWith("/teacher/") && role !== "teacher") {
    return (
      <div className="flex h-screen bg-slate-50 flex-col items-center justify-center font-sans">
        <h2 className="text-3xl font-bold mb-4 text-red-600">403 - Không có quyền truy cập</h2>
        <p className="text-slate-600 mb-6 font-medium">Học sinh không được phép truy cập vào trang quản trị của Giáo viên.</p>
        <button onClick={() => navigate("/student/dashboard")} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200">
          Về Trang Học sinh
        </button>
      </div>
    );
  }

  if (currentPath.startsWith("/student/") && role !== "student") {
    return (
      <div className="flex h-screen bg-slate-50 flex-col items-center justify-center font-sans">
        <h2 className="text-3xl font-bold mb-4 text-red-600">403 - Không có quyền truy cập</h2>
        <p className="text-slate-600 mb-6 font-medium">Bạn hiện không đăng nhập bằng tài khoản Học sinh.</p>
        <button onClick={() => navigate("/teacher/dashboard")} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200">
          Về Trang Giáo viên
        </button>
      </div>
    );
  }

  // Derive current view from path
  let currentView = "dashboard";
  if (currentPath.includes("/dashboard")) currentView = "dashboard";
  else if (currentPath.includes("/submit")) currentView = "submit";
  else if (currentPath.includes("/result")) currentView = "result";
  else if (currentPath.includes("/history")) currentView = "history";
  else if (currentPath.includes("/question-bank")) currentView = "question-bank";
  else if (currentPath.includes("/rag")) currentView = "rag";
  else if (currentPath.includes("/config")) currentView = "config";
  else if (currentPath.includes("/submissions")) currentView = "submissions";

  // Provide setter adapter for legacy components
  const setCurrentView = (view: string) => {
    let prefix = role === "teacher" ? "/teacher" : "/student";
    navigate(`${prefix}/${view}`);
  };

  const renderContent = () => {
    if (role === "student") {
      switch (currentView) {
        case "dashboard":
          return <Dashboard onViewResult={(id) => { setActiveSubmissionId(id); setCurrentView("result"); }} />;
        case "submit":
          return <SubmitView onComplete={(id) => { setActiveSubmissionId(id); setCurrentView("result"); }} />;
        case "result":
          return <ResultView submissionId={activeSubmissionId} onBack={() => setCurrentView("dashboard")} />;
        case "history":
          return <StudentHistory onViewResult={(id) => { setActiveSubmissionId(id); setCurrentView("result"); }} onSubmitNew={() => setCurrentView("submit")} />;
        default:
          return (
            <div className="p-8 flex flex-col justify-center items-center h-full text-center text-slate-500 animate-in fade-in">
              <h2 className="text-2xl font-bold mb-2 text-red-600">404 Not Found</h2>
              <p>Trang không tồn tại.</p>
              <button onClick={() => setCurrentView("dashboard")} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Về Trang Chủ</button>
            </div>
          );
      }
    } else {
      switch (currentView) {
        case "dashboard":
          return <TeacherDashboard />;
        case "question-bank":
          return <QuestionBankManager />;
        case "rag":
          return <KnowledgeBase />;
        case "config":
          return <AIConfig />;
        case "submissions":
          return <SubmissionManager />;
        default:
          return (
            <div className="p-8 flex flex-col justify-center items-center h-full text-center text-slate-500 animate-in fade-in">
              <h2 className="text-2xl font-bold mb-2 text-red-600">404 Not Found</h2>
              <p>Trang không tồn tại.</p>
              <button onClick={() => setCurrentView("dashboard")} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Về Trang Chủ</button>
            </div>
          );
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {role === "student" ? (
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      ) : (
        <TeacherSidebar currentView={currentView} setCurrentView={setCurrentView} />
      )}
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <TopBar onSubmitClick={() => setCurrentView("submit")} />
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QuestionBankProvider>
        <AppContent />
      </QuestionBankProvider>
    </AuthProvider>
  );
}
