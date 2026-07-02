package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Producto;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.model.enums.FormaPago;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.time.LocalDate;
import java.util.List;

public class PedidoRepository extends BaseRepository<Pedido> {

    public PedidoRepository() {
        super(Pedido.class);
    }

    /* Retorna los pedidos activos que coinciden con el estado indicado. */
    public List<Pedido> buscarPorEstado(EstadoPedido estadoPedido) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("estado", estadoPedido)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    /**
     * Item temporal de carrito (idProducto + cantidad). No es una entidad
     * JPA: es un DTO en memoria que arma el menu de consola mientras el
     * operador elige productos, sin tocar la BD todavia.
     */
    public record ItemPedido(Long idProducto, int cantidad) {}

    /**
     * Alta de pedido dentro de una UNICA transaccion atomica. Recibe el
     * id del usuario, la forma de pago y la lista temporal de items ya
     * armada en memoria.*/
    public Pedido altaPedidoTransaccional(Long idUsuario, FormaPago formaPago, List<ItemPedido> items) {
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();

            Usuario usuario = em.find(Usuario.class, idUsuario);
            if (usuario == null || usuario.isEliminado()) {
                throw new IllegalStateException("El usuario no existe o esta inactivo.");
            }

            Pedido pedido = Pedido.builder()
                    .fecha(LocalDate.now())
                    .estado(EstadoPedido.PENDIENTE)
                    .formaPago(formaPago)
                    .build();

            for (ItemPedido item : items) {
                Producto producto = em.find(Producto.class, item.idProducto());
                if (producto == null || producto.isEliminado() || !Boolean.TRUE.equals(producto.getDisponible())) {
                    throw new IllegalStateException("El producto ID " + item.idProducto() + " ya no esta disponible.");
                }
                if (producto.getStock() < item.cantidad()) {
                    throw new IllegalStateException("Stock insuficiente para " + producto.getNombre()
                            + " (disponible: " + producto.getStock() + ").");
                }
                pedido.addDetallePedido(item.cantidad(), producto);
                producto.setStock(producto.getStock() - item.cantidad());
            }

            pedido.calcularTotal();
            usuario.addPedido(pedido);
            em.persist(pedido);

            tx.commit();
            return pedido;
        } catch (RuntimeException e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        } finally {
            em.close();
        }
    }
}