import axiosInstance from '../utils/axiosInstance';

export const login = (credentials) => axiosInstance.post('auth/login', credentials);
export const register = (data) => axiosInstance.post('auth/register', data);
export const getMe = () => axiosInstance.get('auth/me');
export const updateProfile = (data) => axiosInstance.patch('auth/profile', data);
export const changePassword = (data) => axiosInstance.post('auth/change-password', data);

const authService = { login, register, getMe, updateProfile, changePassword };
export default authService;
