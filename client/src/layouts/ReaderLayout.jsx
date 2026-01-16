import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Library } from "lucide-react";

const ReaderLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />

      {/* Hero Header for Reader Pages */}
      <div className="bg-primary text-white py-20 px-4 relative overflow-hidden shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-dark/20 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10 transition-all duration-700">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl font-black mb-4 tracking-tighter italic">
              {location.pathname === "/reader/dashboard" || location.pathname === "/" ? `Xin chào, ${user?.fullName ? user.fullName.split(' ').pop() : 'bạn'}!` : 
               location.pathname === "/reader/books" || location.pathname === "/books" ? "Kho Sách Tri Thức" : 
               location.pathname === "/reader/favorites" ? "Sách Yêu Thích" :
               "Nhật Ký Đọc Sách"}
            </h1>
            <p className="text-white/80 max-w-2xl text-lg font-bold leading-relaxed tracking-tight">
              Khám phá hàng ngàn đầu sách hấp dẫn, mở rộng chân trời tri thức và kiến tạo tương lai cùng hệ thống iLibrary hiện đại.
            </p>
          </div>
          <div className="flex gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
             <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-4 group hover:bg-white/15 transition-all">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <Library size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Cán bộ phụ trách</p>
                  <p className="text-sm font-black tracking-tight">Hỗ trợ trực tiếp tại quầy 01A</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 min-h-[600px] animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReaderLayout;

