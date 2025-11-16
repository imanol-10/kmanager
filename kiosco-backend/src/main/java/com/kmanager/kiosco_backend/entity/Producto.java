package com.kmanager.kiosco_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(unique = true)
    private String codigoBarras;

    @Column(nullable = false)
    private Double precioVenta;

    @Column(nullable = false)
    private Double precioCosto;

    @Column(nullable = false)
    private Integer stockActual;

    @Column(nullable = false)
    private Integer stockMinimo;

    @Column(nullable = false)
    private String categoria;

    @Column(length = 500)
    private String imagenUrl;

    @Column(length = 20)
    private String tipoVenta = "UNIDAD";

    @Column(length = 20)
    private String unidadMedida = "unidad";

    @Column
    private Double incrementoMinimo = 1.0;

    @Transient
    public boolean isStockBajo(){
        return stockActual < stockMinimo;
    }

    public boolean esPorPeso() {
        return "PESO".equalsIgnoreCase(tipoVenta);
    }


    public void descontarStock(Integer cantidad) {
        if (cantidad > stockActual) {
            throw new IllegalArgumentException(
                    "Stock insuficiente para el  producto: " + nombre +
                            ". Disponible: " + stockActual + " , Solicitado: " + cantidad
            );
        }
        this.stockActual -= cantidad;
    }

    public void agregarStock(Integer cantidad) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        this.stockActual += cantidad;
    }
}
