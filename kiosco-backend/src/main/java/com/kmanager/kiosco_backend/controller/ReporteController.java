package com.kmanager.kiosco_backend.controller;

import com.kmanager.kiosco_backend.entity.Producto;
import com.kmanager.kiosco_backend.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReporteController {

    private final ProductoService productoService;

    /**
     * GET /api/reportes/stock-bajo
     * Obtiene todos los productos con stock bajo.
     *
     * CRÍTICO según la especificación: Filtra productos donde stockActual < stockMinimo
     *
     * Este endpoint es clave para:
     * - Mostrar alertas en el dashboard
     * - Generar reportes de reposición
     * - Notificar al usuario que debe comprar más stock
     *
     * Ejemplo de respuesta:
     * [
     *   {
     *     "id": 1,
     *     "nombre": "Coca Cola 500ml",
     *     "stockActual": 5,
     *     "stockMinimo": 10,
     *     "categoria": "Bebidas"
     *   },
     *   {
     *     "id": 8,
     *     "nombre": "Marlboro Box",
     *     "stockActual": 2,
     *     "stockMinimo": 20,
     *     "categoria": "Cigarrillos"
     *   }
     * ]
     */
    @GetMapping("/stock-bajo")
    public ResponseEntity<List<Producto>> obtenerProductosStockBajo() {
        List<Producto> productos = productoService.obtenerProductosConStockBajo();
        return ResponseEntity.ok(productos);
    }

    /**
     * GET /api/reportes/stock-bajo/count
     * Cuenta cuántos productos tienen stock bajo.
     *
     * Útil para mostrar un badge/notificación en el dashboard:
     * "⚠️ 5 productos con stock bajo"
     */
    @GetMapping("/stock-bajo/count")
    public ResponseEntity<CountResponse> contarProductosStockBajo() {
        List<Producto> productos = productoService.obtenerProductosConStockBajo();
        return ResponseEntity.ok(new CountResponse(productos.size()));
    }

    /**
     * DTO para respuestas de conteo.
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class CountResponse {
        private int count;
    }
}
