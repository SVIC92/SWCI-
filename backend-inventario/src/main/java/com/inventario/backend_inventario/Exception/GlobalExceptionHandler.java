package com.inventario.backend_inventario.Exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String MENSAJE_ERROR_GENERICO =
            "Ocurrió un error inesperado. Por favor, inténtalo nuevamente o contacta al soporte si el problema persiste.";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();

        var errores = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        err -> err.getField(),
                        err -> err.getDefaultMessage(),
                        (msg1, msg2) -> msg1
                ));

        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Error de validación");
        response.put("errors", errores);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<Map<String, Object>> handleResourceConflictException(ResourceConflictException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("error", "Conflicto de Recurso");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Captura cualquier excepción no controlada (bugs, fallos de serialización, errores de
     * infraestructura, etc). El detalle técnico se registra en el log del servidor, pero NUNCA
     * se expone al cliente: el usuario siempre recibe el mismo mensaje estandarizado.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        logger.error("Error interno no controlado", ex);

        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Error interno del servidor");
        response.put("message", MENSAJE_ERROR_GENERICO);
        return ResponseEntity.internalServerError().body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.badRequest().body("El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB.");
    }
}
