package com.inventario.backend_inventario.Model;

import com.inventario.backend_inventario.Enum.TipoMerma;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "detalle_mermas")
public class DetalleMerma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "merma_id", nullable = false)
    @JsonIgnore
    private Merma merma;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Double cantidad;

    @Column(name = "costo_unitario", nullable = false)
    private Double costoUnitario;

    @Column(name = "costo_total", nullable = false)
    private Double costoTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_merma", nullable = false)
    private TipoMerma tipoMerma;
}