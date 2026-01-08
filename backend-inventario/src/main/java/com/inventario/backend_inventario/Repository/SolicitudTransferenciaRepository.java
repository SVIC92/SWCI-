package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Enum.EstadoSolicitud;
import com.inventario.backend_inventario.Model.SolicitudTransferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudTransferenciaRepository extends JpaRepository<SolicitudTransferencia, Long> {
    List<SolicitudTransferencia> findByEstado(EstadoSolicitud estado);
    List<SolicitudTransferencia> findBySedeOrigenIdSede(Integer idSede);
    List<SolicitudTransferencia> findByEstadoNotOrderByFechaSolicitudDesc(EstadoSolicitud estado);
}