import axiosInstance from '../utils/axiosInstance';

export const getLibraryStats = () => axiosInstance.get('reports');
export const getBorrowedStats = () => axiosInstance.get('reports/borrowed-books');
export const getTopReaders = (params) => axiosInstance.get('reports/top-readers', { params });
export const getRecentActivities = (params) => axiosInstance.get('reports/activities', { params });

const reportService = { getLibraryStats, getBorrowedStats, getTopReaders, getRecentActivities };
export default reportService;
