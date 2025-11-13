package com.kmanager.kiosco_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@Table(name = "venta_items")
@NoArgsConstructor
@AllArgsConstructor
public class VentaItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    @JsonIgnore
    private Venta venta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Double precioUnitario;

    @Transient
    public Double getSubtotal(){
        return cantidad * precioUnitario;
    }

    public VentaItem(Producto producto, Integer cantiad) {
        this.producto = producto;
        this.cantidad = cantiad;
        this.precioUnitario = producto.getPrecioVenta();
    }
}