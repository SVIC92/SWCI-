package com.inventario.backend_inventario.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inventario.backend_inventario.Model.Area;

@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {
    boolean existsByNombreArea(String nombreArea);
}
