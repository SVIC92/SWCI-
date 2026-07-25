package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.inventario.backend_inventario.Enum.EstadoConteo;
import com.inventario.backend_inventario.Enum.TipoConteo;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "hojas_conteo")
public class HojaConteo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sede_id")
    private Sede sede;

    @Enumerated(EnumType.STRING)
    private TipoConteo tipoConteo;

    @Enumerated(EnumType.STRING)
    private EstadoConteo estado;

    @ManyToOne
    @JoinColumn(name = "usuario_generador_id")
    private Usuario usuarioGenerador;

    @ManyToOne
    @JoinColumn(name = "usuario_contador_id")
    private Usuario usuarioContador;

    @ManyToOne
    @JoinColumn(name = "usuario_aprobador_id")
    private Usuario usuarioAprobador;

    private LocalDateTime fechaGeneracion;
    private LocalDateTime fechaConteo;
    private LocalDateTime fechaAprobacion;

    // Resumen legible del alcance elegido al generar (ej. "Área: Bebidas", "Toda la Sede")
    @Column(length = 150)
    private String alcanceDescripcion;

    @Column(length = 500)
    private String motivoRechazo;

    @OneToMany(mappedBy = "hoja", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<DetalleConteo> detalles;
}
