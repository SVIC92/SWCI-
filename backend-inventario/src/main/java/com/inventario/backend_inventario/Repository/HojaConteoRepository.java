package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Enum.EstadoConteo;
import com.inventario.backend_inventario.Model.HojaConteo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HojaConteoRepository extends JpaRepository<HojaConteo, Long> {
    List<HojaConteo> findByEstado(EstadoConteo estado);
    List<HojaConteo> findByEstadoInOrderByFechaGeneracionDesc(List<EstadoConteo> estados);
    List<HojaConteo> findAllByOrderByFechaGeneracionDesc();
}
