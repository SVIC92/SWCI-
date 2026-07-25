package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Enum.EstadoSolicitud;
import com.inventario.backend_inventario.Model.SolicitudMerma;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudMermaRepository extends JpaRepository<SolicitudMerma, Long> {
    List<SolicitudMerma> findByEstado(EstadoSolicitud estado);
    List<SolicitudMerma> findByEstadoNotOrderByFechaSolicitudDesc(EstadoSolicitud estado);
}
