import axiosInstance from '../utils/axiosInstance';

export const getAll = (params) => axiosInstance.get('staff', { params });
export const create = (data) => axiosInstance.post('staff', data);
export const update = (id, data) => axiosInstance.put(`staff/${id}`, data);
export const remove = (id) => axiosInstance.delete(`staff/${id}`);

const staffService = { getAll, create, update, delete: remove };
export default staffService;
