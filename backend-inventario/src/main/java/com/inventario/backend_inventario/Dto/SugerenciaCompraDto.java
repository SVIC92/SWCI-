package com.inventario.backend_inventario.Dto;

public interface SugerenciaCompraDto {
    Long getIdProducto();
    String getNombre();
    String getProveedor();
    Integer getStockActual();
    Integer getStockMinimo();
    Integer getStockIdeal();
    Integer getCantidadSugerida();
}
