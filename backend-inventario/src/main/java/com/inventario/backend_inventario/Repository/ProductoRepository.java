package com.inventario.backend_inventario.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inventario.backend_inventario.Dto.SugerenciaCompraDto;
import com.inventario.backend_inventario.Model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    boolean existsBySku(String sku);

    boolean existsByCodEan(String codEan);

    @Query(value = "SELECT * FROM PRODUCTO p WHERE similarity(p.nombre, :nombre) > 0.25 ORDER BY similarity(p.nombre, :nombre) DESC LIMIT 10", nativeQuery = true)
    List<Producto> buscarPorSimilitud(@Param("nombre") String nombre);

    @Query(value = "SELECT " +
            "p.id_producto AS idProducto, " +
            "p.nombre AS nombre, " +
            "pr.nombre_proveedor AS proveedor, " +
            "i.stock_actual AS stockActual, " +
            "p.stock_minimo AS stockMinimo, " +
            "p.stock_ideal AS stockIdeal, " +
            "(p.stock_ideal - i.stock_actual) AS cantidadSugerida " +
            "FROM PRODUCTO p " +
            "JOIN INVENTARIO_ACTUAL i ON p.id_producto = i.id_producto " +
            "JOIN PROVEEDOR pr ON p.id_proveedor = pr.id_proveedor " +
            "WHERE i.stock_actual <= p.stock_minimo " +
            "AND i.id_sede = :idSede",
            nativeQuery = true)
    List<SugerenciaCompraDto> obtenerSugerenciasPorSede(@Param("idSede") Long idSede);
}
