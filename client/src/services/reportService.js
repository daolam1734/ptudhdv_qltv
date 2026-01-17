import axiosInstance from '../utils/axiosInstance';

export const getLibraryStats = () => axiosInstance.get('reports');
export const getBorrowedStats = () => axiosInstance.get('reports/borrowed-books');
export const getInventoryByCategory = () => axiosInstance.get('reports/inventory-category');
export const getTopReaders = (params) => axiosInstance.get('reports/top-readers', { params });
export const getTopBooks = (params) => axiosInstance.get('reports/top-books', { params });
export const getRecentActivities = (params) => axiosInstance.get('reports/activities', { params });
export const getTrends = (days) => axiosInstance.get('reports/trends', { params: { days } });
export const exportReport = (type) => axiosInstance.get('reports/export', { params: { type } });

const reportService = { getLibraryStats, getBorrowedStats, getInventoryByCategory, getTopReaders, getTopBooks, getRecentActivities, getTrends, exportReport };
export default reportService;
