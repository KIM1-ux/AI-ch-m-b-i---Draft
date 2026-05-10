import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, FileText, Loader2, User, Clock, Star, StarHalf, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResultView({ submissionId, onBack }: { submissionId?: string, onBack: () => void }) {
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegrading, setIsRegrading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const loadData = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}`);
      const data = await res.json();
      setSubmission(data);
      setEditedContent(data.content || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      loadData(submissionId);
    } else {
      setIsLoading(false);
    }
  }, [submissionId]);

  const handleRegrade = async () => {
    if (!submission) return;
    setIsRegrading(true);
    
    if (isEditing) {
      try {
        await fetch(`/api/submissions/${submission.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editedContent }),
        });
      } catch(e) {
        console.error(e);
        setIsRegrading(false);
        return;
      }
      setIsEditing(false);
    }

    const sse = new EventSource(`/api/submissions/${submission.id}/regrade-stream`);
    
    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.done) {
        sse.close();
        setIsRegrading(false);
        loadData(submission.id);
      } else if (data.partialFeedback) {
        setSubmission((prev: any) => ({
          ...prev, 
          ai_feedback: JSON.stringify(data.partialFeedback) 
        }));
      }
    };

    sse.onerror = (err) => {
      console.error("SSE Error:", err);
      sse.close();
      setIsRegrading(false);
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <p>Không tìm thấy dữ liệu bài làm.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 font-medium">Quay lại</button>
      </div>
    );
  }

  let feedback;
  try {
    const raw = JSON.parse(submission.ai_feedback);
    if (raw.status === "success" && raw.data) {
       let suggestionsArray = [];
       if (Array.isArray(raw.data.feedbacks.suggestions)) {
         suggestionsArray = raw.data.feedbacks.suggestions;
       } else if (typeof raw.data.feedbacks.suggestions === "string") {
         suggestionsArray = [raw.data.feedbacks.suggestions];
       }

       feedback = {
         overview: [raw.data.feedbacks.positive?.[0] || "Đã phân tích xong.", ...suggestionsArray],
         strengths: raw.data.feedbacks.positive || [],
         weaknesses: raw.data.feedbacks.improvements || [],
         rubric_scores: raw.data.rubric_details || []
       };
    } else {
       feedback = raw;
    }
  } catch (e) {
    feedback = { overview: [], strengths: [], weaknesses: [], rubric_scores: [] };
  }

  const displayScore = submission.final_score !== null ? submission.final_score : submission.ai_score;
  
  // Calculate rating based on score
  let ratingText = "Trung bình";
  let stars = 3;
  if (displayScore >= 8) {
    ratingText = "Giỏi";
    stars = 5;
  } else if (displayScore >= 6.5) {
    ratingText = "Khá";
    stars = 4;
  } else if (displayScore < 5) {
    ratingText = "Yếu";
    stars = 2;
  }

  const totalMaxScore = feedback?.rubric_scores?.reduce((acc: number, item: any) => acc + item.maxScore, 0) || 10;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 min-h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-3 relative">
          <button 
            onClick={onBack}
            className="absolute -left-12 top-0 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors hidden xl:block"
            title="Quay lại"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Chi tiết bài chấm</h2>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span><span className="text-slate-500">Học sinh:</span> {submission.student_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span><span className="text-slate-500">Thời gian nộp:</span> {new Date(submission.submission_date).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onBack}
            className="md:hidden flex items-center justify-center p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            Quay lại
          </button>

          <button 
            onClick={handleRegrade}
            disabled={isRegrading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-300 shadow-sm transition-colors disabled:opacity-75 disabled:cursor-wait"
          >
            <RefreshCw className={cn("w-4 h-4", isRegrading && "animate-spin")} />
            <span>Chấm lại</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-6 flex-1">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
               <FileText className="w-5 h-5 text-blue-500" />
               <h3 className="font-bold text-slate-800 text-lg">Đề bài</h3>
             </div>
             <div className="p-6 text-slate-800 leading-relaxed font-sans text-[15px] font-medium">
               {submission.topic_title}
             </div>
          </div>

          {/* Essay Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-[300px]">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-bold text-slate-800 text-lg">Bài làm của học sinh</h3>
               {isEditing ? (
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => {
                        setIsEditing(false);
                        setEditedContent(submission.content);
                     }}
                     className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                   >
                     Hủy
                   </button>
                   <button 
                     onClick={handleRegrade}
                     disabled={isRegrading}
                     className="px-3 py-1.5 text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-75 disabled:cursor-wait"
                   >
                     <RefreshCw className={cn("w-4 h-4", isRegrading && "animate-spin")} /> Lưu & Chấm lại
                   </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-sm"
                 >
                   <Edit3 className="w-4 h-4" /> Sửa bài
                 </button>
               )}
             </div>
             <div className="p-6 flex-1 text-slate-800 leading-relaxed whitespace-pre-wrap font-sans text-[15px]">
               {isEditing ? (
                 <textarea
                   value={editedContent}
                   onChange={(e) => setEditedContent(e.target.value)}
                   className="w-full h-full min-h-[250px] p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                 />
               ) : (
                 submission.content
               )}
             </div>
          </div>

        </div>

        {/* Right Column (Feedback) */}
        <div className="flex flex-col gap-4">
          
          {/* Score Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6 shrink-0">
            <h3 className="font-bold text-slate-800 text-lg">Kết quả chấm điểm</h3>
            
            <div className="flex items-center gap-8">
               {/* Circle Score */}
               <div className="relative w-28 h-28 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#EFF6FF"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3.5"
                      strokeDasharray={`${(displayScore / 10) * 100}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                     <span className="text-3xl font-black text-slate-900 leading-none">{displayScore ? displayScore.toFixed(1) : '-'}</span>
                     <span className="text-sm text-slate-500 font-medium">/10</span>
                  </div>
               </div>

               <div className="flex-1 space-y-3">
                 <div className="flex items-center gap-2">
                   <span className="font-semibold text-slate-800">Xếp loại:</span>
                   <span className="font-bold text-slate-900">{ratingText}</span>
                 </div>
                 
                 <div className="flex items-center gap-1">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <Star 
                       key={star} 
                       className={cn(
                         "w-6 h-6", 
                         star <= stars 
                           ? "fill-amber-400 text-amber-400" 
                           : "fill-slate-100 text-slate-200"
                       )} 
                     />
                   ))}
                 </div>

                 <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                   <span className="font-semibold text-slate-800">Điểm mạnh nổi bật: </span>
                   {feedback?.overview?.[0] || feedback?.strengths?.[0] || "Đang phân tích..."}
                 </p>
               </div>
            </div>
          </div>

          {/* Positive Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden shrink-0">
            <div className="px-5 py-4 border-b border-emerald-100 flex items-center gap-2 bg-emerald-50/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-emerald-800">Nhận xét tích cực</h4>
            </div>
            <div className="p-5 bg-white">
              <ul className="space-y-3">
                {feedback?.strengths?.map((text: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{text}</span>
                  </li>
                ))}
                {(!feedback?.strengths || feedback.strengths.length === 0) && (
                   <li className="text-slate-500 text-sm italic">Đang chấm điểm...</li>
                )}
              </ul>
            </div>
          </div>

          {/* Weaknesses Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden shrink-0">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2 bg-amber-50/50">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-amber-800">Góp ý để cải thiện</h4>
            </div>
            <div className="p-5 bg-amber-50/20">
              <ul className="space-y-3">
                {feedback?.weaknesses?.map((text: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>{text}</span>
                  </li>
                ))}
                {(!feedback?.weaknesses || feedback.weaknesses.length === 0) && (
                   <li className="text-slate-500 text-sm italic">Không có...</li>
                )}
              </ul>
            </div>
          </div>

          {/* Guidance Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden shrink-0">
            <div className="px-5 py-4 border-b border-blue-100 flex items-center gap-2 bg-blue-50/50">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-800">Gợi ý sửa bài</h4>
            </div>
            <div className="p-5 bg-blue-50/20">
              <ul className="space-y-3">
                {/* Fallback to overview or default string if guidance not explicitly provided */}
                {feedback?.overview?.slice(1).map((text: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>{text}</span>
                  </li>
                ))}
                {(!feedback?.overview || feedback.overview.length <= 1) && (
                   <li className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                     <span className="text-blue-500 font-bold mt-0.5">•</span>
                     <span>Bổ sung sâu hơn về số liệu thực tế.</span>
                   </li>
                )}
              </ul>
            </div>
          </div>

          {/* Rubric Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
             <div className="px-6 py-4 border-b border-slate-100">
               <h3 className="font-bold text-slate-800 text-lg">Rubric chấm điểm</h3>
             </div>
             <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="pb-3 px-2 font-semibold">Tiêu chí</th>
                      <th className="pb-3 px-2 text-center font-semibold text-slate-500 whitespace-nowrap">Trọng số</th>
                      <th className="pb-3 px-2 text-center font-semibold text-slate-500 whitespace-nowrap">Điểm tối đa</th>
                      <th className="pb-3 px-2 text-center font-semibold text-blue-700 whitespace-nowrap">Điểm đạt được</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feedback?.rubric_scores?.map((item: any, idx: number) => {
                      let weight = item.weight !== undefined ? item.weight : Math.round((item.maxScore / (totalMaxScore || 10)) * 100);
                      if (weight <= 1 && weight > 0) weight = Math.round(weight * 100);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-4 px-2 text-slate-700 font-medium">{idx + 1}. {item.criteria}</td>
                          <td className="py-4 px-2 text-center text-slate-600">{weight}%</td>
                          <td className="py-4 px-2 text-center text-slate-600">10.0</td>
                          <td className="py-4 px-2 text-center font-medium text-slate-900">{item.score.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                    <tr>
                      <td className="py-4 px-2 font-bold text-slate-900 text-base">Tổng</td>
                      <td className="py-4 px-2 text-center font-bold text-slate-900">100%</td>
                      <td className="py-4 px-2 text-center font-bold text-slate-900">10.0</td>
                      <td className="py-4 px-2 text-center font-bold text-blue-700 text-base">{displayScore ? displayScore.toFixed(1) : '-'}</td>
                    </tr>
                  </tfoot>
                </table>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

