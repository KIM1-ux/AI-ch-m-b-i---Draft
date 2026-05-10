import { useState } from "react";
import { UploadCloud, FileText, Send, Sparkles, Database, Camera, PenTool, ChevronDown, Check, ScanText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useQuestionBank } from "@/context/QuestionBankContext";

export function SubmitView({ onComplete }: { onComplete: (id?: string) => void }) {
  const { questions } = useQuestionBank();
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<"mock" | "official">("official");
  
  const [topicMode, setTopicMode] = useState<"bank" | "scan" | "manual">("bank");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [isScanningTopic, setIsScanningTopic] = useState(false);
  const [scannedQuestions, setScannedQuestions] = useState<string[]>([]);

  // Lọc chỉ đề bài được giáo viên hiển thị
  const activeQuestions = questions.filter(q => q.isVisible && Boolean(q.question));

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: "Minh Quân",
          topic_id: topicMode === "bank" ? "T1" : null,
          topic_title: topic,
          content: content
        })
      });
      const data = await res.json();
      
      // Simulate AI thinking time extra delay just for effect
      setTimeout(() => {
        setIsAnalyzing(false);
        onComplete(data.submission.id);
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
      onComplete();
    }
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
        {/* Step 1: Chọn hoặc nhập đề bài */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Chọn hoặc nhập đề bài
          </label>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setTopicMode("bank"); setTopic(""); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all", topicMode === "bank" ? "bg-indigo-50 border-indigo-200 text-indigo-700 border" : "bg-slate-50 border-slate-200 text-slate-600 border hover:bg-slate-100")}
            >
              <Database className="w-4 h-4" />
              Chọn từ kho đề
            </button>
            <button
              onClick={() => { setTopicMode("scan"); setTopic(""); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all", topicMode === "scan" ? "bg-indigo-50 border-indigo-200 text-indigo-700 border" : "bg-slate-50 border-slate-200 text-slate-600 border hover:bg-slate-100")}
            >
              <Camera className="w-4 h-4" />
              Tải ảnh đề bài
            </button>
            <button
              onClick={() => { setTopicMode("manual"); setTopic(""); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all", topicMode === "manual" ? "bg-indigo-50 border-indigo-200 text-indigo-700 border" : "bg-slate-50 border-slate-200 text-slate-600 border hover:bg-slate-100")}
            >
              <PenTool className="w-4 h-4" />
              Tự nhập đề bài
            </button>
          </div>

          <div className="mt-4">
            {topicMode === "bank" && (
              <div className="relative">
                <button 
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-left flex items-center justify-between hover:border-indigo-300 transition-colors focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  <span className={topic ? "text-slate-900" : "text-slate-400"}>
                    {topic || "Tìm kiếm và chọn đề từ kho đề (Gọi từ API)..."}
                  </span>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>
                
                {showBankDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {activeQuestions.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        Kho đề đang trống hoặc giáo viên đã ẩn tất cả đề.
                      </div>
                    )}
                    {activeQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setTopic(q.question);
                          setShowBankDropdown(false);
                          // Giả lập call API lấy Rubric
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-2 border-b border-slate-50 last:border-0"
                      >
                        <div className="mt-0.5">
                          {topic === q.question ? <Check className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-indigo-600 mb-1">{q.topic || "Chưa phân loại"}</div>
                          <span className="text-slate-700 text-sm line-clamp-2">{q.question}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {topic && <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Tự động tải ngầm Đáp án mẫu và Rubric tương ứng từ kho đề thành công.</div>}
              </div>
            )}

            {topicMode === "scan" && (
              <div className="space-y-4">
                {!isScanningTopic && scannedQuestions.length === 0 ? (
                  <div 
                    onClick={() => {
                      setIsScanningTopic(true);
                      setTimeout(() => {
                        setIsScanningTopic(false);
                        setScannedQuestions([
                          "Câu 1: Nêu ý nghĩa lịch sử của chiến thắng Điện Biên Phủ.",
                          "Câu 2: Phân tích sự chuyển biến của phong trào công nhân Việt Nam trong giai đoạn 1919-1925."
                        ]);
                      }, 2000);
                    }}
                    className="w-full px-4 py-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-indigo-600"
                  >
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="font-medium">Nhấn để tải hoặc chụp danh sách câu hỏi</span>
                    <span className="text-xs mt-1 text-slate-400">Hỗ trợ JPG, PNG, PDF</span>
                  </div>
                ) : isScanningTopic ? (
                  <div className="w-full px-4 py-8 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-500">
                    <ScanText className="w-8 h-8 mb-2 animate-pulse text-indigo-500" />
                    <span className="font-medium text-indigo-600 animate-pulse">AI đang phân tích ảnh và trích xuất câu hỏi...</span>
                  </div>
                ) : (
                  <div className="space-y-3 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                    <p className="text-sm font-medium text-slate-700">AI đã liệt kê danh sách câu hỏi trích xuất, vui lòng xác nhận câu muốn chấm:</p>
                    <div className="space-y-2">
                       {scannedQuestions.map((q, idx) => (
                         <div 
                           key={idx} 
                           onClick={() => setTopic(q)}
                           className={cn("p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-2", topic === q ? "bg-white border-indigo-500 ring-1 ring-indigo-500" : "bg-white border-slate-200 hover:border-indigo-300")}
                         >
                            <div className="mt-0.5 shrink-0">
                              {topic === q ? <Check className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                            </div>
                            <span className="text-sm text-slate-700 leading-relaxed">{q}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {topicMode === "manual" && (
              <div className="space-y-2">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Phân tích nguyên nhân thắng lợi của Cách mạng tháng Tám 1945..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none h-24 text-slate-700"
                />
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 mt-2">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Lưu ý:</strong> Với đề tự nhập, AI sẽ sử dụng kiến thức hệ thống để chấm điểm thay vì đáp án mẫu chuẩn.
                  </p>
                </div>
              </div>
            )}
          </div>
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
