package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.inventario.backend_inventario.Enum.EstadoSolicitud;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "solicitudes_transferencia")
public class SolicitudTransferencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sede_origen_id")
    private Sede sedeOrigen;

    @ManyToOne
    @JoinColumn(name = "sede_destino_id")
    private Sede sedeDestino;

    @ManyToOne
    @JoinColumn(name = "usuario_solicitante_id")
    private Usuario usuarioSolicitante;

    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaAprobacion; 

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado; 

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<DetalleSolicitud> detalles;

    @Column(length = 500)
    private String motivoRechazo;
}