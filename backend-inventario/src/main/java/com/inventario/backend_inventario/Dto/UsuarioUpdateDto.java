package com.inventario.backend_inventario.Dto;

import com.inventario.backend_inventario.Model.Rol;
import jakarta.validation.constraints.*;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class UsuarioUpdateDto {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre_u;
    
    private String apellido_pat;
    private String apellido_mat;
    
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "\\d{9}", message = "El teléfono debe tener exactamente 9 dígitos numéricos")
    private String telefono;
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    private String email;
    
    private Rol rol;
}
