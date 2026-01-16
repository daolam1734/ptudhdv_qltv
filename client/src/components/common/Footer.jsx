import React from "react";
import { Link } from "react-router-dom";
import { Library, Users, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-gray-100 pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Library size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-neutral-dark">iLibrary</span>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Kiến tạo không gian số hiện đại cho tri thức và sáng tạo. Đồng hành cùng sự nghiệp giáo dục thế hệ tương lai.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2 inline-block">Liên kết nhanh</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors">Trang chủ hệ thống</Link></li>
              <li><Link to="/books" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors">Danh mục kho sách</Link></li>
              <li><Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors">Đăng nhập thành viên</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2 inline-block">Thông tin hỗ trợ</h4>
            <ul className="space-y-4">
              <li className="text-sm font-semibold text-gray-400 hover:text-primary cursor-pointer transition-colors">Hướng dẫn tra cứu</li>
              <li className="text-sm font-semibold text-gray-400 hover:text-primary cursor-pointer transition-colors">Chính sách mượn trả</li>
              <li className="text-sm font-semibold text-gray-400 hover:text-primary cursor-pointer transition-colors">Nội quy thư viện</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2 inline-block">Kết nối với chúng tôi</h4>
            <p className="text-sm font-bold text-primary mb-2">support@ilibrary.edu.vn</p>
            <p className="text-sm font-medium text-gray-400">Hotline: (024) 333 888 99</p>
          </div>
        </div>
        
        <div className="pt-10 border-t border-gray-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="text-xs text-gray-300 font-semibold uppercase">
              &copy; {new Date().getFullYear()} iLibrary &bull; Education Technology Team
           </div>
           <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary-light transition-all cursor-pointer shadow-sm">
                  <Users size={14} />
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary-light transition-all cursor-pointer shadow-sm">
                  <Globe size={14} />
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;