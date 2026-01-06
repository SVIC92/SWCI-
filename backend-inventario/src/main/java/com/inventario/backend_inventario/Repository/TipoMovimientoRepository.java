
package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Model.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoMovimientoRepository extends JpaRepository<TipoMovimiento, Long> {

    // El Service usará este método para buscar "Recepción", "Merma", etc.
    Optional<TipoMovimiento> findByTipo(String tipo);
}