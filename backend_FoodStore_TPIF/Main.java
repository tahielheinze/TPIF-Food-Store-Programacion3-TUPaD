package com.tp.jpa;

import com.tp.jpa.model.*;
import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Scanner;

/**
 Clase principal: menu de consola del sistema Food Store.
 Orden de uso natural: Categorias -> Productos -> Usuarios -> Pedidos.
 **/

public class Main {

    private static final Scanner sc = new Scanner(System.in);

    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        boolean salir = false;
        while (!salir) {
            System.out.println();
            System.out.println("===== FOOD STORE - MENU PRINCIPAL =====");
            System.out.println("1. Gestionar Categorias");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Opcion: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1": menuCategorias(); break;
                case "2": menuProductos(); break;
                case "3": menuUsuarios(); break;
                case "4": menuPedidos(); break;
                case "5": menuReportes(); break;
                case "0": salir = true; break;
                default: System.out.println("Opcion invalida.");
            }
        }
        JPAUtil.close();
        System.out.println("Aplicacion finalizada.");
    }

    // ── Submenus Categorias ─────────────────────────────────────────────────

    private static void menuCategorias() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTION DE CATEGORIAS ---");
            System.out.println("1- Alta");
            System.out.println("2- Modificar");
            System.out.println("3- Baja Logica");
            System.out.println("4- Listado Completo");
            System.out.println("0- Volver");
            System.out.print("Opcion: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    System.out.print("Nombre de la categoria: ");
                    String nombre = sc.nextLine().trim();
                    System.out.print("Descripcion: ");
                    String desc = sc.nextLine().trim();
                    if(nombre.isEmpty()) { System.out.println("El nombre no puede estar vacio."); break; }

                    Categoria nueva = Categoria.builder().nombre(nombre).descripcion(desc).build();
                    categoriaRepo.guardar(nueva);
                    System.out.println("Categoria guardada con correctamente!");
                    break;
                case "2":
                    System.out.print("Ingrese ID de la categoria a modificar: ");
                    Long idMod = leerLong();
                    Optional<Categoria> catModOpt = categoriaRepo.buscarPorId(idMod);
                    if (catModOpt.isPresent() && !catModOpt.get().isEliminado()) {
                        Categoria catMod = catModOpt.get();
                        System.out.print("Nuevo Nombre [" + catMod.getNombre() + "]: ");
                        String nuevoNom = sc.nextLine().trim();
                        System.out.print("Nueva Descripcion [" + catMod.getDescripcion() + "]: ");
                        String nuevaDesc = sc.nextLine().trim();

                        if(!nuevoNom.isEmpty()) catMod.setNombre(nuevoNom);
                        if(!nuevaDesc.isEmpty()) catMod.setDescripcion(nuevaDesc);
                        categoriaRepo.guardar(catMod);
                        System.out.println("Categoria actualizada!");
                    } else {
                        System.out.println("Categoria no encontrada o eliminada.");
                    }
                    break;
                case "3":
                    System.out.print("Ingrese ID de la categoria para baja logica: ");
                    Long idElim = leerLong();
                    if(categoriaRepo.eliminarLogico(idElim)) {
                        System.out.println("Categoria dada de baja correctamente");
                    } else {
                        System.out.println("No se encontro la categoria con el ID provisto.");
                    }
                    break;
                case "4":
                    List<Categoria> activas = categoriaRepo.listarActivos();
                    if(activas.isEmpty()) { System.out.println("No hay ategorias activas cargadas."); }
                    else { activas.forEach(c -> System.out.println("ID: " + c.getId() + " | Nombre: " + c.getNombre() + " (" + c.getDescripcion() + ")")); }
                    break;
                case "0": volver = true; break;
                default: System.out.println("Opcion incorrecta.");
            }
        }
    }

    // ── Submenus Productos ─────────────────────────────────────────

    private static void menuProductos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTION DE PRODUCTOS ---");
            System.out.println("1- Alta (Asociando Categoria)");
            System.out.println("2- Modificar");
            System.out.println("3- Baja Logica");
            System.out.println("4- Listado General");
            System.out.println("0- Volver");
            System.out.print("Opcion: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    System.out.print("ID de Categoria a la que pertenece: ");
                    Long idCat = leerLong();
                    Optional<Categoria> catOpt = categoriaRepo.buscarPorId(idCat);
                    if(catOpt.isEmpty() || catOpt.get().isEliminado()) {
                        System.out.println("La categoria no existe o esta dada de baja.");
                        break;
                    }
                    System.out.print("Nombre del Producto: ");
                    String nombre = sc.nextLine().trim();
                    System.out.print("Precio: ");
                    Double precio = leerDouble();
                    System.out.print("Descripcion: ");
                    String desc = sc.nextLine().trim();
                    System.out.print("Stock Inicial: ");
                    Integer stock = leerInt();

                    Producto nuevoProd = Producto.builder()
                            .nombre(nombre).precio(precio).descripcion(desc)
                            .stock(stock).disponible(true).build();
                    Categoria categoria = catOpt.get();
                    categoria.addProducto(nuevoProd);
                    categoriaRepo.guardar(categoria);
                    System.out.println("Producto cargado con exito en '" + categoria.getNombre() + "'!");
                    break;
                case "2":
                    System.out.print("ID del Producto a modificar: ");
                    Long idProdMod = leerLong();
                    Optional<Producto> prodOpt = productoRepo.buscarPorId(idProdMod);
                    if(prodOpt.isPresent() && !prodOpt.get().isEliminado()) {
                        Producto p = prodOpt.get();
                        System.out.print("Nuevo Nombre [" + p.getNombre() + "]: ");
                        String nNom = sc.nextLine().trim();
                        System.out.print("Nuevo Precio [" + p.getPrecio() + "]: ");
                        String nPreStr = sc.nextLine().trim();
                        System.out.print("Nuevo Stock [" + p.getStock() + "]: ");
                        String nStkStr = sc.nextLine().trim();

                        if(!nNom.isEmpty()) p.setNombre(nNom);
                        if(!nPreStr.isEmpty()) p.setPrecio(Double.parseDouble(nPreStr));
                        if(!nStkStr.isEmpty()) p.setStock(Integer.parseInt(nStkStr));

                        productoRepo.guardar(p);
                        System.out.println("Producto actualizado correctamente.");
                    } else {
                        System.out.println("Producto no existente o inactivo.");
                    }
                    break;
                case "3":
                    System.out.print("ID del Producto para baja logica: ");
                    Long idProdElim = leerLong();
                    if(productoRepo.eliminarLogico(idProdElim)) {
                        System.out.println("Producto dado de baja correctamente.");
                    } else {
                        System.out.println("No se encontro el producto.");
                    }
                    break;
                case "4":
                    List<Producto> prods = productoRepo.listarActivos();
                    if(prods.isEmpty()) System.out.println("No hay productos activos.");
                    else prods.forEach(p -> System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock()));
                    break;
                case "0": volver = true; break;
                default: System.out.println("Opcion incorrecta.");
            }
        }
    }

    // ── Subemnus Usuarios ──────────────────────────────────────────

    private static void menuUsuarios() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTION DE USUARIOS ---");
            System.out.println("1- Alta (Email Unico)");
            System.out.println("2- Modificar");
            System.out.println("3- Baja Logica");
            System.out.println("4- Listado");
            System.out.println("5- Buscar por Email");
            System.out.println("0- Volver");
            System.out.print("Opcion: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    System.out.print("Mail: ");
                    String mail = sc.nextLine().trim();
                    if(usuarioRepo.buscarPorMail(mail).isPresent()) {
                        System.out.println("ERROR - Ya existe un usuario activo registrado con ese mail.");
                        break;
                    }
                    System.out.print("Nombre: ");
                    String nom = sc.nextLine().trim();
                    System.out.print("Apellido: ");
                    String ape = sc.nextLine().trim();
                    System.out.print("Celular: ");
                    String cel = sc.nextLine().trim();
                    System.out.print("Contraseña: ");
                    String pass = sc.nextLine().trim();
                    System.out.print("Rol (1- ADMIN, 2- USUARIO): ");
                    Rol rol = sc.nextLine().trim().equals("1") ? Rol.ADMIN : Rol.USUARIO;

                    Usuario nuevoU = Usuario.builder()
                            .mail(mail).nombre(nom).apellido(ape)
                            .celular(cel).contraseña(pass).rol(rol).build();
                    usuarioRepo.guardar(nuevoU);
                    System.out.println("Usuario registrado correctamente!");
                    break;
                case "2":
                    System.out.print("ID del Usuario a modificar: ");
                    Long idU = leerLong();
                    Optional<Usuario> uOpt = usuarioRepo.buscarPorId(idU);
                    if(uOpt.isPresent() && !uOpt.get().isEliminado()) {
                        Usuario u = uOpt.get();
                        System.out.print("Nuevo Nombre [" + u.getNombre() + "]: ");
                        String nN = sc.nextLine().trim();
                        System.out.print("Nuevo Apellido [" + u.getApellido() + "]: ");
                        String nA = sc.nextLine().trim();
                        if(!nN.isEmpty()) u.setNombre(nN);
                        if(!nA.isEmpty()) u.setApellido(nA);
                        usuarioRepo.guardar(u);
                        System.out.println("Usuario actualizado.");
                    } else { System.out.println("Usuario no encontrado."); }
                    break;
                case "3":
                    System.out.print("ID del Usuario para baja: ");
                    Long idUElim = leerLong();
                    if(usuarioRepo.eliminarLogico(idUElim)) System.out.println("Usuario dado de baja.");
                    else System.out.println("No se encontro el usuario.");
                    break;
                case "4":
                    usuarioRepo.listarActivos().forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getMail() + " | " + u.getNombre() + " " + u.getApellido() + " [" + u.getRol() + "]"));
                    break;
                case "5":
                    System.out.print("Ingrese el email a buscar: ");
                    String mailBuscar = sc.nextLine().trim();
                    Optional<Usuario> busqueda = usuarioRepo.buscarPorMail(mailBuscar);
                    if(busqueda.isPresent()) {
                        Usuario u = busqueda.get();
                        System.out.println("Encontrado -> ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido() + " | Rol: " + u.getRol());
                    } else { System.out.println("No existe ningun usuario activo con ese mail."); }
                    break;
                case "0": volver = true; break;
                default: System.out.println("Opcion incorrecta.");
            }
        }
    }

    // ── Submenus pedidos ────────────────────

    private static void menuPedidos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTION DE PEDIDOS ---");
            System.out.println("1- Alta de Pedido (Carrito Transaccional)");
            System.out.println("2- Cambiar Estado");
            System.out.println("3- Baja Logica");
            System.out.println("4- Listado General");
            System.out.println("5- Filtrar por Usuario");
            System.out.println("6- Filtrar por Estado");
            System.out.println("0- Volver");
            System.out.print("Opcion: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1":
                    System.out.print("ID del Usuario que realiza el pedido: ");
                    Long idU = leerLong();
                    Optional<Usuario> uOpt = usuarioRepo.buscarPorId(idU);
                    if(uOpt.isEmpty() || uOpt.get().isEliminado()) {
                        System.out.println("El usuario no existe o esta inactivo.");
                        break;
                    }
                    Usuario usuario = uOpt.get();

                    System.out.println("Forma de pago (1- TARJETA, 2- TRANSFERENCIA, 3- EFECTIVO): ");
                    String fpOp = sc.nextLine().trim();
                    FormaPago fp = FormaPago.EFECTIVO;
                    if(fpOp.equals("1")) fp = FormaPago.TARJETA;
                    else if(fpOp.equals("2")) fp = FormaPago.TRANSFERENCIA;

                    // Instanciamos el Pedido vacio que ira acumulando detalles
                    Pedido nuevoPedido = Pedido.builder()
                            .fecha(LocalDate.now())
                            .estado(EstadoPedido.PENDIENTE)
                            .formaPago(fp)
                            .build();

                    boolean agregando = true;
                    while(agregando) {
                        System.out.print("ID del Producto a agregar: ");
                        Long idP = leerLong();
                        Optional<Producto> pOpt = productoRepo.buscarPorId(idP);
                        if(pOpt.isEmpty() || pOpt.get().isEliminado() || !pOpt.get().getDisponible()) {
                            System.out.println("Producto no disponible.");
                        } else {
                            Producto producto = pOpt.get();
                            System.out.print("Cantidad (" + producto.getNombre() + " - Stock actual: " + producto.getStock() + "): ");
                            int cant = leerInt();

                            if(cant <= 0) {
                                System.out.println("La cantidad debe ser mayor a 0.");
                            } else if(cant > producto.getStock()) {
                                System.out.println("Stock insuficiente. No se puede agregar al pedido.");
                            } else {
                                // Restamos stock en memoria temporalmente
                                producto.setStock(producto.getStock() - cant);
                                productoRepo.guardar(producto); // persiste rebaja de stock

                                // Agrega la linea al set de detalles recalculando el total acumulado
                                nuevoPedido.addDetallePedido(cant, producto);
                                System.out.println("Linea añadida al pedido con exito!");
                            }
                        }
                        System.out.print("¿Desea agregar otro producto al pedido? (S/N): ");
                        if(!sc.nextLine().trim().equalsIgnoreCase("s")) {
                            agregando = false;
                        }
                    }

                    if(nuevoPedido.getDetalles().isEmpty()) {
                        System.out.println("Pedido cancelado: No se agregaron items.");
                    } else {
                        // Se agrega el pedido al dueño de la relacion que es el usuario.
                        usuario.addPedido(nuevoPedido);
                        usuarioRepo.guardar(usuario);
                        System.out.println("Pedido numero registrado con exito a nombre de " + usuario.getNombre() + "! Total: $" + nuevoPedido.getTotal());
                    }
                    break;
                case "2":
                    System.out.print("ID del Pedido a cambiar de estado: ");
                    Long idPEst = leerLong();
                    Optional<Pedido> pEstOpt = pedidoRepo.buscarPorId(idPEst);
                    if(pEstOpt.isPresent() && !pEstOpt.get().isEliminado()) {
                        Pedido ped = pEstOpt.get();
                        System.out.println("Estado Actual: " + ped.getEstado());
                        System.out.println("Seleccione nuevo estado (1-PENDIENTE, 2-CONFIRMADO, 3-TERMINADO, 4-CANCELADO): ");
                        String nest = sc.nextLine().trim();
                        switch(nest) {
                            case "1": ped.setEstado(EstadoPedido.PENDIENTE); break;
                            case "2": ped.setEstado(EstadoPedido.CONFIRMADO); break;
                            case "3": ped.setEstado(EstadoPedido.TERMINADO); break;
                            case "4": ped.setEstado(EstadoPedido.CANCELADO); break;
                            default: System.out.println("Opcion no valida."); continue;
                        }
                        pedidoRepo.guardar(ped);
                        System.out.println("Estado actualizado.");
                    } else { System.out.println("Pedido no encontrado."); }
                    break;
                case "3":
                    System.out.print("ID del Pedido para baja logica: ");
                    Long idPElim = leerLong();
                    if(pedidoRepo.eliminarLogico(idPElim)) System.out.println("Pedido dado de baja logica.");
                    else System.out.println("No se encontro el pedido.");
                    break;
                case "4":
                    pedidoRepo.listarActivos().forEach(p -> System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Total: $" + p.getTotal() + " | Estado: " + p.getEstado()));
                    break;
                case "5":
                    System.out.print("ID del Usuario a consultar sus pedidos: ");
                    Long idUBuscar = leerLong();
                    List<Pedido> pPorU = usuarioRepo.buscarPedidosPorUsuario(idUBuscar);
                    if(pPorU.isEmpty()) System.out.println("El usuario no registra pedidos activos.");
                    else pPorU.forEach(p -> System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Total: $" + p.getTotal() + " | Estado: " + p.getEstado()));
                    break;
                case "6":
                    System.out.println("Seleccione estado (1-PENDIENTE, 2-CONFIRMADO, 3-TERMINADO, 4-CANCELADO): ");
                    String estSel = sc.nextLine().trim();
                    EstadoPedido ep = EstadoPedido.PENDIENTE;
                    if(estSel.equals("2")) ep = EstadoPedido.CONFIRMADO;
                    else if(estSel.equals("3")) ep = EstadoPedido.TERMINADO;
                    else if(estSel.equals("4")) ep = EstadoPedido.CANCELADO;

                    pedidoRepo.buscarPorEstado(ep).forEach(p -> System.out.println("ID: " + p.getId() + " | Total: $" + p.getTotal() + " | Pago: " + p.getFormaPago()));
                    break;
                case "0": volver = true; break;
                default: System.out.println("Opcion incorrecta.");
            }
        }
    }

    // ── Submenus Reportes ────────────────────────────────

    private static void menuReportes() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- REPORTES ---");
            System.out.println("1- Productos por Categoria");
            System.out.println("2- Pedidos por Usuario");
            System.out.println("3- Pedidos por Estado");
            System.out.println("4- Total Facturado (Pedidos Terminados)");
            System.out.println("0- Volver");
            System.out.print("Opcion: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1": reporteProductosPorCategoria(); break;
                case "2": reportePedidosPorUsuario(); break;
                case "3": reportePedidosPorEstado(); break;
                case "4": reporteTotalFacturado(); break;
                case "0": volver = true; break;
                default: System.out.println("Opcion incorrecta.");
            }
        }
    }

    private static void reporteProductosPorCategoria() {
        List<Categoria> activas = categoriaRepo.listarActivos();
        if (activas.isEmpty()) {
            System.out.println("No hay categorias activas cargadas.");
            return;
        }
        System.out.println("\n-- Categorias disponibles --");
        activas.forEach(c -> System.out.println("ID: " + c.getId() + " | " + c.getNombre()));
        System.out.print("ID de la categoria a consultar: ");
        Long idCat = leerLong();

        boolean existe = activas.stream().anyMatch(c -> c.getId().equals(idCat));
        if (!existe) {
            System.out.println("La categoria indicada no existe o esta dada de baja.");
            return;
        }

        List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(idCat);
        if (productos.isEmpty()) {
            System.out.println("La categoria no tiene productos activos.");
        } else {
            System.out.println("\n-- Productos de la categoria --");
            productos.forEach(p -> System.out.println(
                    "ID: " + p.getId() + " | " + p.getNombre() +
                            " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock()));
        }
    }

    private static void reportePedidosPorUsuario() {
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos cargados.");
            return;
        }
        System.out.println("\n-- Usuarios disponibles --");
        usuarios.forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido() + " (" + u.getMail() + ")"));
        System.out.print("ID del usuario a consultar: ");
        Long idUsuario = leerLong();

        boolean existe = usuarios.stream().anyMatch(u -> u.getId().equals(idUsuario));
        if (!existe) {
            System.out.println("El usuario indicado no existe o esta dado de baja.");
            return;
        }

        List<Pedido> pedidos = usuarioRepo.buscarPedidosPorUsuario(idUsuario);
        if (pedidos.isEmpty()) {
            System.out.println("El usuario no registra pedidos activos.");
        } else {
            System.out.println("\n-- Pedidos del usuario --");
            pedidos.forEach(p -> System.out.println(
                    "ID: " + p.getId() + " | Fecha: " + p.getFecha() +
                            " | Estado: " + p.getEstado() + " | Pago: " + p.getFormaPago() +
                            " | Total: $" + p.getTotal()));
        }
    }

    private static void reportePedidosPorEstado() {
        System.out.println("Seleccione estado (1-PENDIENTE, 2-CONFIRMADO, 3-TERMINADO, 4-CANCELADO): ");
        String estSel = sc.nextLine().trim();
        EstadoPedido estado;
        switch (estSel) {
            case "1": estado = EstadoPedido.PENDIENTE; break;
            case "2": estado = EstadoPedido.CONFIRMADO; break;
            case "3": estado = EstadoPedido.TERMINADO; break;
            case "4": estado = EstadoPedido.CANCELADO; break;
            default:
                System.out.println("Opcion invalida.");
                return;
        }

        List<Pedido> pedidos = pedidoRepo.buscarPorEstado(estado);
        if (pedidos.isEmpty()) {
            System.out.println("No hay pedidos con estado " + estado + ".");
            return;
        }

        System.out.println("\n-- Pedidos en estado " + estado + " --");
        for (Pedido p : pedidos) {
            // Pedido no conoce a su Usuario (relacion unidireccional), por lo
            // que se resuelve el nombre navegando desde Usuario con la
            // consulta auxiliar buscarUsuarioPorPedido.
            String nombreUsuario = usuarioRepo.buscarUsuarioPorPedido(p.getId())
                    .map(u -> u.getNombre() + " " + u.getApellido())
                    .orElse("(usuario no disponible)");
            System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() +
                    " | Usuario: " + nombreUsuario + " | Total: $" + p.getTotal());
        }
    }

    private static void reporteTotalFacturado() {
        List<Pedido> terminados = pedidoRepo.buscarPorEstado(EstadoPedido.TERMINADO);
        double total = terminados.stream()
                .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                .sum();
        if (terminados.isEmpty()) {
            System.out.println("No hay pedidos terminados. Total facturado: $0.00");
        } else {
            System.out.println(String.format(Locale.US, "Total facturado: $%.2f", total));
        }
    }

    private static Long leerLong() {
        try { return Long.parseLong(sc.nextLine().trim()); }
        catch (Exception e) { return 0L; }
    }
    private static Integer leerInt() {
        try { return Integer.parseInt(sc.nextLine().trim()); }
        catch (Exception e) { return 0; }
    }
    private static Double leerDouble() {
        try { return Double.parseDouble(sc.nextLine().trim()); }
        catch (Exception e) { return 0.0; }
    }
}