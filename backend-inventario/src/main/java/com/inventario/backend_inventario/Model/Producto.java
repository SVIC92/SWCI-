package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "PRODUCTO")
public class Producto implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_producto;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "El SKU es obligatorio")
    private String sku;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "El código EAN es obligatorio")
    private String codEan;

    @Column(nullable = false)
    @NotBlank(message = "El nombre del producto es obligatorio")
    private String nombre;

    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @NotBlank(message = "La unidad de medida es obligatoria")
    private String uni_medida;

    @PositiveOrZero(message = "El precio de venta no puede ser negativo")
    private Double precio_venta;

    @PositiveOrZero(message = "El precio de compra no puede ser negativo")
    private Double precio_compra;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 10;

    @Column(name = "stock_ideal")
    private Integer stockIdeal;

    @Column(nullable = false)
    private Boolean estado = true;

    @ManyToOne
    @JoinColumn(name = "id_cat", nullable = false)
    @JsonIgnoreProperties("productos")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;
}