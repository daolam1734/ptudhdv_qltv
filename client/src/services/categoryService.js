import axiosInstance from "../utils/axiosInstance";

export const getAll = (params) => axiosInstance.get("categories", { params });
export const getById = (id) => axiosInstance.get(`categories/${id}`);
export const create = (data) => axiosInstance.post("categories", data);
export const update = (id, data) => axiosInstance.put(`categories/${id}`, data);
export const remove = (id) => axiosInstance.delete(`categories/${id}`);

const categoryService = { getAll, getById, create, update, remove };
export default categoryService;
