package com.kmanager.kiosco_backend.service;

import com.kmanager.kiosco_backend.entity.Producto;
import com.kmanager.kiosco_backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    //Inyeccion de dependencia del repositorio
    private final ProductoRepository productoRepository;

    /**
     * obtiene todos los productos.
     * @Transactional(readOnly = true) oprimiza las consulatas de solo lectura.
     */
    @Transactional(readOnly = true)
    public List<Producto> obtenerTodos(){
        return productoRepository.findAll();
    }

    /**
     * busca un producto por ID
     */
    @Transactional(readOnly = true)
    public Optional<Producto> obtenerPorId(Long id){
        return productoRepository.findById(id);
    }

    /**
     * crea un nuevo producto
     * validacion adicionales pueden agregarse aqui
     */
    public Producto crear(Producto producto) {
        //validacion de negocio: el precio de venta debe ser mayor al costo
        if (producto.getPrecioVenta() <= producto.getPrecioCosto()) {
            throw new IllegalArgumentException(
                    "El precio de venta debe ser mayor al precio de costo"
            );
        }
        return productoRepository.save(producto);
    }

    /**
     * Actualiza un producto existente
     */
    public Producto actualizar(Long id, Producto productoActualizado) {
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        //Actualizaos los campos
        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setPrecioVenta(productoActualizado.getPrecioVenta());
        productoExistente.setPrecioCosto(productoActualizado.getPrecioCosto());
        productoExistente.setStockActual(productoActualizado.getStockActual());
        productoExistente.setStockMinimo(productoActualizado.getStockMinimo());
        productoExistente.setCategoria(productoActualizado.getCategoria());

        //Validacion
        if (productoExistente.getPrecioVenta() <= productoExistente.getPrecioCosto()) {
            throw new IllegalArgumentException(
                    "El precio de venta debe ser mayor al precio de costo"
            );
        }

        return productoRepository.save(productoExistente);
    }

    /**
     * Elimina un producto por ID
     */
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }

    /**
     * Busca productos por categoria
     */
    @Transactional(readOnly = true)
    public List<Producto> buscarPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    /**
     * busca productos por nombre(busqueda parcial)
     */
    @Transactional(readOnly = true)
    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    /**
     * obtiene productos con stock bajo(sotckActual < stockMinimo).
     */
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosConStockBajo() {
        return productoRepository.findProductosConStockBajo();
    }

    /**
     * ajusta el stock de un producto (sumar o restar).
     */
    public Producto ajustarStock(Long id, Integer cantidad) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        if (cantidad > 0) {
            producto.agregarStock(cantidad);
        } else if (cantidad < 0) {
            producto.descontarStock(Math.abs(cantidad));
        }
        return productoRepository.save(producto);
    }

    /**
     * obtiene todas las categorias unicas
     */
    @Transactional(readOnly = true)
    public List<String> obtenerCategorias(){
        return productoRepository.findAllCategorias();
    }
}
