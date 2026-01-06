package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "AREA")
public class Area implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_area;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "El nombre del área es obligatorio")
    private String nombreArea;

    @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Categoria> categorias;
    
}