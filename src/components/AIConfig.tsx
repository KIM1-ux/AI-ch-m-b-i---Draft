import { useState, useEffect } from "react";
import { Save, Bot, SlidersHorizontal, MessageSquare, Wand2, CheckCircle2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    id: "academic",
    label: "Học thuật",
    content: "Bạn là một giám khảo chuyên môn cao đánh giá bài thi Học sinh giỏi Quốc gia môn Lịch sử. Yêu cầu khắt khe về từ ngữ chuyên ngành, độ chính xác tuyệt đối của niên đại và sự phân tích chiều sâu của nguyên nhân - hệ quả."
  },
  {
    id: "encouraging",
    label: "Khích lệ",
    content: "Bạn là một giáo viên Lịch sử tâm huyết. Hãy chấm điểm công tâm nhưng luôn dùng lời lẽ động viên, tìm ra điểm sáng trong bài viết của học sinh để khen ngợi trước khi góp ý những phần còn thiếu sót."
  },
  {
    id: "strict",
    label: "Nghiêm khắc",
    content: "Bạn là một giám khảo chấm thi trực diện. Chỉ ra ngay lập tức các lỗi sai kiến thức lịch sử, trừ điểm nặng các lỗi nhầm lẫn sự kiện, mốc thời gian. Không dùng từ ngữ hoa mỹ, đi thẳng vào vấn đề."
  }
];

const INITIAL_RUBRIC = [
  { id: "accuracy", label: "Tính chính xác sự kiện", value: 20 },
  { id: "completeness", label: "Mức độ đầy đủ ý", value: 30 },
  { id: "logic", label: "Tư duy logic & Phân tích", value: 20 },
  { id: "critical", label: "Phản biện & Liên hệ", value: 15 },
  { id: "expression", label: "Diễn đạt & Thuật ngữ", value: 15 },
];

