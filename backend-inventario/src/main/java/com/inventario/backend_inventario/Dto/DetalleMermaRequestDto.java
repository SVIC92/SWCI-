package com.inventario.backend_inventario.Dto;

import lombok.Data;

@Data
public class DetalleMermaRequestDto {
    private Long productoId;
    private Double cantidad;
    private String tipoMerma; // Recibe "MERMA_VENCIDA", "MERMA_ROTURA", "MERMA_CALIDAD"
}