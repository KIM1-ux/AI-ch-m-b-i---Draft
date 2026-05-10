import { useState } from 'react';
import { LogIn, User, Settings, LogOut, X, GraduationCap, PenTool, CheckCircle2, Presentation } from 'lucide-react';
import { studentInfo } from '@/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, Role } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { handleLogin as fbLogin, handleRegister as fbRegister } from '@/authService';

export function TopBar({ onSubmitClick }: { onSubmitClick?: () => void }) {
  const { isLoggedIn, role, login, logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<false | 'login' | 'register'>(false);
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  const [name, setAuthName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      if (showAuthModal === 'login') {
        await fbLogin(email, password);
        setShowAuthModal(false);
      } else {
        if (!name.trim()) throw new Error("Vui lòng nhập họ và tên.");
        if (password.length < 6) throw new Error("Mật khẩu phải từ 6 ký tự trở lên.");
        await fbRegister(email, password, selectedRole, name.trim());
        setShowAuthModal(false);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email này đã được sử dụng");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email hoặc mật khẩu không chính xác");
      } else {
        setError(err.message || "Đã có lỗi xảy ra");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user?.name || (role === 'student' ? 'Nguyễn Anh Thư' : 'Cô Nguyễn Hà');
  const avatar = role === 'student' ? studentInfo.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=TeacherHa&backgroundColor=e2e8f0';

  let viewError = error;
  if (!viewError && showAuthModal === 'register' && selectedRole === 'teacher') {
    viewError = 'Lưu ý: Bạn đang đăng ký với tư cách Giáo viên (Quyền quản trị).';
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-3 w-full flex items-center justify-between">
        
        {/* Left Side: Contextual Actions */}
        <div className="flex items-center gap-4">
          {isLoggedIn && role === 'student' && (
             <button 
                onClick={onSubmitClick}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
             >
                <PenTool className="w-4 h-4" />
                Nộp bài nhanh
             </button>
          )}

          {isLoggedIn && role === 'teacher' && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                AI đang hoạt động
             </div>
          )}
          {!isLoggedIn && <div className="text-sm font-medium text-slate-500">Vui lòng đăng nhập để lưu kết quả</div>}
        </div>

        {/* Right Side: Auth State */}
        <div className="relative">
          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAuthModal('register')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors text-sm"
              >
                Đăng ký
              </button>
              <button 
                onClick={() => setShowAuthModal('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 text-sm"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-slate-100 transition-colors focus:outline-none ring-1 ring-slate-200 bg-white shadow-sm"
              >
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-indigo-50"
                />
                <span className="font-semibold text-slate-700 text-sm">{name}</span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
                    >
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <User className="w-4 h-4 text-slate-400" />
                        Thông tin cá nhân
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Settings className="w-4 h-4 text-slate-400" />
                        Cài đặt tài khoản
                      </button>
                      <div className="h-px bg-slate-100 my-1" />
                      <button 
                        onClick={() => { logout(); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Đăng xuất
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 pb-8 overflow-y-auto">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-center mb-6 mt-2">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    {showAuthModal === 'login' ? <LogIn className="w-7 h-7 text-indigo-600" /> : <User className="w-7 h-7 text-indigo-600" />}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {showAuthModal === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    {showAuthModal === 'login' ? 'Truy cập để quản lý dữ liệu của bạn' : 'Chọn vai trò của bạn để tiếp tục'}
                  </p>
                </div>
                
                <div className="space-y-5">
                  {showAuthModal === 'register' && (
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">Bạn là:</label>
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => setSelectedRole('student')}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                              selectedRole === 'student' ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"
                            )}>
                              <div className={cn("p-2 rounded-full mb-2", selectedRole === 'student' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500")}>
                                <GraduationCap className="w-6 h-6" />
                              </div>
                              <span className={cn("font-semibold text-sm", selectedRole === 'student' ? "text-indigo-900" : "text-slate-600")}>Học sinh</span>
                          </button>
                          
                          <button 
                            onClick={() => setSelectedRole('teacher')}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                              selectedRole === 'teacher' ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"
                            )}>
                              <div className={cn("p-2 rounded-full mb-2", selectedRole === 'teacher' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500")}>
                                <Presentation className="w-6 h-6" />
                              </div>
                              <span className={cn("font-semibold text-sm", selectedRole === 'teacher' ? "text-indigo-900" : "text-slate-600")}>Giáo viên</span>
                          </button>
                       </div>
                    </div>
                  )}

                  {viewError && (
                    <div className={cn("p-3 rounded-lg text-sm", viewError.includes('Lưu ý') ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-50 text-red-600 border border-red-100")}>
                      {viewError}
                    </div>
                  )}

                  {showAuthModal === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">Họ và tên</label>
                      <input type="text" value={name} onChange={e => setAuthName(e.target.value)} placeholder="Nhập họ và tên" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
                    </div>
                  )}
                  
                  {showAuthModal === 'login' && (
                    <div>
                       <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
                          <button 
                            onClick={() => setSelectedRole('student')}
                            className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", selectedRole === 'student' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700")}
                          >
                            Học sinh
                          </button>
                          <button 
                            onClick={() => setSelectedRole('teacher')}
                            className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", selectedRole === 'teacher' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700")}
                          >
                            Giáo viên
                          </button>
                       </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email của bạn" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">Mật khẩu</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200/50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>}
                      {showAuthModal === 'login' ? 'Đăng nhập' : 'Hoàn tất Đăng ký'}
                    </button>
                  </div>

                  <div className="text-center text-sm text-slate-500 mt-4">
                     {showAuthModal === 'login' ? (
                       <p>Chưa có tài khoản? <button onClick={() => setShowAuthModal('register')} className="text-indigo-600 font-semibold hover:underline">Đăng ký ngay</button></p>
                     ) : (
                       <p>Đã có tài khoản? <button onClick={() => setShowAuthModal('login')} className="text-indigo-600 font-semibold hover:underline">Đăng nhập</button></p>
                     )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
