package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Enum.EstadoSolicitud;
import com.inventario.backend_inventario.Model.SolicitudDevolucion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudDevolucionRepository extends JpaRepository<SolicitudDevolucion, Long> {
    List<SolicitudDevolucion> findByEstadoOrderByFechaSolicitudDesc(EstadoSolicitud estado);
    List<SolicitudDevolucion> findByEstadoNotOrderByFechaSolicitudDesc(EstadoSolicitud estado);
}
