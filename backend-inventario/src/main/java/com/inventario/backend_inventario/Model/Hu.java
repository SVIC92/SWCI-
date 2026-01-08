package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.inventario.backend_inventario.Enum.EstadoHu;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "HU")
public class Hu implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codHu;

    @ManyToOne
    @JoinColumn(name = "id_sede_origen", nullable = false)
    private Sede almacen;
    @ManyToOne
    @JoinColumn(name = "id_sede_destino")
    private Sede sedeDestino;

    @OneToMany(mappedBy = "hu", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("hu")
    @ToString.Exclude
    private List<DetalleHu> detalle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoHu estado;

    private String tipoIndicador;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaSolicitada;

    private LocalDate fechaVencimiento;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoHu.EN_CONSTRUCCION;
        }
    }
}