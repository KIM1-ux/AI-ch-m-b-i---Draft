import { useState } from "react";
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
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function App() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  // Manage generic view state string, though available views differ by role.
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | undefined>();

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
            <div className="p-8 text-center text-slate-500 animate-in fade-in">
              <h2 className="text-xl font-bold mb-2">Tính năng đang phát triển (Học sinh)</h2>
              <p>Vui lòng chọn Trang chủ hoặc Nộp bài mới.</p>
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
            <div className="p-8 text-center text-slate-500 animate-in fade-in flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-700">Module quản lý đang xây dựng</h2>
              <p className="max-w-md mx-auto">Vui lòng sử dụng tính năng "Dashboard" để xem tổng quan. Các tính năng cấu hình đang được tích hợp.</p>
            </div>
          );
      }
    }
  };

  const handleRoleToggle = () => {
    setRole((prev) => (prev === "student" ? "teacher" : "student"));
    setCurrentView("dashboard");
  };

  return (
    <QuestionBankProvider>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        {role === "student" ? (
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        ) : (
          <TeacherSidebar currentView={currentView} setCurrentView={setCurrentView} />
        )}
        
        <main className="flex-1 overflow-y-auto relative">
          {renderContent()}

          {/* Role Switcher */}
          <div className="fixed bottom-6 right-6 z-50">
             <motion.button
                layout
                onClick={handleRoleToggle}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white font-medium transition-colors border",
                  role === "student" ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-500/20" : "bg-slate-900 hover:bg-black border-slate-700/50"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
             >
                <AnimatePresence mode="popLayout" initial={false}>
                  {role === "student" ? (
                    <motion.div
                      key="student"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-2"
                    >
                       <Users className="w-5 h-5" />
                       <span>Học sinh</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="teacher"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex items-center gap-2"
                    >
                       <GraduationCap className="w-5 h-5" />
                       <span>Giáo viên</span>
                    </motion.div>
                  )}
                </AnimatePresence>
             </motion.button>
          </div>
        </main>
      </div>
    </QuestionBankProvider>
  );
}
