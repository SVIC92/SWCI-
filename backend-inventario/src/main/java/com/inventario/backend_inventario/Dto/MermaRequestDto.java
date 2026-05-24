package com.inventario.backend_inventario.Dto;

import lombok.Data;
import java.util.List;

@Data
public class MermaRequestDto {
    private Integer usuarioId;
    private Integer sedeId;
    private List<DetalleMermaRequestDto> detalles;
}