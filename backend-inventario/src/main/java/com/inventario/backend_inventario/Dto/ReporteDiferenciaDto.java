package com.inventario.backend_inventario.Dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReporteDiferenciaDto {
    private Long idHoja;
    private LocalDateTime fechaAprobacion;
    private String nombreSede;
    private String skuProducto;
    private String nombreProducto;
    private Integer stockSistema;
    private Integer stockContado;
    private Integer diferencia;
    private Double valorDiferencia;
}
