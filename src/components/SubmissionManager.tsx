import { useState, useEffect } from "react";
import { Search, Filter, Eye, CheckCircle2, RefreshCw, X, FileText, AlertCircle, TrendingUp, Hand, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Submission {
  id: string;
  student_name: string;
  topic_id: string | null;
  topic_title: string;
  submission_date: number;
  content: string;
  ai_score: number;
  final_score: number | null;
  status: 'pending' | 'approved' | 'revising' | 'appealing';
  ai_feedback: string;
  confidence_score: number;
  teacher_note: string;
}

interface Stats {
  total_submissions: number;
  pending_submissions: number;
  appealing_submissions: number;
  class_average: number | string;
}

export function SubmissionManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>({ total_submissions: 0, pending_submissions: 0, appealing_submissions: 0, class_average: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>("");

  const fetchSubmissions = async () => {
    try {
      const [statsRes, subsRes] = await Promise.all([
        fetch("/api/submissions/stats"),
        fetch(`/api/submissions?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`)
      ]);
      const statsData = await statsRes.json();
      const subsData = await subsRes.json();
      setStats(statsData);
      setSubmissions(subsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    const intId = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(intId);
  }, [statusFilter, searchTerm]);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/submissions/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      fetchSubmissions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegrade = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/submissions/${id}/regrade`, { method: "POST" });
      // Instant UI feedback for regrade
      setTimeout(fetchSubmissions, 1600);
    } catch (e) {
      console.error(e);
    }
  };

  const openDetails = (sub: Submission) => {
    setSelectedSub(sub);
    setEditScore(sub.final_score ?? sub.ai_score);
    setEditNote(sub.teacher_note || "");
  };

  const handleSaveDetails = async () => {
    if (!selectedSub) return;
    try {
      await fetch(`/api/submissions/${selectedSub.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          final_score: editScore,
          teacher_note: editNote
        })
      });
      fetchSubmissions();
      setSelectedSub(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative flex flex-col min-h-[calc(100vh-2rem)]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý bài làm</h2>
          <p className="text-slate-500 mt-1">Quản lý toàn bộ bài làm, phê duyệt điểm AI hoặc chấm thủ công.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
         <StatsCard label="Tổng bài nộp" value={stats.total_submissions} icon={FileText} color="indigo" />
         <StatsCard label="Chờ phê duyệt" value={stats.pending_submissions} icon={AlertCircle} color="amber" />
         <StatsCard label="Trung bình lớp" value={stats.class_average} icon={TrendingUp} color="emerald" />
         <StatsCard label="Xin phúc khảo" value={stats.appealing_submissions} icon={Hand} color="red" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 shrink-0">
        <div className="relative flex-1">
           <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Tìm học sinh, tên đề bài..." 
             className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <Filter className="w-4 h-4 text-slate-400" />
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="text-sm border border-slate-200 rounded-lg py-2 pl-3 pr-8 focus:border-indigo-500 outline-none appearance-none bg-slate-50"
           >
             <option value="all">Tất cả trạng thái</option>
             <option value="pending">Chờ phê duyệt</option>
             <option value="approved">Đã phê duyệt</option>
             <option value="revising">Nộp lại</option>
             <option value="appealing">Xin phúc khảo</option>
           </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-auto bg-white min-h-[400px]">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
               <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Học sinh</th>
                  <th className="p-4 w-[35%]">Đề bài</th>
                  <th className="p-4 bg-slate-50">Ngày nộp</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Điểm số</th>
                  <th className="p-4 text-right">Thao tác</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               <AnimatePresence>
                 {submissions.map((sub) => (
                   <motion.tr 
                     key={sub.id} 
                     layout
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                     onClick={() => openDetails(sub)}
                   >
                      <td className="p-4 align-middle">
                        <div className="font-bold text-slate-800">{sub.student_name}</div>
                        <div className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">
                          Nguồn: {sub.topic_id ? 'Kho đề' : 'Tự nhập'}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm font-medium text-slate-700 line-clamp-1 truncate">{sub.topic_title}</div>
                      </td>
                      <td className="p-4 align-middle text-sm text-slate-500 whitespace-nowrap">
                        {new Date(sub.submission_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <StatusBadge status={sub.status} confidence={sub.confidence_score} />
                      </td>
                      <td className="p-4 align-middle text-center">
                         <div className="text-lg font-black text-indigo-900 border-b-2 border-indigo-100 inline-block px-1">
                           {sub.final_score !== null ? sub.final_score : sub.ai_score}
                         </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                         <div className="flex items-center justify-end gap-2">
                            {sub.status === 'pending' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleApprove(sub.id); }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Duyệt nhanh"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => handleRegrade(sub.id, e)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="AI Chấm lại"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                   </motion.tr>
                 ))}
               </AnimatePresence>
               {submissions.length === 0 && (
                 <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Không tìm thấy bài làm nào.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* Details Slide-Over */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSub(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col"
            >
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Chi tiết bài làm: {selectedSub.student_name}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{selectedSub.topic_title}</p>
                  </div>
                  <button onClick={() => setSelectedSub(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex-1 overflow-auto flex">
                  {/* Left: Student Content */}
                  <div className="w-1/2 p-6 border-r border-slate-100 overflow-y-auto">
                     <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between">
                       <span>Bài làm của học sinh</span>
                       <span className="text-indigo-500">Word count: {selectedSub.content.split(' ').length}</span>
                     </div>
                     <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-loose">
                        {selectedSub.content.split('. ').map((s, i) => (
                           <span key={i} className={i === 1 ? "bg-amber-100/50 border-b border-amber-300" : ""}>{s}. </span>
                        ))}
                     </div>
                  </div>

                  {/* Right: AI Review & Teacher Override */}
                  <div className="w-1/2 p-6 flex flex-col bg-slate-50/50 overflow-y-auto">
                     <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Đánh giá của AI</div>
                     
                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
                        <div className="flex items-start justify-between mb-3 border-b border-slate-100 pb-3">
                           <div>
                             <div className="text-sm font-semibold text-slate-800">Điểm AI đề xuất</div>
                             <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                               Độ tự tin: <span className={cn("font-bold", selectedSub.confidence_score > 80 ? "text-emerald-600" : "text-amber-600")}>{selectedSub.confidence_score}%</span>
                             </div>
                           </div>
                           <div className="text-3xl font-black text-indigo-600">{selectedSub.ai_score}</div>
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                           {parseFeedback(selectedSub.ai_feedback)}
                        </div>
                     </div>

                     <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Đánh giá chung (Giáo viên)</div>
                     <div className="space-y-5 flex-1 w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 block mb-2">Điểm chính thức</label>
                          <input 
                            type="number" 
                            step="0.5" 
                            min="0" 
                            max="10"
                            className="w-full text-2xl font-bold bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            value={editScore}
                            onChange={(e) => setEditScore(parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                           <label className="text-sm font-semibold text-slate-700 block mb-2">Ghi chú thêm (Sẽ cộng gộp với nội dung AI gửi hs)</label>
                           <textarea 
                             rows={4}
                             className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                             placeholder="Nhập nhận xét riêng của bạn..."
                             value={editNote}
                             onChange={(e) => setEditNote(e.target.value)}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
                  <button onClick={() => setSelectedSub(null)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                    Hủy
                  </button>
                  <button 
                    onClick={handleSaveDetails}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Lưu & Phê duyệt
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function parseFeedback(raw: string) {
  try {
    const data = JSON.parse(raw);
    return (
      <div className="space-y-2">
        <p>"{data.general}"</p>
        {data.strengths?.length > 0 && <p className="text-emerald-600 not-italic font-medium text-xs">Điểm mạnh: {data.strengths.join(", ")}</p>}
        {data.weaknesses?.length > 0 && <p className="text-red-500 not-italic font-medium text-xs">Cần cải thiện: {data.weaknesses.join(", ")}</p>}
      </div>
    );
  } catch (e) {
    return `"${raw}"`;
  }
}

function StatusBadge({ status, confidence }: { status: string, confidence: number }) {
  if (status === 'approved') {
    return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border border-emerald-100 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Đã Duyệt</span>;
  }
  if (status === 'appealing') {
    return <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border border-red-100 inline-flex items-center gap-1"><Hand className="w-3 h-3"/> Phúc Khảo</span>;
  }
  if (status === 'revising') {
    return <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border border-blue-100 inline-flex items-center gap-1"><RefreshCw className="w-3 h-3"/> Nộp lại</span>;
  }
  
  const isFlagged = confidence < 70;
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border inline-flex items-center gap-1",
      isFlagged ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-orange-50 text-orange-700 border-orange-100"
    )}>
      <AlertCircle className="w-3 h-3" />
      Chờ Duyệt
    </span>
  );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  const bgClasses: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };
  
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
      <div className={cn("p-2.5 rounded-lg shrink-0", bgClasses[color])}>
         <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
