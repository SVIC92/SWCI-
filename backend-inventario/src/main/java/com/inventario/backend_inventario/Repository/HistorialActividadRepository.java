package com.inventario.backend_inventario.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inventario.backend_inventario.Model.HistorialActividad;
import com.inventario.backend_inventario.Dto.UltimoAccesoUser;

@Repository
public interface HistorialActividadRepository extends JpaRepository<HistorialActividad, Long> {
    List<HistorialActividad> findTop10ByOrderByFechaHoraDesc();

    @Query("SELECT h FROM HistorialActividad h WHERE " +
           "(:usuarioId IS NULL OR h.usuario.id_u = :usuarioId) AND " +
           "(:modulo IS NULL OR h.modulo = :modulo) AND " +
           "(h.fechaHora >= COALESCE(:fechaInicio, h.fechaHora)) AND " +
           "(h.fechaHora <= COALESCE(:fechaFin, h.fechaHora)) " +
           "ORDER BY h.fechaHora DESC")
    List<HistorialActividad> filtrarActividades(
            @Param("usuarioId") Integer usuarioId,
            @Param("modulo") String modulo,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );
    @Query("SELECT " +
           "CONCAT(h.usuario.nombre_u, ' ', h.usuario.apellido_pat) AS nombreCompleto, " +
           "h.usuario.rol.nombreRol AS rol, " +
           "MAX(h.fechaHora) AS ultimaFecha " +
           "FROM HistorialActividad h " +
           "WHERE h.tipoAccion = 'LOGIN' " +
           "GROUP BY h.usuario.nombre_u, h.usuario.apellido_pat, h.usuario.rol.nombreRol " +
           "ORDER BY ultimaFecha DESC")
    List<UltimoAccesoUser> findUltimosAccesos();
}
