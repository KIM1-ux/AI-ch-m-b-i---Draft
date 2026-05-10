import { LayoutDashboard, PenSquare, History, BookOpen, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Trang chủ", icon: LayoutDashboard },
  { id: "submit", label: "Nộp bài mới", icon: PenSquare },
  { id: "history", label: "Lịch sử bài làm", icon: History },
  { id: "bank", label: "Ngân hàng đề thi", icon: BookOpen },
  { id: "materials", label: "Tài liệu ôn tập", icon: FileText },
  { id: "criteria", label: "Tiêu chí chấm điểm", icon: Target },
];

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-indigo-500 text-white p-1.5 py-0.5 rounded text-sm tracking-widest font-black uppercase">AI</span>
          <span className="tracking-tight text-base whitespace-nowrap">CHẤM BÀI LỊCH SỬ</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentView === item.id 
                ? "bg-indigo-600 text-white" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-200">AI Chấm Bài Lịch Sử</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            AI chuyên biệt hỗ trợ chấm bài tự luận môn Lịch sử cho đội tuyển THCS
          </p>
        </div>
        <div className="text-xs text-slate-500 text-center bg-slate-800/50 p-2 rounded">
          Phiên bản dành cho Học sinh
        </div>
      </div>
    </div>
  );
}
