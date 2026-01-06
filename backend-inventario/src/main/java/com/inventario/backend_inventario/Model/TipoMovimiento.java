// Ubicación: src/main/java/com/inventario/backend_inventario/Model/TipoMovimiento.java

package com.inventario.backend_inventario.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TIPO_MOVIMIENTO")
@Data
@NoArgsConstructor
public class TipoMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_mov")
    private Long id;

    @Column(name = "tipo", nullable = false, unique = true)
    private String tipo; // "Recepción", "Merma", "Venta", "Ajuste Conteo", etc.

    @Column(name = "descripcion")
    private String descripcion;
}