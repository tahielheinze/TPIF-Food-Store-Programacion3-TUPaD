package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;


public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    /* Retorna el usuario activo con el mail indicado. */

    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";
            List<Usuario> resultados = em.createQuery(jpql, Usuario.class)
                    .setParameter("mail", mail)
                    .getResultList();
            return resultados.stream().findFirst();
        } finally {
            em.close();
        }
    }

    /* Retorna los pedidos activos del usuario indicado. */
    public List<Pedido> buscarPedidosPorUsuario(Long idUsuario) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Usuario u JOIN u.pedidos p " +
                    "WHERE u.id = :idUsuario AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("idUsuario", idUsuario)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    /* Retorna el usuario activo dueño del pedido indicado (navega u.pedidos). */
    public Optional<Usuario> buscarUsuarioPorPedido(Long idPedido) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT u FROM Usuario u JOIN u.pedidos p " +
                    "WHERE p.id = :idPedido AND u.eliminado = false";
            TypedQuery<Usuario> q = em.createQuery(jpql, Usuario.class);
            q.setParameter("idPedido", idPedido);
            List<Usuario> resultados = q.getResultList();
            return resultados.stream().findFirst();
        } finally {
            em.close();
        }
    }
}