package com.inventario.backend_inventario.Dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialActividadDto {
    private Long id;
    private String tipoAccion;
    private String descripcion;
    private LocalDateTime fechaHora;
    private String nombreUsuario;
    private String rolUsuario;

    private String modulo; 
    private String entidadAfectada;
    private Long idEntidad;
    private String ipDireccion;
    private String detallesCambios;
}