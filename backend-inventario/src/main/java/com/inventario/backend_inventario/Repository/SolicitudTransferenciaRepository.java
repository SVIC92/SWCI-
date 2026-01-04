package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Model.SolicitudTransferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudTransferenciaRepository extends JpaRepository<SolicitudTransferencia, Long> {
    List<SolicitudTransferencia> findByEstado(SolicitudTransferencia.EstadoSolicitud estado);
    List<SolicitudTransferencia> findBySedeOrigenId(Long sedeId);
}