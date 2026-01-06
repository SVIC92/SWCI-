package com.inventario.backend_inventario.Dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MovimientoInventarioDto {


    private Long idMovimiento;
    private String nombreProducto;
    private String skuProducto;
    private String nombreSede;
    private String nombreCompletoUsuario;
    private String nombreRolUsuario;
    private String tipoMovimiento;
    private LocalDateTime fecha;
    private Integer cantidad;
    private String observaciones;
    //private Integer stockAnterior;
    //private Integer stockNuevo;
}
