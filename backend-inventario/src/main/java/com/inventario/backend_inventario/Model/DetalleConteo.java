package com.inventario.backend_inventario.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "detalles_conteo")
public class DetalleConteo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer stockSistema;
    private Integer stockContado;

    @ManyToOne
    @JoinColumn(name = "hoja_id")
    @JsonBackReference
    private HojaConteo hoja;
}
