import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { SubmitView } from "./components/SubmitView";
import { ResultView } from "./components/ResultView";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewResult={() => setCurrentView("result")} />;
      case "submit":
        return <SubmitView onComplete={() => setCurrentView("result")} />;
      case "result":
        return <ResultView onBack={() => setCurrentView("dashboard")} />;
      default:
        return (
          <div className="p-8 text-center text-slate-500 animate-in fade-in">
            <h2 className="text-xl font-bold mb-2">Tính năng đang phát triển</h2>
            <p>Vui lòng chọn Trang chủ hoặc Nộp bài mới.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto relative">
        {renderContent()}
      </main>
    </div>
  );
}
