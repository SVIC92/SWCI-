package com.inventario.backend_inventario.Dto;

import lombok.Data;

@Data
public class ReporteQuiebreStockDto {
    private Long idInventario;
    private String skuProducto;
    private String nombreProducto;
    private String nombreSede;
    private Integer stockActual;
    private Integer stockMinimo;
    private Integer stockIdeal;
    private Integer cantidadSugerida; // stockIdeal - stockActual (null si no hay stockIdeal)
}
