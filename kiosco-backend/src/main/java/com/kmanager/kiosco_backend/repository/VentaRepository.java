package com.kmanager.kiosco_backend.repository;

import com.kmanager.kiosco_backend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    /**
     *
     * Encuentra ventas entre dos fechas(rango).
     * "between" genera WHERE timestamp BETWEEN ? AND ?
     */
    List<Venta> findByTimestampBetween(LocalDateTime inicio, LocalDateTime fin);

    /**
     * Encuentra ventas por metodo de pago
     */
    List<Venta> findByMetodoPago(String metodPago);

    /**
     * Calcula el total vendido en un rango de fechas.
     * SUM es una funcion de agregacion.
     */
    @Query("SELECT SUM(v.totalVenta) FROM Venta v WHERE v.timestamp BETWEEN ?1 AND ?2")
    Double calcularTotalVentasEntreFechas(LocalDateTime inicio, LocalDateTime fin);

    /*
    Cuenta cuantas ventas se hicieron en un rango de fechas.
     */
    Long countByTimestampBetween(LocalDateTime inicio, LocalDateTime fin);

    /**
     * obtiene las ultimas N ventas ordenadas por fecha descendente
     * util para mostrar un historial reciente.
     */
    List<Venta> findTop10ByOrderByTimestampDesc();

    /**
     *Calcula el total vendido por metodo de pago en un rango de fechas.
     *GROUP BY agrupa los resultados.
     */
    @Query("SELECT v.metodoPago, SUM(v.totalVenta) FROM Venta v " +
           "WHERE v.timestamp BETWEEN ?1 AND ?2 " +
            "GROUP BY v.metodoPago")
    List<Object[]> calcularVentasPorMetodoPago(
          @Param("inicio") LocalDateTime inicio,
          @Param("fin")  LocalDateTime fin);
}
