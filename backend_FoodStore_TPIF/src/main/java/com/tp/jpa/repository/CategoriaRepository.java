package com.tp.jpa.repository;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import java.util.List;
import java.util.Optional;

public class CategoriaRepository extends BaseRepository<Categoria> {

    public CategoriaRepository() {
        super(Categoria.class);
    }

    /*
     * Consulta JPQL: retorna los productos activos de una categoria.
     */
    public List<Producto> buscarProductosPorCategoria(Long categoriaId) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Categoria c JOIN c.productos p " +
                    "WHERE c.id = :categoriaId AND p.eliminado = false";
            return em.createQuery(jpql, Producto.class)
                    .setParameter("categoriaId", categoriaId)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    /*
     * Retorna la categoria activa a la que pertenece el producto indicado.
     */
    public Optional<Categoria> buscarCategoriaPorProducto(Long idProducto) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT c FROM Categoria c JOIN c.productos p " +
                    "WHERE p.id = :idProducto AND c.eliminado = false";
            List<Categoria> resultados = em.createQuery(jpql, Categoria.class)
                    .setParameter("idProducto", idProducto)
                    .getResultList();
            return resultados.stream().findFirst();
        } finally {
            em.close();
        }
    }

    /**
     * Alta de un Producto asociado a una Categoria, dentro de UNA UNICA
     * transaccion con el MISMO EntityManager que recupera la Categoria.
     */
    public Producto altaProductoEnCategoria(Long idCategoria, Producto producto) {
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            Categoria categoria = em.find(Categoria.class, idCategoria);
            if (categoria == null || categoria.isEliminado()) {
                throw new IllegalStateException("La categoria no existe o esta dada de baja.");
            }
            categoria.addProducto(producto);
            tx.commit();
            return producto;
        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        } finally {
            em.close();
        }
    }
}