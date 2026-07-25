import axiosInstance from "./axiosConfig";

export const getReporteQuiebreStock = () => axiosInstance.get("/reportes/quiebre-stock");

export const getReporteValorizado = () => axiosInstance.get("/reportes/valorizado");

export const getReporteMerma = (desde, hasta) =>
  axiosInstance.get("/reportes/merma", { params: { desde, hasta } });

export const getReporteDiferencias = () => axiosInstance.get("/reportes/diferencias");

export const getReporteStockMuerto = (dias) =>
  axiosInstance.get("/reportes/stock-muerto", { params: { dias } });

export const getReporteEntradas = (desde, hasta) =>
  axiosInstance.get("/reportes/entradas", { params: { desde, hasta } });

export const getReporteSalidas = (desde, hasta) =>
  axiosInstance.get("/reportes/salidas", { params: { desde, hasta } });
