package com.inventario.backend_inventario.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inventario.backend_inventario.Model.Sede;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Integer> {
    Sede findByNombreSede(String nombreSede);
    List<Sede> findByTipo(String tipo);
}
