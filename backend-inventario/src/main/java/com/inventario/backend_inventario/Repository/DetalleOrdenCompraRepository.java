package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Model.DetalleOrdenCompra;
import com.inventario.backend_inventario.Model.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleOrdenCompraRepository extends JpaRepository<DetalleOrdenCompra, Long> {
    List<DetalleOrdenCompra> findByOrdenCompra(OrdenCompra ordenCompra);
}