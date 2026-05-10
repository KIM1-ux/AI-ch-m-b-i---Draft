import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  FileText,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Submission = {
  id: string;
  topic_title: string;
  submission_date: number;
  status: 'pending' | 'approved' | 'appealing';
  final_score: number | null;
};

export function StudentHistory({ onViewResult, onSubmitNew }: { onViewResult: (id: string) => void; onSubmitNew: () => void }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/student/submissions?student_name=Minh Quân");
        const data = await res.json();
        setSubmissions(data || []);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // Filtering Logic
  const filteredData = submissions.filter((sub) => {
    const matchesSearch = sub.topic_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "graded" && sub.status === "approved") ||
                          (statusFilter === "pending" && sub.status !== "approved");
    return matchesSearch && matchesStatus;
  });

  // Sorting Logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "newest") return b.submission_date - a.submission_date;
    if (sortBy === "oldest") return a.submission_date - b.submission_date;
    if (sortBy === "highest") return (b.final_score || 0) - (a.final_score || 0);
    if (sortBy === "lowest") return (a.final_score || 0) - (b.final_score || 0);
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100">Đã chấm</span>;
      case 'appealing':
        return <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100">Đang phúc khảo</span>;
      default:
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium border border-amber-100">Chờ duyệt</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-l-4 border-indigo-600 pl-4 py-1">
            Lịch sử bài làm
          </h1>
          <p className="text-slate-500 mt-2 pl-5">Xem lại toàn bộ kết quả và nhận xét chi tiết</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-indigo-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa có bài nộp nào</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Bạn chưa có bài làm nào trong hệ thống. Hãy thử nộp bài đầu tiên ngay để AI phân tích kỹ năng của bạn!
          </p>
          <button 
            onClick={onSubmitNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
          >
            Nộp bài ngay
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm bài làm theo tên đề bài..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-slate-300 transition-colors transition-shadow"
                >
                  <option value="all">Tất cả bài</option>
                  <option value="graded">Đã chấm</option>
                  <option value="pending">Chờ duyệt</option>
                </select>
              </div>

              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-slate-300 transition-colors transition-shadow"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Điểm cao nhất</option>
                  <option value="lowest">Điểm thấp nhất</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
             {paginatedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                  <Search className="w-12 h-12 mb-4 text-slate-300" />
                  <p>Không tìm thấy bài làm nào phù hợp.</p>
                </div>
             ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Ngày nộp</th>
                      <th className="px-6 py-4">Đề bài</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Điểm số</th>
                      <th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                          {new Date(item.submission_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800 line-clamp-1">{item.topic_title}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.final_score !== null ? (
                            <span className="text-lg font-bold text-slate-900">{item.final_score.toFixed(1)}<span className="text-xs text-slate-400 ml-1">/10</span></span>
                          ) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => onViewResult(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
              <span className="text-sm text-slate-500">
                Hiển thị <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> trong <span className="font-medium">{filteredData.length}</span> bài
              </span>
              
               <div className="flex gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-7 h-7 rounded-md text-sm font-medium transition-colors",
                        currentPage === i + 1 ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
