import { useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronRight, ArrowLeft } from "lucide-react";
import { sampleResult } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function ResultView({ onBack }: { onBack: () => void }) {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  // Quick utility to wrap highlighted text in the paragraph
  const renderTextWithHighlights = () => {
    let resultText = sampleResult.text;
    
    // We will do a simple string replace for demo purposes.
    // In a real app, this should be done with proper AST or offset mapping.
    let elementArr: ReactNode[] = [];
    let currentIndex = 0;

    sampleResult.highlights.forEach((hl, i) => {
      const start = resultText.indexOf(hl.text, currentIndex);
      if (start !== -1) {
        // Text before highlight
        elementArr.push(<span key={`text-${i}`}>{resultText.substring(currentIndex, start)}</span>);
        // Highlight itself
        elementArr.push(
          <mark 
            key={`hl-${i}`} 
            onMouseEnter={() => setActiveHighlight(i)}
            onMouseLeave={() => setActiveHighlight(null)}
            className={cn(
              "px-1 py-0.5 rounded cursor-pointer transition-colors",
              hl.type === 'positive' && "bg-green-100 text-green-900 hover:bg-green-200",
              hl.type === 'warning' && "bg-amber-100 text-amber-900 hover:bg-amber-200",
              activeHighlight === i && "ring-2 ring-indigo-500 ring-offset-1"
            )}
          >
            {hl.text}
          </mark>
        );
        currentIndex = start + hl.text.length;
      }
    });

    // Remaining text
    elementArr.push(<span key="end">{resultText.substring(currentIndex)}</span>);

    return elementArr;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">Chi tiết Bài chấm</h2>
             <p className="text-sm text-slate-500">Được chấm bởi AI Mentor • Cách đây ít phút</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-500">Tổng điểm</div>
            <div className="text-3xl font-black text-indigo-600">{sampleResult.score}<span className="text-lg text-slate-400 font-medium">/10</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Essay & Rubric */}
        <div className="flex flex-col gap-6 h-full">
          {/* Essay Area */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-y-auto">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileIcon /> Văn bản bài làm
            </h3>
            <div className="text-slate-700 leading-relaxed text-lg">
              {renderTextWithHighlights()}
            </div>
            
            {/* Active Highlight Info Toolkit (Mobile fallback/sticky context) */}
            {activeHighlight !== null && (
              <div className="mt-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50 animate-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  {sampleResult.highlights[activeHighlight].type === 'positive' ? 
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" /> : 
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />}
                  <p className="text-sm font-medium text-slate-800">
                    {sampleResult.highlights[activeHighlight].comment}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rubric Area */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-800 mb-4">Bảng điểm Rubric</h3>
             <div className="space-y-3">
               {sampleResult.rubric.map((item, idx) => (
                 <div key={idx} className="group relative">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-colors">
                      <span className="font-medium text-slate-700">{item.criteria}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.score}</span>
                        <span className="text-slate-400 text-sm">/ {item.maxScore}</span>
                      </div>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute left-0 bottom-full mb-2 w-full invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                      <div className="bg-slate-900 text-white text-sm p-3 rounded-lg shadow-xl">
                        {item.description}
                        {/* Little triangle arrow */}
                        <div className="absolute left-6 -bottom-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: AI Feedback Cards */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 overflow-y-auto h-full space-y-6">
           <h3 className="font-semibold text-slate-800 pb-2 border-b border-slate-200">Phản hồi từ AI</h3>
           
           {/* Positive */}
           <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-green-900">Điểm sáng (Khen ngợi)</h4>
              </div>
              <ul className="p-4 space-y-2">
                {sampleResult.feedback.praise.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-green-500 mt-0.5">•</span>
                    {p}
                  </li>
                ))}
              </ul>
           </div>

           {/* Warnings */}
           <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-amber-900">Điểm cần lưu ý (Cảnh báo)</h4>
              </div>
              <ul className="p-4 space-y-2">
                {sampleResult.feedback.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {w}
                  </li>
                ))}
              </ul>
           </div>

           {/* Guidance */}
           <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden relative overflow-hidden">
              {/* Highlight background gradient */}
              <div className="absolute top-0 right-0 p-16 bg-blue-100 blur-3xl opacity-50 rounded-full mix-blend-multiply border-none pointer-events-none"></div>

              <div className="bg-blue-600 px-4 py-3 flex items-center gap-2 text-white relative z-10">
                <Lightbulb className="w-5 h-5 text-blue-100" />
                <h4 className="font-bold">Gợi ý mở rộng (Hướng dẫn)</h4>
              </div>
              <div className="p-4 relative z-10">
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                  {sampleResult.feedback.guidance.split("Thử viết thêm 1 đoạn: ")[0]}
                </p>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                  <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-600 uppercase tracking-wider">Đoạn văn mẫu AI gợi ý</div>
                  <p className="text-sm text-slate-600 italic leading-relaxed mt-1">
                    "{sampleResult.feedback.guidance.split("Thử viết thêm 1 đoạn: '")[1]?.replace(/'$/, '')}"
                  </p>
                </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}

// Simple internal icon for UI cleanline
function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
  )
}
