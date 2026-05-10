import { useState } from 'react';
import { LogIn, User, Settings, LogOut, X } from 'lucide-react';
import { studentInfo } from '@/data/mockData';
import { motion, AnimatePresence } from 'motion/react';

export function HeaderAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDropdown(false);
  };

  return (
    <>
      <div className="relative">
        {!isLoggedIn ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
            >
              Đăng ký
            </button>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </button>
          </div>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm border border-slate-200"
            >
              <img 
                src={studentInfo.avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-indigo-50"
              />
              <span className="font-semibold text-slate-700 text-sm">Nguyễn Anh Thư</span>
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
                    className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
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
                      onClick={handleLogout}
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

      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 pb-8">
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-center mb-8 mt-2">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Đăng nhập hệ thống</h2>
                  <p className="text-sm text-slate-500 mt-2">Truy cập để lưu kết quả và nhận phản hồi từ AI</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">Email</label>
                    <input type="email" placeholder="Nhập email của bạn" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">Mật khẩu</label>
                    <input type="password" placeholder="Nhập mật khẩu" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={handleLogin}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200/50"
                    >
                      Đăng nhập ngay
                    </button>
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
