package com.inventario.backend_inventario.Repository;

import com.inventario.backend_inventario.Enum.EstadoOC;
import com.inventario.backend_inventario.Model.OrdenCompra;
import com.inventario.backend_inventario.Model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {
    List<OrdenCompra> findByEstado(EstadoOC estado);
    List<OrdenCompra> findByProveedor(Proveedor proveedor);
    Optional<OrdenCompra> findByCodigoOrden(String codigoOrden);
    List<OrdenCompra> findTop10ByOrderByFechaEmisionDesc();
}