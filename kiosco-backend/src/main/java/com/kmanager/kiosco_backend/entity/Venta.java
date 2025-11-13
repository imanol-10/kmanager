package com.kmanager.kiosco_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Data
@NoArgsConstructor
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Double totalVenta;

    @Column(nullable = false)
    private String metodoPago;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VentaItem> itemsVendidos = new ArrayList<>();

    public Venta(String metodoPago) {
        this.timestamp = LocalDateTime.now();
        this.metodoPago = metodoPago;
        this.totalVenta = 0.0;
    }

    public void agregarItem(VentaItem item) {
        itemsVendidos.add(item);
        item.setVenta(this);
    }

    public void quitarItem(VentaItem item) {
        itemsVendidos.remove(item);
        item.setVenta(null);
    }

    public void calcularTotal() {
        this.totalVenta = itemsVendidos.stream()
                .mapToDouble(VentaItem::getSubtotal)
                .sum();
    }

    public Double getGananciaTotal() {
        return itemsVendidos.stream()
                .mapToDouble(item -> {
                    double ganaciaUnitaria = item.getPrecioUnitario() -
                                             item.getProducto().getPrecioCosto();
                    return ganaciaUnitaria * item.getCantidad();
                })
                .sum();
    }
}
