import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { FileUp, TrendingUp, Award, ChevronRight, Loader2 } from "lucide-react";
import { studentInfo } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function Dashboard({ onViewResult }: { onViewResult: (id?: string) => void }) {
  const [summary, setSummary] = useState({ totalSubmissions: 0, averageScore: "-", bestSkill: "-" });
  const [performance, setPerformance] = useState({ progress_data: [], skills_radar: [] });
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, perfRes, subsRes] = await Promise.all([
          fetch('/api/student/dashboard/summary?student_name=Minh Quân'),
          fetch('/api/student/dashboard/performance?student_name=Minh Quân'),
          fetch('/api/student/submissions/latest?student_name=Minh Quân')
        ]);
        
        const summaryData = await summaryRes.json();
        const perfData = await perfRes.json();
        const subsData = await subsRes.json();

        setSummary(summaryData);
        setPerformance({
          progress_data: perfData.progress_data || [],
          skills_radar: perfData.skills_radar || []
        });
        setRecentSubs(subsData || []);
      } catch (e) {
        console.error("Error fetching dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="pt-1.5">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Luyện tư duy lịch sử cùng AI chuyên sâu cho HSG THCS
            </h2>
            <p className="text-slate-500 mt-1.5">Phân tích bài làm, sửa lỗi lập luận và nâng cao kỹ năng trình bày.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Tổng bài đã nộp" 
            value={summary.totalSubmissions} 
            icon={FileUp} 
            color="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            title="Điểm trung bình" 
            value={summary.averageScore} 
            icon={TrendingUp} 
            color="bg-emerald-100 text-emerald-600" 
          />
          <StatCard 
            title="Kỹ năng tốt nhất" 
            value={summary.bestSkill} 
            icon={Award} 
            color="bg-amber-100 text-amber-600" 
          />
        </div>
      </div>

      {summary.totalSubmissions === 0 ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Chưa có dữ liệu bài tập</h3>
          <p className="text-indigo-600">Hãy bắt đầu nộp bài đầu tiên để AI phân tích kỹ năng của bạn!</p>
        </div>
      ) : (
        <>
          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 text-slate-800">Tiến độ điểm số</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performance.progress_data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 text-slate-800">Phân tích kỹ năng</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performance.skills_radar}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Kỹ năng" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Bài làm gần nhất</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {recentSubs.map((sub: any) => (
                <div key={sub.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-medium text-slate-900">{sub.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span>Ngày nộp: {sub.date}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", sub.statusColor)}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold tracking-tight text-slate-900">{sub.score}</div>
                      <div className="text-xs text-slate-500 font-medium uppercase">Điểm</div>
                    </div>
                    <button 
                      onClick={() => onViewResult(sub.id)}
                      className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      Xem nhận xét
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
