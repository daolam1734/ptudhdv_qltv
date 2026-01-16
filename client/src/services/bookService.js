import axiosInstance from '../utils/axiosInstance';

export const getAll = (params) => axiosInstance.get('books', { params });
export const getById = (id) => axiosInstance.get(`books/${id}`);
export const create = (data) => axiosInstance.post('books', data);
export const update = (id, data) => axiosInstance.put(`books/${id}`, data);
export const remove = (id) => axiosInstance.delete(`books/${id}`);
export const search = (q) => axiosInstance.get('books/search', { params: { q } });
export const getCategories = () => axiosInstance.get('books/categories');

const bookService = { getAll, getById, create, update, delete: remove, search, getCategories };
export default bookService;
