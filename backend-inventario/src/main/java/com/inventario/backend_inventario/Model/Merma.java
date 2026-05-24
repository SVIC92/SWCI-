package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "mermas")
public class Merma {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @Column(name = "costo_total", nullable = false)
    private Double costoTotal;

    @OneToMany(mappedBy = "merma", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetalleMerma> detalles;
}