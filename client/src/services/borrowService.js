import axiosInstance from "../utils/axiosInstance";

export const create = (data) => axiosInstance.post("borrow", data);
export const approve = (id) => axiosInstance.post(`borrow/${id}/approve`);
export const issue = (id) => axiosInstance.post(`borrow/${id}/issue`);
export const reject = (id, data) => axiosInstance.post(`borrow/${id}/reject`, data);
export const returnBook = (id, data) => axiosInstance.post(`borrow/${id}/return`, data);
export const renewBorrow = (id) => axiosInstance.post(`borrow/${id}/renew`);
export const getAll = (params) => axiosInstance.get("borrow", { params });
export const getById = (id) => axiosInstance.get(`borrow/${id}`);
export const getMyHistory = () => axiosInstance.get("borrow/my-history");
export const getReaderHistory = (readerId) => axiosInstance.get(`borrow/reader/${readerId}`);

const borrowService = { create, approve, issue, reject, returnBook, renewBorrow, getAll, getById, getMyHistory, getReaderHistory };
export default borrowService;
