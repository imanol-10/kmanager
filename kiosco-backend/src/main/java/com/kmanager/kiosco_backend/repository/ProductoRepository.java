package com.kmanager.kiosco_backend.repository;

import com.kmanager.kiosco_backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoria(String categoria);

    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    @Query("SELECT p FROM Producto p WHERE p.stockActual < p.stockMinimo")
    List<Producto> findProductosConStockBajo();

    @Query("SELECT p FROM Producto p WHERE p.categoria = ?1 AND p.stockActual < p.stockMinimo")
    List<Producto> findProductosConStockBajoPorCategoria(String categoria);

    /**
     * Cuenta cuántos productos hay en total por categoría.
     * Útil para estadísticas.
     */
    Long countByCategoria(String categoria);

    /**
     * Obtiene todas las categorías únicas.
     * DISTINCT elimina duplicados.
     */
    @Query("SELECT DISTINCT p.categoria FROM Producto p ORDER BY p.categoria")
    List<String> findAllCategorias();
}
