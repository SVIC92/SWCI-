import axios from "axios";
import axiosInstance from "./axiosConfig";

const API_URL ="https://swci-backend.onrender.com/api/auth" || "http://localhost:8080/api/auth";
//SIN TOKEN
export const login = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};
export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
};
export const mfaLoginVerify = async (payload) => {
  const response = await axios.post(`${API_URL}/mfa/login-verify`, payload);
  return response.data;
};
//CON TOKEN
export const setupMfa = async () => {
  const response = await axiosInstance.post(`${API_URL}/mfa/setup`);
  return response.data;
};
export const verifyMfa = async (payload) => {
  const response = await axiosInstance.post(`${API_URL}/mfa/verify`, payload);
  return response.data;
};
export const disableMfa = async () => {
  const response = await axiosInstance.post(`${API_URL}/mfa/disable`);
  return response.data;
};