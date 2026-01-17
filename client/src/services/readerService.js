import axiosInstance from '../utils/axiosInstance';

export const getAll = (params) => axiosInstance.get('readers', { params });
export const getById = (id) => axiosInstance.get(`readers/${id}`);
export const create = (data) => axiosInstance.post('readers', data);
export const update = (id, data) => axiosInstance.put(`readers/${id}`, data);
export const remove = (id) => axiosInstance.delete(`readers/${id}`);
export const getHistory = (id) => axiosInstance.get(`readers/${id}/borrow-history`);
export const getMyHistory = () => axiosInstance.get('readers/me/history');
export const payViolation = (id, amount) => axiosInstance.post(`readers/${id}/pay-violation`, { amount });
export const search = (q) => axiosInstance.get('readers/search', { params: { q } });
export const toggleFavorite = (bookId) => axiosInstance.post(`readers/me/favorites/${bookId}`);
export const getFavorites = () => axiosInstance.get('readers/me/favorites');

export const getBasket = () => axiosInstance.get('readers/me/basket');
export const updateBasket = (basketData) => axiosInstance.post('readers/me/basket', basketData);
export const clearBasket = () => axiosInstance.delete('readers/me/basket');

const readerService = { 
  getAll, 
  getById, 
  create, 
  update, 
  delete: remove, 
  getHistory, 
  getMyHistory, 
  payViolation, 
  search, 
  toggleFavorite, 
  getFavorites,
  getBasket,
  updateBasket,
  clearBasket
};
export default readerService;
