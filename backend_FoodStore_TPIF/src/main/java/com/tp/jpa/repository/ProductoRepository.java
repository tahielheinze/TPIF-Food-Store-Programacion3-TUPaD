package com.tp.jpa.repository;

import com.tp.jpa.model.Producto;

public class ProductoRepository extends BaseRepository<Producto> {

    public ProductoRepository() {
        super(Producto.class);
    }
}
