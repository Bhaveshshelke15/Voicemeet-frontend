import API from "./axiosConfig";

export const adminLogin = (data) => {
  return API.post("/auth/admin/login", data);
};

export const userLogin = (data) => {
  return API.post("/auth/user/login", data);
};