export function AIConfig() {
  const [instruction, setInstruction] = useState("");
  const [rubric, setRubric] = useState(INITIAL_RUBRIC);
  const [autoBalance, setAutoBalance] = useState(false);
  const [tone, setTone] = useState("friendly");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        setInstruction(data.system_instruction || "");
        setTone(data.feedback_tone || "friendly");
        if (data.rubric_weights) {
          const newRubric = Object.entries(data.rubric_weights).map(([k, v]) => {
             const existing = INITIAL_RUBRIC.find(r => r.id === k);
             return { id: k, label: existing ? existing.label : k, value: v as number };
          });
          setRubric(newRubric);
        }
        setIsLoading(false);
      });
  }, []);

  const totalPercentage = rubric.reduce((acc, curr) => acc + curr.value, 0);

  const handleSliderChange = (id: string, newValue: number) => {
    if (!autoBalance) {
      setRubric(prev => prev.map(item => item.id === id ? { ...item, value: newValue } : item));
      return;
    }

    // Auto-balance logic
    setRubric(prev => {
      const oldItem = prev.find(i => i.id === id);
      if (!oldItem) return prev;
      
      const diff = newValue - oldItem.value;
      let remainingToAdjust = -diff;
      
      const otherItems = prev.filter(i => i.id !== id);
      
      // Copy to adjust
      let updatedOtherItems = otherItems.map(item => ({ ...item }));
      
      // Round-robin adjustment
      let safetyCounter = 0;
      while (remainingToAdjust !== 0 && safetyCounter < 100) {
        safetyCounter++;
        for (let i = 0; i < updatedOtherItems.length; i++) {
          if (remainingToAdjust === 0) break;
          
          if (remainingToAdjust > 0 && updatedOtherItems[i].value < 100) {
            updatedOtherItems[i].value += 1;
            remainingToAdjust -= 1;
          } else if (remainingToAdjust < 0 && updatedOtherItems[i].value > 0) {
            updatedOtherItems[i].value -= 1;
            remainingToAdjust += 1;
          }
        }
      }

      return prev.map(item => {
        if (item.id === id) return { ...item, value: newValue };
        const updated = updatedOtherItems.find(u => u.id === item.id);
        return updated ? updated : item;
      });
    });
  };

  const handleSave = async () => {
    if (totalPercentage !== 100) return;
    setIsSaved(true);
    
    // Construct payload
    const payload = {
      system_instruction: instruction,
      feedback_tone: tone,
      rubric_weights: rubric.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.value }), {})
    };

    await fetch("/api/config/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cấu hình AI & Rubric</h2>
          <p className="text-slate-500 mt-1">Điều chỉnh cách AI đánh giá, phân bổ điểm số và tông giọng phản hồi.</p>
        </div>
        <div>
           <button 
             onClick={handleSave}
             disabled={totalPercentage !== 100}
             className={cn(
               "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm",
               totalPercentage !== 100 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : isSaved 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
             )}
           >
             {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
             {isSaved ? "Đã lưu cấu hình" : "Lưu cấu hình"}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Instruction & Feedback Tone */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: System Instruction */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Bot className="w-5 h-5 text-indigo-500" />
                 Chỉ dẫn hệ thống (System Instruction)
               </h3>
               <div className="group relative">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100">
                    <Wand2 className="w-4 h-4" />
                    Sử dụng mẫu
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-10 overflow-hidden">
                    <div className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Chọn mẫu chỉ dẫn</div>
                    <div className="divide-y divide-slate-100">
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => setInstruction(t.content)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors">
                           <div className="font-semibold text-slate-900 mb-1">{t.label}</div>
                           <div className="line-clamp-3 text-xs text-slate-500 leading-relaxed">{t.content}</div>
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
            <div className="p-6">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Nhập vai trò và quy tắc chấm điểm cho AI... Ví dụ: Bạn là chuyên gia sử học, ưu tiên tính chính xác của niên đại và khả năng phản biện."
                className="w-full h-48 p-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none text-slate-700 leading-relaxed placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Section 3: Feedback Tone */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <MessageSquare className="w-5 h-5 text-indigo-500" />
                 Tông giọng phản hồi (Feedback Tone)
               </h3>
             </div>
             <div className="p-6">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    onClick={() => setTone("academic")}
                    className={cn(
                      "cursor-pointer p-5 rounded-xl border-2 transition-all",
                      tone === "academic" ? "border-indigo-600 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-300 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={cn("font-bold", tone === "academic" ? "text-indigo-900" : "text-slate-800")}>Hàn lâm</h4>
                      <div className={cn("w-4 h-4 rounded-full border-[3px]", tone === "academic" ? "border-indigo-600 bg-indigo-600 shadow-[inset_0_0_0_2px_#ffffff]" : "border-slate-300")} />
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">Chuyên nghiệp, tinh gọn, sử dụng nhiều thuật ngữ chuyên ngành.</p>
                  </div>

                  <div 
                    onClick={() => setTone("friendly")}
                    className={cn(
                      "cursor-pointer p-5 rounded-xl border-2 transition-all",
                      tone === "friendly" ? "border-indigo-600 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-300 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={cn("font-bold", tone === "friendly" ? "text-indigo-900" : "text-slate-800")}>Thân thiện</h4>
                      <div className={cn("w-4 h-4 rounded-full border-[3px]", tone === "friendly" ? "border-indigo-600 bg-indigo-600 shadow-[inset_0_0_0_2px_#ffffff]" : "border-slate-300")} />
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">Khích lệ, nhẹ nhàng, truyền cảm hứng và động lực học tập.</p>
                  </div>

                  <div 
                    onClick={() => setTone("strict")}
                    className={cn(
                      "cursor-pointer p-5 rounded-xl border-2 transition-all",
                      tone === "strict" ? "border-red-500 bg-red-50/30" : "border-slate-200 hover:border-red-300 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={cn("font-bold", tone === "strict" ? "text-red-900" : "text-slate-800")}>Trực diện</h4>
                      <div className={cn("w-4 h-4 rounded-full border-[3px]", tone === "strict" ? "border-red-500 bg-red-500 shadow-[inset_0_0_0_2px_#ffffff]" : "border-slate-300")} />
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">Sửa lỗi thẳng thắn, trừ điểm gắt gao, không hoa mỹ.</p>
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Rubric Sliders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
           <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-5 flex flex-col gap-4">
             <h3 className="font-bold text-slate-800 flex items-center justify-between">
               <span className="flex items-center gap-2">
                 <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                 Trọng số Rubric
               </span>
               <div className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-black tracking-tight",
                  totalPercentage === 100 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
               )}>
                 TỔNG: {totalPercentage}%
               </div>
             </h3>
             <label className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <input 
                  type="checkbox" 
                  checked={autoBalance} 
                  onChange={(e) => setAutoBalance(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                Tự động cân bằng (luôn giữ 100%)
             </label>
           </div>

           <div className="p-6 space-y-8">
              {rubric.map((item) => (
                <div key={item.id} className="space-y-4 group relative">
                   <div className="flex items-center justify-between gap-4">
                     <input 
                       className="text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full transition-colors"
                       value={item.label}
                       onChange={(e) => setRubric(rubric.map(r => r.id === item.id ? { ...r, label: e.target.value } : r))}
                       placeholder="Tên tiêu chí"
                     />
                     <div className="flex items-center gap-2">
                       <input 
                         type="number"
                         min="0"
                         max="100"
                         value={item.value}
                         onChange={(e) => handleSliderChange(item.id, parseInt(e.target.value) || 0)}
                         className="text-lg font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-16 text-center outline-none focus:ring-2 focus:ring-indigo-500"
                       />
                       <span className="text-slate-500 font-medium">%</span>
                       <button 
                         onClick={() => setRubric(rubric.filter(r => r.id !== item.id))} 
                         className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         title="Xóa tiêu chí"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                   <input 
                     type="range"
                     min="0"
                     max="100"
                     value={item.value}
                     onChange={(e) => handleSliderChange(item.id, parseInt(e.target.value))}
                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                   />
                </div>
              ))}
              
              <button 
                onClick={() => setRubric([...rubric, { id: `custom_${Date.now()}`, label: "Tiêu chí mới", value: 0 }])}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm tiêu chí (Tối đa: 100%)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
