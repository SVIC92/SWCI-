package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "detalles_solicitud_devolucion")
public class DetalleSolicitudDevolucion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer cantidad;

    @Column(length = 255)
    private String motivo;

    @ManyToOne
    @JoinColumn(name = "solicitud_id")
    @JsonBackReference
    private SolicitudDevolucion solicitud;
}
