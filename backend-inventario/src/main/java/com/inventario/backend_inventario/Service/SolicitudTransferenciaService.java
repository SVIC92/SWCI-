package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.SolicitudRequestDto;
import com.inventario.backend_inventario.Model.SolicitudTransferencia;
import java.util.List;

public interface SolicitudTransferenciaService {
    
    SolicitudTransferencia crearSolicitud(SolicitudRequestDto dto, Integer usuarioId);
    
    List<SolicitudTransferencia> listarPendientes();
    
    void aprobarSolicitud(Long solicitudId);
    
    void rechazarTransferencia(Long solicitudId, String motivo);
    
    List<SolicitudTransferencia> listarHistorial();
}