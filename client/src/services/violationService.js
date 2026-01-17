import axiosInstance from "../utils/axiosInstance";

export const getAll = (params) => axiosInstance.get("violations", { params });
export const getByReader = (readerId) => axiosInstance.get(`violations/reader/${readerId}`);
export const getMyViolations = () => axiosInstance.get("violations/my-violations");
export const pay = (violationId) => axiosInstance.post(`violations/${violationId}/pay`);
export const payAll = (readerId) => axiosInstance.post(`violations/reader/${readerId}/pay-all`);
export const create = (data) => axiosInstance.post("violations", data);

const violationService = { getAll, getByReader, getMyViolations, pay, payAll, create };
export default violationService;
