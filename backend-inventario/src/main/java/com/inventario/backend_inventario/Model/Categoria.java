package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "CATEGORIA")
public class Categoria implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_cat;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    private String nombreCat;

    @ManyToOne
    @JoinColumn(name = "id_area", nullable = false)
    @JsonBackReference
    private Area area;

    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
    private List<Producto> productos;
    
}