package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.inventario.backend_inventario.Enum.DestinoDevolucion;
import com.inventario.backend_inventario.Enum.EstadoSolicitud;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Devolución de mercadería: una sede devuelve productos al almacén/sede de origen o a un proveedor.
 * Queda PENDIENTE hasta que Admin / Jefe de Inventario la aprueba (recién ahí se mueve el stock).
 */
@Entity
@Data
@Table(name = "solicitudes_devolucion")
public class SolicitudDevolucion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Sede que devuelve la mercadería (sale stock de aquí). */
    @ManyToOne
    @JoinColumn(name = "sede_origen_id")
    private Sede sedeOrigen;

    @Enumerated(EnumType.STRING)
    private DestinoDevolucion tipoDestino;

    /** Solo si tipoDestino = SEDE (recibe stock). */
    @ManyToOne
    @JoinColumn(name = "sede_destino_id")
    private Sede sedeDestino;

    /** Solo si tipoDestino = PROVEEDOR. */
    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "usuario_solicitante_id")
    private Usuario usuarioSolicitante;

    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaAprobacion;

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado;

    @Column(length = 255)
    private String referencia;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<DetalleSolicitudDevolucion> detalles;

    @Column(length = 500)
    private String motivoRechazo;
}
