package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.SolicitudDevolucionRequestDto;
import com.inventario.backend_inventario.Model.SolicitudDevolucion;

import java.util.List;

public interface SolicitudDevolucionService {
    SolicitudDevolucion crearSolicitud(SolicitudDevolucionRequestDto dto, Integer usuarioId);
    List<SolicitudDevolucion> listarPendientes();
    List<SolicitudDevolucion> listarHistorial();
    void aprobarSolicitud(Long id);
    void rechazarSolicitud(Long id, String motivo);
}
