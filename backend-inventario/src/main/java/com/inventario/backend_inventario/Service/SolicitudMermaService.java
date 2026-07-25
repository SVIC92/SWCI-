package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.SolicitudMermaRequestDto;
import com.inventario.backend_inventario.Model.SolicitudMerma;
import java.util.List;

public interface SolicitudMermaService {

    SolicitudMerma crearSolicitud(SolicitudMermaRequestDto dto, Integer usuarioId);

    List<SolicitudMerma> listarPendientes();

    void aprobarSolicitud(Long solicitudId);

    void rechazarSolicitud(Long solicitudId, String motivo);

    List<SolicitudMerma> listarHistorial();
}
