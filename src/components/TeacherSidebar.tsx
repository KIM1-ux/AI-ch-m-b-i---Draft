import { LayoutDashboard, Database, BrainCircuit, Settings, Users, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherSidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "question-bank", label: "Quản lý Kho đề", icon: Database },
  { id: "rag", label: "Knowledge Base (RAG)", icon: BrainCircuit },
  { id: "config", label: "Cấu hình AI & Rubric", icon: Settings },
  { id: "submissions", label: "Quản lý bài làm", icon: ClipboardList },
];

export function TeacherSidebar({ currentView, setCurrentView }: TeacherSidebarProps) {
  return (
    <div className="w-64 bg-[#0a0a0b] h-screen flex flex-col text-slate-300 border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-indigo-600 text-white p-1.5 py-0.5 rounded text-sm tracking-widest font-black uppercase">AI</span>
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
                ? "bg-white/10 text-white" 
                : "hover:bg-white/5 hover:text-white text-slate-400"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-200">AI Teacher Workspace</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Hệ thống quản lý, cấu hình AI và theo dõi tiến độ dành cho Giáo viên.
          </p>
        </div>
        <div className="text-xs font-semibold tracking-wider text-indigo-400 text-center bg-indigo-500/10 p-2 rounded border border-indigo-500/20 uppercase">
          Phiên bản dành cho Giáo viên
        </div>
      </div>
    </div>
  );
}
