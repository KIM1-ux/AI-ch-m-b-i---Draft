import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, Trash2, Eye, Database, Brain, CheckCircle2, AlertCircle, FileType2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface KnowledgeDoc {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  status: "ready" | "processing" | "error";
  isActive: boolean;
}

const INITIAL_DOCS: KnowledgeDoc[] = [
  { id: "1", name: "Sgk_Lich_Su_9_Chuan.pdf", type: "pdf", date: "09/05/2026", size: "12.5 MB", status: "ready", isActive: true },
  { id: "2", name: "Chuyen_De_CMT8_Bo_sung.docx", type: "docx", date: "08/05/2026", size: "2.1 MB", status: "ready", isActive: true },
  { id: "3", name: "TL_Boi_Duong_HSG.txt", type: "txt", date: "10/05/2026", size: "45 KB", status: "error", isActive: false },
];

interface Stats {
  total_files: number;
  total_size_mb: string | number;
  ai_ready: boolean;
  is_processing: boolean;
}

export function KnowledgeBase() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [stats, setStats] = useState<Stats>({ total_files: 0, total_size_mb: 0, ai_ready: false, is_processing: false });
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchKnowledgeData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch("/api/knowledge/stats"),
        fetch("/api/knowledge/list")
      ]);
      const statsData = await statsRes.json();
      const listData = await listRes.json();
      
      setStats(statsData);
      
      // Map API data to KnowledgeDoc type
      const mappedDocs: KnowledgeDoc[] = listData.map((d: any) => ({
        id: d.id,
        name: d.file_name,
        type: d.file_type,
        date: new Date(d.created_at).toLocaleDateString('vi-VN'),
        size: (d.file_size / (1024 * 1024)).toFixed(1) + " MB",
        status: d.status,
        isActive: d.is_active
      }));
      setDocs(mappedDocs);
    } catch (error) {
      console.error("Failed to fetch knowledge data", error);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
    const intervalId = setInterval(fetchKnowledgeData, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const totalDocs = stats.total_files;
  const isProcessing = stats.is_processing;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => {
      console.log('File nhận được:', f);
      formData.append("files", f);
    });
    
    try {
      await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData
      });
      fetchKnowledgeData();
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e) {
      console.error("Upload error", e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const toggleActive = async (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
    try {
      await fetch(`/api/knowledge/toggle-active/${id}`, { method: "PATCH" });
    } catch (e) {
      console.error(e);
      fetchKnowledgeData(); // Revert on failure
    }
  };

  const deleteDoc = async (id: string) => {
    try {
      await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      fetchKnowledgeData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 right-8 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold text-sm">Học tài liệu thành công!</p>
              <p className="text-xs mt-0.5 text-emerald-600">AI đã cập nhật kiến thức mới vào bộ nhớ.</p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="ml-4 text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Base <span className="text-indigo-600 text-xl">(RAG)</span></h2>
          <p className="text-slate-500 mt-1">Cung cấp tài liệu chuyên môn để AI học và ưu tiên sử dụng khi chấm bài.</p>
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tài liệu đã nạp</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalDocs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-xl transition-colors duration-500", isProcessing ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600")}>
              <Brain className={cn("w-6 h-6", isProcessing && "animate-pulse")} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Trạng thái AI</p>
              <p className={cn("text-xl font-bold mt-1 transition-colors", isProcessing ? "text-amber-600" : "text-indigo-600")}>
                 {isProcessing ? "Đang học dữ liệu..." : "AI Ready"}
              </p>
            </div>
          </div>
          {isProcessing && <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-1 space-y-4">
           <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
             className={cn(
               "w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 bg-white",
               isDragging 
                 ? "border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-xl" 
                 : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
             )}
           >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
              />
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors", isDragging ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Kéo thả tài liệu vào đây</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Hoặc <span className="text-indigo-600 font-semibold">nhấn để chọn file</span> từ thiết bị.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span>.PDF</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>.DOCX</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>.TXT</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Không giới hạn</span>
              </div>
           </div>

           <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex gap-3">
              <div className="mt-0.5 text-indigo-500">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-900">Cách AI sử dụng tài liệu</h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  Khi AI chấm bài (nhất là đề tự nhập), nó sẽ dùng kỹ thuật <strong>Semantic Search</strong> để đối chiếu với kho tài liệu này trước. AI sẽ bám sát quan điểm và thuật ngữ chuyên sâu của bạn.
                </p>
              </div>
           </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[400px]">
           <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <FileText className="w-5 h-5 text-indigo-500" />
               Danh sách tài liệu tri thức
             </h3>
           </div>
           
           <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {docs.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  Chưa có tài liệu nào. Hãy nạp thêm dữ liệu để AI thông minh hơn.
                </div>
              )}
              {docs.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center hover:bg-slate-50 transition-colors gap-4">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {doc.type === 'pdf' && <span className="text-red-500 font-bold text-xs">PDF</span>}
                      {doc.type === 'docx' && <span className="text-blue-500 font-bold text-xs">DOC</span>}
                      {doc.type === 'txt' && <span className="text-slate-500 font-bold text-xs">TXT</span>}
                      {['pdf', 'docx', 'txt'].indexOf(doc.type) === -1 && <FileText className="w-5 h-5 text-slate-400" />}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate" title={doc.name}>{doc.name}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                         <span>{doc.date}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                         <span>{doc.size}</span>
                      </div>
                   </div>

                   <div className="shrink-0 w-32 flex flex-col items-end gap-2">
                     {doc.status === "processing" && (
                       <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 w-full justify-center">
                         <Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý
                       </div>
                     )}
                     {doc.status === "ready" && (
                       <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 w-full justify-center">
                         <CheckCircle2 className="w-3 h-3" /> Đã học
                       </div>
                     )}
                     {doc.status === "error" && (
                       <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 w-full justify-center">
                         <AlertCircle className="w-3 h-3" /> Lỗi đọc file
                       </div>
                     )}
                   </div>

                   <div className="shrink-0 flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                     <div className="flex flex-col items-center gap-1">
                       <label className="text-[10px] font-semibold text-slate-400 uppercase">Sử dụng</label>
                       {/* Custom Toggle */}
                       <button 
                         disabled={doc.status !== "ready"}
                         onClick={() => toggleActive(doc.id)} 
                         className={cn(
                           "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
                           doc.isActive ? "bg-indigo-600" : "bg-slate-200"
                         )}
                       >
                         <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", doc.isActive ? "translate-x-4" : "translate-x-0")} />
                       </button>
                     </div>

                     <div className="flex items-center gap-1">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Xem trước">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteDoc(doc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tài liệu">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
