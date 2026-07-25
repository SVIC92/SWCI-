package com.inventario.backend_inventario.Dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReporteStockMuertoDto {
    private String skuProducto;
    private String nombreProducto;
    private String nombreSede;
    private Integer stockActual;
    private Double valorInmovilizado;
    private LocalDateTime fechaUltimoMovimiento; // null si nunca tuvo movimientos
    private Long diasSinMovimiento; // null si nunca tuvo movimientos
}
