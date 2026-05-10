import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, TrendingUp, AlertCircle, FileStack, ShieldAlert, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Removed static mock imports

export function TeacherDashboard() {
  const [summary, setSummary] = useState({ 
    totalSubmissions: 0, 
    classAverage: 0, 
    pendingApprovals: 0, 
    recentPending: [] 
  });
  const [analytics, setAnalytics] = useState({ 
    trendData: [], 
    skillsHeatmap: [], 
    insightText: "Đang tải dữ liệu..." 
  });
  const [topErrors, setTopErrors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, analyticsRes, errorsRes] = await Promise.all([
          fetch('/api/dashboard/summary'),
          fetch('/api/dashboard/analytics'),
          fetch('/api/dashboard/top-errors')
        ]);
        
        const sumData = await sumRes.json();
        const anData = await analyticsRes.json();
        const errData = await errorsRes.json();

        setSummary(sumData);
        setAnalytics(anData);
        setTopErrors(errData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000); // Poll every 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  const hasSubmissions = summary.totalSubmissions > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Tổng quan lớp học
          </h2>
          <p className="text-slate-500 mt-1">Theo dõi tiến độ, phê duyệt bài làm và tối ưu AI Rubric.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Tổng số bài đã nộp" 
            value={hasSubmissions ? summary.totalSubmissions : "-"} 
            icon={FileStack} 
            color="bg-slate-100 text-slate-700" 
          />
          <StatCard 
            title="Điểm trung bình (Lớp)" 
            value={hasSubmissions ? summary.classAverage : "-"} 
            icon={TrendingUp} 
            color="bg-indigo-100 text-indigo-600" 
          />
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12"></div>
            <div className="p-3 rounded-xl bg-red-100 text-red-600 relative z-10">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500">Bài cần phê duyệt</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900 mt-1">{hasSubmissions ? summary.pendingApprovals : "-"}</p>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Cần xử lý</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts & Heatmap Area (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-6 text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Biểu đồ xu hướng điểm số
            </h3>
            <div className="h-72">
              {!hasSubmissions ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Chưa có dữ liệu để phân tích
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Line type="stepAfter" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                 <Users className="w-5 h-5 text-indigo-500" />
                 Heatmap Kỹ năng học sinh (%)
               </h3>
               <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Yếu</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded-sm"></div> Khá</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-400 rounded-sm"></div> Tốt</div>
               </div>
             </div>
             <div className="h-64">
               {!hasSubmissions ? (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                   Chưa có dữ liệu để phân tích
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.skillsHeatmap} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 500}} width={90} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="weak" stackId="a" fill="#f87171" radius={[0, 0, 0, 0]} name="Yếu (%)" />
                      <Bar dataKey="average" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} name="Khá (%)" />
                      <Bar dataKey="good" stackId="a" fill="#34d399" radius={[0, 4, 4, 0]} name="Tốt (%)" />
                    </BarChart>
                 </ResponsiveContainer>
               )}
             </div>
             <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600">
                <span className="font-semibold text-indigo-600">Chú ý: </span> {hasSubmissions ? analytics.insightText : "Chưa có thông tin"}
             </div>
          </div>

        </div>

        {/* Right Column: Approval Queue & Top Errors */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden flex flex-col">
            <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Approval Queue
              </h3>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">{summary.recentPending.length}</span>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {!hasSubmissions || summary.recentPending.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Không có bài nào đang chờ duyệt
                </div>
              ) : (
                summary.recentPending.map((item: any) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                       <div className="font-medium text-slate-900">{item.student_name}</div>
                       <div className="text-indigo-600 font-bold">{item.ai_score}<span className="text-xs text-slate-400 font-normal">/10</span></div>
                    </div>
                    <div className="text-xs text-slate-500 truncate mb-2" title={item.topic}>{item.topic}</div>
                    <div className="bg-amber-50 text-amber-700 px-2 py-1.5 rounded text-[11px] font-medium mb-3 border border-amber-100">
                      Lý do: {item.flag_reason}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium tooltip">
                         <span className={cn("w-2 h-2 rounded-full", item.confidence < 60 ? "bg-red-500" : item.confidence < 80 ? "bg-amber-500" : "bg-emerald-500")}></span>
                         AI Confidence: {item.confidence}%
                      </div>
                      <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Xem bài ➔</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                 <AlertCircle className="w-4 h-4 text-amber-500" />
                 Top lỗi thường gặp
               </h3>
             </div>
             <div className="divide-y divide-slate-50">
                {!hasSubmissions || topErrors.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Chưa có nhật ký lỗi
                  </div>
                ) : (
                  topErrors.map((err: any, idx: number) => (
                    <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</div>
                         <div className="text-sm font-medium text-slate-700">{err.label}</div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-slate-900">{err.count}</span>
                         <div className={cn(
                           "w-6 h-6 rounded-full flex items-center justify-center",
                           err.trend === 'up' ? "bg-red-50 text-red-600" : 
                           err.trend === 'down' ? "bg-emerald-50 text-emerald-600" : 
                           "bg-slate-100 text-slate-500"
                         )} title={err.trend_value}>
                           {err.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                           {err.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                           {err.trend === 'same' && <Minus className="w-3 h-3" />}
                         </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
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
