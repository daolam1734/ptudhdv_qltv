import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Library, User, Lock, LogIn, ShieldCheck, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ username, password });
      if (user) {
        navigate(user.role === "reader" ? "/reader/dashboard" : "/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 group">
          <Library size={28} className="text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại</h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">Vui lòng đăng nhập để tiếp tục</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10/50 -mr-16 -mt-16 rounded-full blur-2xl"></div>
        
        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in slide-in-from-top duration-300">
              <ShieldCheck size={16} className="text-rose-500" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 ml-1">
              Tên đăng nhập
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold placeholder-gray-300"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold text-gray-500">
                Mật khẩu
              </label>
              <Link to="#" className="text-xs font-semibold text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold placeholder-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 py-3.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98] mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} /> Đăng nhập hệ thống
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center space-y-3">
        <p className="text-gray-500 font-medium text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline ml-1">
            Đăng ký ngay
          </Link>
        </p>
        <div className="flex justify-center items-center gap-2">
            <div className="h-px w-8 bg-gray-100"></div>
            <Link to="/" className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors">
                Hoặc về trang chủ
            </Link>
            <div className="h-px w-8 bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

