// Ubicación: src/main/java/com/inventario/backend_inventario/Model/MovimientoInventario.java

package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "MOVIMIENTO_INVENTARIO")
@Data
@NoArgsConstructor
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede", nullable = false)
    private Sede sede;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_mov", nullable = false)
    private TipoMovimiento tipoMovimiento; // Conectado a la tabla TipoMovimiento

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad; // +10 para entradas, -5 para salidas

    @Column(name = "observaciones")
    private String observaciones; // Mapea a tu columna 'observaciones'

    // Constructor adaptado a TU base de datos
    public MovimientoInventario(Producto producto, Sede sede, Usuario usuario,
                                TipoMovimiento tipoMovimiento, Integer cantidad, String observaciones) {
        this.producto = producto;
        this.sede = sede;
        this.usuario = usuario;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.observaciones = observaciones;
    }

    @PrePersist
    protected void onCreate() {
        this.fechaHora = LocalDateTime.now();
    }
}