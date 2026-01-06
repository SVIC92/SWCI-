package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data               
@NoArgsConstructor    
@AllArgsConstructor
@Table(name = "campania")
public class Campania {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombreCampania;
    private String descripcion;
    
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    
    private Double porcentajeDescuento;
    
    private String imagenUrl;
    
    @ManyToMany
    @JoinTable(
        name = "campania_productos",
        joinColumns = @JoinColumn(name = "campania_id"),
        inverseJoinColumns = @JoinColumn(name = "producto_id")
    )
    private List<Producto> productosAplicables;
}
