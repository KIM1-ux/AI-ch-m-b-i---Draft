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
import { Users } from "lucide-react";
import { TopBar } from "./components/TopBar";

function AppContent() {
  const { role, isLoggedIn } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | undefined>();

  useEffect(() => {
    // Redirect to dashboard on role change or login
    setCurrentView("dashboard");
  }, [role, isLoggedIn]);

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
              <h2 className="text-2xl font-bold mb-2 text-red-600">403 Forbidden</h2>
              <p>Bạn không có quyền truy cập vào trang này với vai trò Học sinh.</p>
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
              <h2 className="text-2xl font-bold mb-2 text-red-600">403 Forbidden</h2>
              <p>Trang không tồn tại hoặc bạn không có quyền truy cập.</p>
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
