import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
import authService from '../../services/authService';

const Login = ({ onLogin }) => {
    const [isStaff, setIsStaff] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({ username, password });
            const { accessToken } = response.data;
            localStorage.setItem("token", accessToken);
            const profileRes = await authService.getMe();
            const user = profileRes.data;
            localStorage.setItem('user', JSON.stringify(user));
            onLogin(user);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm animate-in fade-in zoom-in duration-700">
            <div className="bg-neutral-white rounded-[2rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden italic">
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-6 mx-auto">
                        <BookOpen size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-neutral-dark tracking-tighter uppercase mb-8">Thư Viện Số</h2>

                    <div className="flex p-1 bg-gray-50 rounded-xl mb-8 border border-gray-100">
                        <button
                            onClick={() => setIsStaff(false)}
                            className={`flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                                !isStaff ? 'bg-neutral-white text-primary shadow-sm border border-gray-100' : 'text-gray-400'
                            }`}
                        >
                            Độc giả
                        </button>
                        <button
                            onClick={() => setIsStaff(true)}
                            className={`flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                                isStaff ? 'bg-neutral-white text-primary shadow-sm border border-gray-100' : 'text-gray-400'
                            }`}
                        >
                            Thủ thư
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tài khoản</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-11 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold text-neutral-dark focus:bg-neutral-white focus:border-primary focus:outline-none transition-all"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold text-neutral-dark focus:bg-neutral-white focus:border-primary focus:outline-none transition-all"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold uppercase text-center">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-accent text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-95"
                        >
                            {loading ? '...' : (
                                <>Đăng nhập <ArrowRight size={14} /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

