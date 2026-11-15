package com.inventario.backend_inventario.Exception;

import java.util.List;

/** La importación de ventas se rechaza completa si alguna fila es inválida. */
public class ImportacionVentasException extends RuntimeException {

    private final List<String> errores;

    public ImportacionVentasException(String mensaje, List<String> errores) {
        super(mensaje);
        this.errores = errores;
    }

    public List<String> getErrores() {
        return errores;
    }
}
