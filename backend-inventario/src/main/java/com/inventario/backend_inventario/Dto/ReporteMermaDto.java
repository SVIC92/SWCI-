package com.inventario.backend_inventario.Dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReporteMermaDto {
    private Long idMovimiento;
    private LocalDateTime fecha;
    private String skuProducto;
    private String nombreProducto;
    private String nombreSede;
    private String nombreUsuario;
    private Integer cantidad;
    private Double costoUnitario;
    private Double costoTotal;
    private String observaciones;
}
