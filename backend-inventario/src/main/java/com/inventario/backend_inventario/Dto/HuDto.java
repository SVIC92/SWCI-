package com.inventario.backend_inventario.Dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HuDto {
    private Long id;
    private String codHu;
    private Integer idAlmacen; 
    private Integer idSedeDestino;
    private String tipoIndicador;
    private String estado;
    private LocalDateTime fechaSolicitada; 
    private LocalDate fechaVencimiento;
    private List<DetalleHuItemDto> detalles; 
}