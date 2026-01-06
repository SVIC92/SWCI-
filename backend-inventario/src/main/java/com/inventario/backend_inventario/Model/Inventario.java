// Ubicación: src/main/java/com/inventario/backend_inventario/Model/Inventario.java

package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "INVENTARIO_ACTUAL", // El nombre exacto de tu tabla en la BD
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_producto", "id_sede"})
        })
@Data
@NoArgsConstructor
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ivn") // El nombre de tu columna PK
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false) // Tu columna FK
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede", nullable = false) // Tu columna FK
    private Sede sede;

    @Column(name = "stock_actual", nullable = false) // Tu columna de stock
    private Integer stockActual;

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;

    public Inventario(Producto producto, Sede sede, Integer stockActual) {
        this.producto = producto;
        this.sede = sede;
        this.stockActual = stockActual;
    }

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.ultimaActualizacion = LocalDateTime.now();
    }
}