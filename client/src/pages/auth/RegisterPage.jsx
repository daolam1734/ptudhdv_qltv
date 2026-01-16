import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { User, Lock, Phone, MapPin, Library, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        idCard: '',
        phoneNumber: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp.');
        }

        setLoading(true);
        try {
            const { confirmPassword, phoneNumber, ...rest } = formData;
            await authService.register({ 
                ...rest, 
                phone: phoneNumber 
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                setError(errorData.errors.map(e => Object.values(e)[0]).join(', '));
            } else {
                setError(errorData?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-md animate-in zoom-in duration-500">
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Đăng ký thành công!</h2>
                    <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed relative z-10">
                        Tài khoản của bạn đã được khởi tạo. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
                    </p>
                    <div className="flex flex-col items-center gap-4 relative z-10">
                        <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
                            <span>Đăng nhập ngay</span>
                            <ArrowRight size={14} />
                        </Link>
                        <Link to="/" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors">
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 group">
                    <Library size={28} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tạo tài khoản mới</h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">Gia nhập cộng đồng iLibrary ngay hôm nay</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-light/10/50 -mr-24 -mt-24 rounded-full blur-3xl"></div>
                
                <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10" onSubmit={handleSubmit}>
                    {error && (
                        <div className="md:col-span-2 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in slide-in-from-top duration-300">
                            <ShieldCheck size={18} className="text-rose-500" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-primary border-b border-primary-light/10 pb-1.5 uppercase">Thông tin tài khoản</h3>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Tên đăng nhập</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <User size={16} />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Mật khẩu</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Xác nhận mật khẩu</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-primary border-b border-primary-light/10 pb-1.5 uppercase">Thông tin cá nhân</h3>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Họ và tên</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <User size={16} />
                                </div>
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Số CCCD/CMND</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <ShieldCheck size={16} />
                                </div>
                                <input
                                    name="idCard"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="012345678901"
                                    value={formData.idCard}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Số điện thoại</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Phone size={16} />
                                </div>
                                <input
                                    name="phoneNumber"
                                    type="text"
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="0123 456 789"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Địa chỉ</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <MapPin size={16} />
                                </div>
                                <input
                                    name="address"
                                    type="text"
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm placeholder-gray-300"
                                    placeholder="Quận, Thành phố..."
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4 border-t border-gray-50">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : "Đăng ký thành viên mới"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 text-center space-y-3">
                <p className="text-gray-500 font-medium text-sm">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline ml-1">
                        Quay lại đăng nhập
                    </Link>
                </p>
                <div className="flex justify-center items-center gap-2">
                    <div className="h-px w-8 bg-gray-100"></div>
                    <Link to="/" className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors">
                        Về trang chủ
                    </Link>
                    <div className="h-px w-8 bg-gray-100"></div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

