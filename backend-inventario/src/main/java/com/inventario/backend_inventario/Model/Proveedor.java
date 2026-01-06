package com.inventario.backend_inventario.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "PROVEEDOR")
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_proveedor;

    @Column(nullable = false, unique = true, length = 11)
    @NotBlank(message = "El RUC es obligatorio")
    @Pattern(regexp = "20\\d{9}", message = "El RUC debe comenzar con '20' y tener 11 dígitos numéricos")
    private String ruc;

    @Column(nullable = false)
    @NotBlank(message = "El nombre del proveedor es obligatorio")
    private String nombre_proveedor;

    @Column(length = 15)
    @Pattern(regexp = "^\\+?[0-9]{6,15}$", message = "El formato del teléfono es inválido. Incluya el código de país si es necesario.")
    private String telefono;

    @Column(nullable = false, unique = true)
    @Email(message = "El correo electrónico no es válido")
    @NotBlank(message = "El correo electrónico es obligatorio")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;
}
