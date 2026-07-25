package com.inventario.backend_inventario.Dto;

import lombok.Data;

@Data
public class DetalleConteoResponseDto {
    private Long id;
    private Long productoId;
    private String skuProducto;
    private String nombreProducto;
    private Integer stockSistema;
    private Integer stockContado;
}
