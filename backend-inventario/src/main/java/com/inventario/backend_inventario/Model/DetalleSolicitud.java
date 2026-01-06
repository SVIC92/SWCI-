package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "detalles_solicitud")
public class DetalleSolicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer cantidad;

    @ManyToOne
    @JoinColumn(name = "solicitud_id")
    @JsonBackReference
    private SolicitudTransferencia solicitud;
}