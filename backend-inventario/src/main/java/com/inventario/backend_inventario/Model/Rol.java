package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "ROL")
public class Rol implements Serializable {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id_rol;
    @Column(nullable = false, unique = true)
    private String nombreRol;
}