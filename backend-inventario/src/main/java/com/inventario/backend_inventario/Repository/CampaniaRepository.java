package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Model.Campania;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CampaniaRepository extends JpaRepository<Campania, Integer> {
    @Query("SELECT c FROM Campania c WHERE c.fechaFin >= :fechaActual ORDER BY c.fechaInicio ASC")
    List<Campania> findProximasYActivas(LocalDate fechaActual);
    Optional<Campania> findByNombreCampaniaIgnoreCase(String nombreCampania);
}