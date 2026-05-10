import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Download, Upload, Filter, Save, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuestionBank, QuestionRow } from "@/context/QuestionBankContext";

export function QuestionBankManager() {
  const { questions, setQuestions } = useQuestionBank();
  
  // Local state for editing. Syncs to context only on "Save".
  const [data, setData] = useState<QuestionRow[]>(questions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [isSaved, setIsSaved] = useState(false);

  // When context updates externally (optional, if we want two-way sync), we could listen. 
  // But here teacher is the source of truth for edits. Let's just initialize once or sync if context changes entirely natively.
  useEffect(() => {
    setData(questions);
  }, [questions]);

  const topics = Array.from(new Set(data.map(item => item.topic)));

  const handleUpdateField = (id: string, field: keyof QuestionRow, value: any) => {
    setData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    setIsSaved(false);
  };

  const handleAddRow = () => {
    setData(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        topic: "",
        question: "",
        modelAnswer: "",
        hasCustomRubric: false,
        isVisible: true
      }
    ]);
    setIsSaved(false);
  };

  const handleDeleteRow = (id: string) => {
    setData(prev => prev.filter(row => row.id !== id));
    setIsSaved(false);
  };

  const handleSave = () => {
    setQuestions(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Ẩn thông báo sau 3s
  };

  const filteredData = data.filter(row => {
    const matchesSearch = row.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = filterTopic === "all" || row.topic === filterTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Kho đề</h2>
          <p className="text-slate-500 mt-1 text-sm">Quản lý câu hỏi và đáp án mẫu.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
             <Upload className="w-4 h-4" />
             Import Excel
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
             <Download className="w-4 h-4" />
             Export CSV
           </button>
           <button 
             onClick={handleSave}
             className={cn(
               "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm",
               isSaved ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
             )}
           >
             {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             {isSaved ? "Đã lưu thành công" : "Lưu thay đổi"}
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
           <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Tìm kiếm câu hỏi..." 
             className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg py-2 pl-3 pr-8 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none bg-slate-50"
            >
              <option value="all">Tất cả chủ đề</option>
              {topics.filter(Boolean).map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button 
             onClick={handleAddRow}
             className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
             <Plus className="w-4 h-4" />
             Thêm dòng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                   <th className="p-4 font-semibold w-[20%]">Chủ đề</th>
                   <th className="p-4 font-semibold w-[35%]">Câu hỏi</th>
                   <th className="p-4 font-semibold w-[35%]">Đáp án mẫu (Model Answer)</th>
                   <th className="p-4 font-semibold text-center w-[10%]">Thao tác</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredData.map((row) => (
                  <tr key={row.id} className={cn("group transition-colors", row.isVisible ? "hover:bg-slate-50" : "bg-slate-50/50 opacity-70")}>
                     <td className="p-3 align-top">
                       <input 
                         type="text" 
                         value={row.topic}
                         onChange={(e) => handleUpdateField(row.id, 'topic', e.target.value)}
                         placeholder="Nhập chủ đề..."
                         className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded p-2 text-sm outline-none transition-all"
                       />
                     </td>
                     <td className="p-3 align-top">
                       <textarea 
                         value={row.question}
                         onChange={(e) => handleUpdateField(row.id, 'question', e.target.value)}
                         placeholder="Nhập nội dung đề bài..."
                         rows={4}
                         className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded p-2 text-sm outline-none resize-y transition-all leading-relaxed"
                       />
                     </td>
                     <td className="p-3 align-top">
                       <textarea 
                         value={row.modelAnswer}
                         onChange={(e) => handleUpdateField(row.id, 'modelAnswer', e.target.value)}
                         placeholder="Nhập nội dung đáp án chuẩn ({model_answer})..."
                         rows={4}
                         className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded p-2 text-sm outline-none resize-y transition-all font-mono text-xs leading-relaxed text-indigo-900"
                       />
                     </td>
                     <td className="p-3 align-top">
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <button 
                            onClick={() => handleUpdateField(row.id, 'isVisible', !row.isVisible)}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              row.isVisible 
                                ? "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" 
                                : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            )}
                            title={row.isVisible ? "Đang hiển thị (Nhấn để ẩn)" : "Đang ẩn (Nhấn để hiện)"}
                          >
                            {row.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa dòng"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="text-[10px] mt-1 font-medium text-slate-500 text-center">
                          {row.isVisible ? "Hiển thị" : "Bị ẩn"}
                        </div>
                     </td>
                  </tr>
                ))}
                
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Không tìm thấy câu hỏi nào phù hợp.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
