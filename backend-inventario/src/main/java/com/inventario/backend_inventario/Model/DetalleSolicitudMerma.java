package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "detalles_solicitud_merma")
public class DetalleSolicitudMerma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer cantidad;

    @Column(length = 50)
    private String motivo;

    @Column(length = 500)
    private String observacion;

    @ManyToOne
    @JoinColumn(name = "solicitud_id")
    @JsonBackReference
    private SolicitudMerma solicitud;
}
