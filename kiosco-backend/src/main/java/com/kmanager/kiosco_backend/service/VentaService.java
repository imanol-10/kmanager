package com.kmanager.kiosco_backend.service;

import com.kmanager.kiosco_backend.entity.Producto;
import com.kmanager.kiosco_backend.entity.Venta;
import com.kmanager.kiosco_backend.entity.VentaItem;
import com.kmanager.kiosco_backend.repository.ProductoRepository;
import com.kmanager.kiosco_backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    /**
     * Registra una nueva venta
     * este metodo es CRITICO y debe ser transaccional
     * @param metodoPago metodo de pago utilizado
     * @param items mapa de productoId -> cantidad
     * @return la venta registrada
     *
     * pasos:
     * 1. Crea la venta
     * 2. Por cada item:
     *   a.Busca el producto
     *   b.Valida que haya stock suficiente
     *   c.Descuenta el stock
     * 3. calcula el total
     * 4.guarda todo en una transaccion atomica
     */

    public Venta registraVenta(String metodoPago, Map<Long, Integer> items) {
        //Validaciones iniciales
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("La venta debe tener al menos un producto");
        }

        //crea la venta
        Venta venta = new Venta(metodoPago);

        //Proceas cada item del carrito
        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            Long productoId = entry.getKey();
            Integer cantidad = entry.getValue();

            //busca el producto
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new RuntimeException(
                            "Producto no encontrado con ID: " + productoId
                    ));

            //Critico: validar y descontar stock
            //este metodo lanza excepcion si no hay suficiente stock
            producto.descontarStock(cantidad);

            //crear el item de venta
            VentaItem ventaItem = new VentaItem(producto, cantidad);
            venta.agregarItem(ventaItem);

            //guardar el producto con stock actualizado
            productoRepository.save(producto);
        }

        //calcular el total de la venta
        venta.calcularTotal();

        //validacion: la venta debe tener un total > 0
        if (venta.getTotalVenta() <= 0) {
            throw new IllegalArgumentException("El total de la venta debe ser mayor a 0");
        }

        //guardar la venta (esto tambien guarda los items por cascade)
        return ventaRepository.save(venta);
    }

    /**
     * obtiene todas las ventas.
     */
    @Transactional(readOnly = true)
    public List<Venta> obtenerTodas() {
        return ventaRepository.findAll();
    }

    /**
     * busca una venta por ID
     */
    @Transactional(readOnly = true)
    public Optional<Venta> obtenerPorId(Long id) {
        return ventaRepository.findById(id);
    }

    /**
     * obtiene todas la ventas del dia actual.
     * define "dia actual" desde las 00:00:00 hasta las 23:59:59
     */
    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasDiarias() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(LocalTime.MAX);

        return ventaRepository.findByTimestampBetween(inicioDia, finDia);
    }

    /**
     * obtiene ventas en un rango de fechas
     */
    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasEntreFechas(LocalDateTime inicio, LocalDateTime fin) {
        return ventaRepository.findByTimestampBetween(inicio, fin);
    }

    /**
     * calcula el total vendido en el dia actual.
     */
    @Transactional(readOnly = true)
    public Double calcularTotalVentasDiarias() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(LocalTime.MAX);

        Double total = ventaRepository.calcularTotalVentasEntreFechas(inicioDia, finDia);
        return total != null ? total : 0.0;
    }

    /**
     * calcula el total vendido en un rango de fechas
     */
    @Transactional(readOnly = true)
    public Double calcularTotalVentasEntreFechas(LocalDateTime inicio, LocalDateTime fin) {
        Double total = ventaRepository.calcularTotalVentasEntreFechas(inicio, fin);
        return total != null ? total : 0.0;
    }

    /**
     * obtiene las ultimas 10 ventas.
     */
    @Transactional(readOnly = true)
    public List<Venta> obtenerLasUltimasVentas() {
        return ventaRepository.findTop10ByOrderByTimestampDesc();
    }

    /**
     * obtiene ventas por metodo de pago
     */
    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasPorMetodoPago(String metodoPago) {
        return ventaRepository.findByMetodoPago(metodoPago);
    }

    /**
     * calcula estadisticas de ventas por metodo de pago en un rango.
     */
    @Transactional(readOnly = true)
    public List<Object[]> calcularVentasPorMetodoPago(LocalDateTime inicio, LocalDateTime fin) {
        return ventaRepository.calcularVentasPorMetodoPago(inicio, fin);
    }


}
