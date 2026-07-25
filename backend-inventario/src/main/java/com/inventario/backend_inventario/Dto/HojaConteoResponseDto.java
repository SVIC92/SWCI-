package com.inventario.backend_inventario.Dto;

import com.inventario.backend_inventario.Enum.EstadoConteo;
import com.inventario.backend_inventario.Enum.TipoConteo;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class HojaConteoResponseDto {
    private Long id;
    private Integer sedeId;
    private String nombreSede;
    private TipoConteo tipoConteo;
    private EstadoConteo estado;
    private String alcanceDescripcion;
    private String nombreGenerador;
    private String nombreContador;
    private String nombreAprobador;
    private LocalDateTime fechaGeneracion;
    private LocalDateTime fechaConteo;
    private LocalDateTime fechaAprobacion;
    private String motivoRechazo;
    private List<DetalleConteoResponseDto> detalles;
}
