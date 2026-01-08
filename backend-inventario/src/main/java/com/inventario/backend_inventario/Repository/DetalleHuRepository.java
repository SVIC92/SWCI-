package com.inventario.backend_inventario.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inventario.backend_inventario.Model.DetalleHu;
import com.inventario.backend_inventario.Model.Hu;

@Repository
public interface DetalleHuRepository extends JpaRepository<DetalleHu, Long> {

    List<DetalleHu> findByHu(Hu hu);
}