package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "DETALLE_ORDEN_COMPRA")
@Data
@NoArgsConstructor
public class DetalleOrdenCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_orden", nullable = false)
    @JsonBackReference 
    @ToString.Exclude
    private OrdenCompra ordenCompra;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    private Integer cantidadSolicitada;
    private Integer cantidadRecibida = 0;
    private Double costoUnitarioPactado;

    public Double getSubtotal() {
        return cantidadSolicitada * costoUnitarioPactado;
    }
}