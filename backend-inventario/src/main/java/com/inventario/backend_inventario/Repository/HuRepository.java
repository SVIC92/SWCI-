package com.inventario.backend_inventario.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inventario.backend_inventario.Enum.EstadoHu;
import com.inventario.backend_inventario.Model.Hu;
import com.inventario.backend_inventario.Model.Sede;

@Repository
public interface HuRepository extends JpaRepository<Hu, Long> {
    @Query("SELECT h.codHu FROM Hu h WHERE h.codHu LIKE :pattern ORDER BY h.id DESC LIMIT 1")
    Optional<String> findUltimoCodigo(@Param("pattern") String pattern);
    Optional<Hu> findByCodHu(String codHu);
    List<Hu> findByEstadoIn(List<EstadoHu> estados);
    List<Hu> findByAlmacenAndEstadoIn(Sede almacen, List<EstadoHu> estados);
    List<Hu> findBySedeDestino(Sede sedeDestino);
    List<Hu> findBySedeDestinoAndEstado(Sede sedeDestino, EstadoHu estado);
}