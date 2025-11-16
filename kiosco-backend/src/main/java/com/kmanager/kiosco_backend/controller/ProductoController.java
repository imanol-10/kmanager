package com.kmanager.kiosco_backend.controller;

import com.kmanager.kiosco_backend.dto.ProductoDTO;
import com.kmanager.kiosco_backend.entity.Producto;
import com.kmanager.kiosco_backend.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodos() {
        List<Producto> productos = productoService.obtenerTodos();
        return ResponseEntity.ok(productos);
    }

    /**
     * Obtiene un producto espicifico por su ID
     * Extrae el valor de la URL
     */

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok) //Si existe: 200 ok con el producto
                .orElse(ResponseEntity.notFound().build()); //Si no existe: 404 Not Found
    }

    /**
     * Crea un nuevo producto.
     *
     */
    @PostMapping
    public ResponseEntity<Producto> crear(@Valid @RequestBody Producto producto) {
        try {
            Producto nuevoProducto = productoService.crear(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
        } catch (Exception e) {
            //Si hay error de validacion de negocio(ej: precio venta < costo)
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Actualiza un producto existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        try {
            System.out.println("📥 Datos recibidos:");
            System.out.println("  Tipo Venta: " + producto.getTipoVenta());
            System.out.println("  Unidad Medida: " + producto.getUnidadMedida());
            System.out.println("  Incremento: " + producto.getIncrementoMinimo());

            Producto productoActualizado = productoService.actualizar(id, producto);
            return ResponseEntity.ok(productoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * DELETE /api/productos/{id}
     * Elimina un producto.
     *
     * Ejemplo: DELETE /api/productos/5
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.noContent().build();  // 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();  // 404 Not Found
        }
    }

    /**
     * GET /api/productos/buscar/categoria?nombre=Bebidas
     * Busca productos por categoría.
     *
     * @RequestParam: Extrae parámetros de la URL (después del ?)
     */
    @GetMapping("/buscar/categoria")
    public ResponseEntity<List<Producto>> buscarPorCategoria(
            @RequestParam String nombre) {
        List<Producto> productos = productoService.buscarPorCategoria(nombre);
        return ResponseEntity.ok(productos);
    }

    /**
     * GET /api/productos/buscar/nombre?texto=coca
     * Busca productos por nombre (búsqueda parcial).
     *
     * Ejemplo: /api/productos/buscar/nombre?texto=coca
     * Encontrará: "Coca Cola", "Coca Zero", etc.
     */
    @GetMapping("/buscar/nombre")
    public ResponseEntity<List<Producto>> buscarPorNombre(
            @RequestParam String texto) {
        List<Producto> productos = productoService.buscarPorNombre(texto);
        return ResponseEntity.ok(productos);
    }

    /**
     * GET /api/productos/categorias
     * Obtiene todas las categorías únicas.
     *
     * Útil para mostrar filtros en el frontend.
     */
    @GetMapping("/categorias")
    public ResponseEntity<List<String>> obtenerCategorias() {
        List<String> categorias = productoService.obtenerCategorias();
        return ResponseEntity.ok(categorias);
    }

    /**
     * PATCH /api/productos/{id}/stock
     * Ajusta el stock de un producto (sumar o restar).
     *
     * @RequestBody: Recibe un objeto JSON simple: { "cantidad": 10 }
     *
     * Ejemplo 1: PATCH /api/productos/5/stock
     *            Body: { "cantidad": 10 }  → Suma 10 unidades
     *
     * Ejemplo 2: PATCH /api/productos/5/stock
     *            Body: { "cantidad": -5 }  → Resta 5 unidades
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Producto> ajustarStock(
            @PathVariable Long id,
            @RequestBody AjusteStockRequest request) {
        try {
            Producto producto = productoService.ajustarStock(id, request.getCantidad());
            return ResponseEntity.ok(producto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    /**
     * GET /api/productos/buscar/codigo-barras?codigo=7790001234567
     * Busca un producto por código de barras.
     *
     * Este endpoint es usado por el escáner de códigos de barras.
     */
    @GetMapping("/buscar/codigo-barras")
    public ResponseEntity<Producto> buscarPorCodigoBarras(@RequestParam String codigo) {
        return productoService.buscarPorCodigoBarras(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Clase interna para recibir el ajuste de stock.
     * Representa el JSON: { "cantidad": 10 }
     */
    @lombok.Data
    public static class AjusteStockRequest {
        private Integer cantidad;
    }
}
