package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.inventario.backend_inventario.Enum.EstadoOC;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ORDEN_COMPRA")
@Data
@NoArgsConstructor
public class OrdenCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codigoOrden; // Ej: OC-2024-001

    @ManyToOne
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuarioSolicitante;

    @ManyToOne
    @JoinColumn(name = "id_sede_destino", nullable = false)
    private Sede sedeDestino;

    private LocalDateTime fechaEmision;
    private LocalDateTime fechaEntregaEsperada;

    @Enumerated(EnumType.STRING)
    private EstadoOC estado;

    private Double totalEstimado;

    @OneToMany(mappedBy = "ordenCompra", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference 
    @ToString.Exclude     
    private List<DetalleOrdenCompra> detalles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.fechaEmision = LocalDateTime.now();
        if (this.estado == null) this.estado = EstadoOC.PENDIENTE;
    }
}
