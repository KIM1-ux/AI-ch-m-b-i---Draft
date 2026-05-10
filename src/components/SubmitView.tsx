import { useState } from "react";
import { UploadCloud, FileText, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function SubmitView({ onComplete }: { onComplete: () => void }) {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<"mock" | "official">("official");

  const handleSubmit = () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    // Simulate AI thinking time
    setTimeout(() => {
      setIsAnalyzing(false);
      onComplete();
    }, 3000);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-500">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">AI đang phân tích bài viết...</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Hệ thống đang đối chiếu với tiêu chí chấm điểm và trích xuất lỗi logic. Vui lòng chờ trong giây lát.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Nộp bài mới</h2>
        <p className="text-slate-500">Nhập đề bài và bài làm của bạn để AI tiến hành chấm điểm.</p>
      </div>

      <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {/* Step 1: Topic */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Chọn hoặc nhập đề bài
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ví dụ: Phân tích nguyên nhân thắng lợi của Cách mạng tháng Tám 1945..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
        </div>

        {/* Step 2: Content */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
             <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Tải bài làm
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
            <div className="relative group rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all overflow-hidden flex flex-col bg-slate-50">
               <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <FileText className="w-4 h-4" />
                  Nhập văn bản
               </div>
               <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập phần trình bày của bạn tại đây..."
                className="w-full p-4 flex-1 outline-none resize-none bg-transparent"
              />
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 transition-colors flex items-center justify-center cursor-pointer group">
              <div className="text-center space-y-3 p-6">
                <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Tải ảnh hoặc PDF</p>
                  <p className="text-xs text-slate-500 mt-1">AI sẽ quét chữ viết tay tự động</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Options & Submit */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg">
            <button 
              onClick={() => setMode("mock")}
              className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", mode === "mock" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
            >
              Chấm thử
            </button>
            <button 
              onClick={() => setMode("official")}
              className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", mode === "official" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
            >
              Nộp chính thức
            </button>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Bắt đầu chấm
          </button>
        </div>
      </div>
    </div>
  );
}
