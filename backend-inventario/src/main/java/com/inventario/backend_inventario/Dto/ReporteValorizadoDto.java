package com.inventario.backend_inventario.Dto;

import lombok.Data;

@Data
public class ReporteValorizadoDto {
    private String skuProducto;
    private String nombreProducto;
    private String nombreSede;
    private String nombreCategoria;
    private String nombreProveedor;
    private Integer stockActual;
    private Double costoUnitario;
    private Double valorTotal;
}
