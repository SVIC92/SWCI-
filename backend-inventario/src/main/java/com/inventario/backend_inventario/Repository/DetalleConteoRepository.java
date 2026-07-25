package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Enum.EstadoConteo;
import com.inventario.backend_inventario.Model.DetalleConteo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleConteoRepository extends JpaRepository<DetalleConteo, Long> {

    @Query("SELECT d FROM DetalleConteo d " +
            "JOIN FETCH d.producto " +
            "JOIN FETCH d.hoja h " +
            "JOIN FETCH h.sede " +
            "WHERE h.estado = :estado " +
            "AND d.stockContado IS NOT NULL AND d.stockContado <> d.stockSistema " +
            "ORDER BY h.fechaAprobacion DESC")
    List<DetalleConteo> findDiferencias(@Param("estado") EstadoConteo estado);
}
