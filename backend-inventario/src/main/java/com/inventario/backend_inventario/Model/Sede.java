package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "SEDE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sede")
    private Integer idSede;

    @NotBlank(message = "El nombre de la sede es obligatorio")
    @Column(name = "nombre_sede", nullable = false, length = 50)
    private String nombreSede;

    @NotBlank(message = "La dirección de la sede es obligatoria")
    @Column(name = "direccion_se", nullable = false, length = 100)
    private String direccion;

    @NotBlank(message = "El anexo de la sede es obligatorio")
    @Column(name = "anexo_se", nullable = false, length = 7)
    @Pattern(regexp = "^[0-9]{7}$", message = "El anexo debe ser un número de 7 dígitos")
    private String anexo;
}
