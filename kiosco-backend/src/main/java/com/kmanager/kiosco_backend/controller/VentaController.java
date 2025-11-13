package com.kmanager.kiosco_backend.controller;

import com.kmanager.kiosco_backend.entity.Venta;
import com.kmanager.kiosco_backend.service.VentaService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de ventas (POS).
 */
@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    /**
     * POST /api/ventas
     * Registra una nueva venta (endpoint CRÍTICO del POS).
     *
     * Recibe un JSON como este:
     * {
     *   "metodoPago": "Efectivo",
     *   "items": {
     *     "1": 2,    // Producto ID 1, cantidad 2
     *     "3": 1,    // Producto ID 3, cantidad 1
     *     "5": 5     // Producto ID 5, cantidad 5
     *   }
     * }
     *
     * Proceso:
     * 1. Valida que haya stock suficiente de cada producto
     * 2. Descuenta el stock automáticamente
     * 3. Registra la venta
     * 4. Devuelve la venta completa con el total calculado
     */
    @PostMapping
    public ResponseEntity<?> registrarVenta(@Valid @RequestBody RegistrarVentaRequest request) {
        try {
            Venta venta = ventaService.registraVenta(
                    request.getMetodoPago(),
                    request.getItems()
            );

            // Devuelve la venta con código 201 Created
            return ResponseEntity.status(HttpStatus.CREATED).body(venta);

        } catch (IllegalArgumentException e) {
            // Error de validación (stock insuficiente, datos inválidos, etc.)
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));

        } catch (RuntimeException e) {
            // Producto no encontrado u otro error
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/ventas
     * Obtiene todas las ventas registradas.
     */
    @GetMapping
    public ResponseEntity<List<Venta>> obtenerTodas() {
        List<Venta> ventas = ventaService.obtenerTodas();
        return ResponseEntity.ok(ventas);
    }

    /**
     * GET /api/ventas/{id}
     * Obtiene una venta específica por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerPorId(@PathVariable Long id) {
        return ventaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/ventas/diarias
     * Obtiene todas las ventas del día actual.
     *
     * Este endpoint es clave para el POS: muestra las ventas de hoy.
     */
    @GetMapping("/diarias")
    public ResponseEntity<List<Venta>> obtenerVentasDiarias() {
        List<Venta> ventas = ventaService.obtenerVentasDiarias();
        return ResponseEntity.ok(ventas);
    }

    /**
     * GET /api/ventas/rango?inicio=2025-01-01T00:00:00&fin=2025-01-31T23:59:59
     * Obtiene ventas en un rango de fechas.
     *
     * @DateTimeFormat: Convierte el string de la URL a LocalDateTime
     * Formato esperado: yyyy-MM-ddTHH:mm:ss (ISO 8601)
     */
    @GetMapping("/rango")
    public ResponseEntity<List<Venta>> obtenerVentasEnRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        List<Venta> ventas = ventaService.obtenerVentasEntreFechas(inicio, fin);
        return ResponseEntity.ok(ventas);
    }

    /**
     * GET /api/ventas/ultimas
     * Obtiene las últimas 10 ventas registradas.
     *
     * Útil para mostrar un historial reciente en el dashboard.
     */
    @GetMapping("/ultimas")
    public ResponseEntity<List<Venta>> obtenerUltimas() {
        List<Venta> ventas = ventaService.obtenerLasUltimasVentas();
        return ResponseEntity.ok(ventas);
    }

    /**
     * GET /api/ventas/metodo-pago?metodo=Efectivo
     * Obtiene ventas filtradas por método de pago.
     */
    @GetMapping("/metodo-pago")
    public ResponseEntity<List<Venta>> obtenerPorMetodoPago(
            @RequestParam String metodo) {
        List<Venta> ventas = ventaService.obtenerVentasPorMetodoPago(metodo);
        return ResponseEntity.ok(ventas);
    }

    /**
     * GET /api/ventas/total/diario
     * Calcula el total vendido en el día actual.
     *
     * Devuelve solo el número, no las ventas completas.
     * Ejemplo de respuesta: { "total": 15000.50 }
     */
    @GetMapping("/total/diario")
    public ResponseEntity<TotalResponse> calcularTotalDiario() {
        Double total = ventaService.calcularTotalVentasDiarias();
        return ResponseEntity.ok(new TotalResponse(total));
    }

    /**
     * GET /api/ventas/total/rango?inicio=...&fin=...
     * Calcula el total vendido en un rango de fechas.
     */
    @GetMapping("/total/rango")
    public ResponseEntity<TotalResponse> calcularTotalEnRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        Double total = ventaService.calcularTotalVentasEntreFechas(inicio, fin);
        return ResponseEntity.ok(new TotalResponse(total));
    }

    /**
     * GET /api/ventas/estadisticas/metodos-pago?inicio=...&fin=...
     * Obtiene estadísticas de ventas agrupadas por método de pago.
     *
     * Ejemplo de respuesta:
     * [
     *   { "metodoPago": "Efectivo", "total": 25000.0 },
     *   { "metodoPago": "Tarjeta", "total": 18000.0 },
     *   { "metodoPago": "QR", "total": 5000.0 }
     * ]
     */
    @GetMapping("/estadisticas/metodos-pago")
    public ResponseEntity<List<Object[]>> obtenerEstadisticasPorMetodoPago(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        List<Object[]> estadisticas = ventaService.calcularVentasPorMetodoPago(inicio, fin);
        return ResponseEntity.ok(estadisticas);
    }

    // ========== Clases auxiliares para Request/Response ==========

    /**
     * DTO (Data Transfer Object) para registrar una venta.
     * Representa el JSON que recibe el endpoint POST /api/ventas
     */
    @Data
    public static class RegistrarVentaRequest {
        private String metodoPago;
        private Map<Long, Integer> items;  // productoId → cantidad
    }

    /**
     * DTO para respuestas de totales.
     */
    @Data
    @lombok.AllArgsConstructor
    public static class TotalResponse {
        private Double total;
    }

    /**
     * DTO para respuestas de error.
     */
    @Data
    @lombok.AllArgsConstructor
    public static class ErrorResponse {
        private String mensaje;
    }
}
