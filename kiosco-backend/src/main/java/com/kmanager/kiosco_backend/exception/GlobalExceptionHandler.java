package com.kmanager.kiosco_backend.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones.
 *
 * @RestControllerAdvice: Intercepta excepciones de TODOS los controladores
 * y las convierte en respuestas JSON estructuradas.
 *
 * Sin esto, los errores se verían como HTML feo.
 * Con esto, todos los errores tienen el mismo formato JSON limpio.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * Maneja errores de validación (@Valid en los controladores).
     *
     * Cuando un producto no cumple las validaciones
     * (@NotBlank, @Positive, etc.), Spring lanza MethodArgumentNotValidException.
     *
     * Este método convierte esos errores en un JSON claro:
     * {
     *   "timestamp": "2025-11-02T14:30:00",
     *   "status": 400,
     *   "errors": {
     *     "nombre": "El nombre del producto es obligatorio",
     *     "precioVenta": "El precio debe ser mayor a 0"
     *   }
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errores = new HashMap<>();

        // Extrae todos los errores de validación
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            String mensaje = error.getDefaultMessage();
            errores.put(campo, mensaje);
        });

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Error de validación",
                errores
        );

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Maneja IllegalArgumentException (errores de lógica de negocio).
     *
     * Por ejemplo: "Stock insuficiente", "Precio de venta debe ser mayor al costo"
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex) {

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                null
        );

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Maneja RuntimeException genéricas.
     *
     * Por ejemplo: "Producto no encontrado", "Venta no encontrada"
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex) {

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getMessage(),
                null
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Maneja cualquier otra excepción no capturada.
     * Es el catch-all de seguridad.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex) {

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error interno del servidor: " + ex.getMessage(),
                null
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * DTO para respuestas de error estandarizadas.
     */
    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private LocalDateTime timestamp;
        private int status;
        private String mensaje;
        private Map<String, String> errores;  // Para errores de validación múltiples
    }
}
