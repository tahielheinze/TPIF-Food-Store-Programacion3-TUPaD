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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Scanner;

public class Main {

    private static final Scanner sc = new Scanner(System.in);
    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        boolean salir = false;
        while (!salir) {
            System.out.println("\n===== FOOD STORE - MENU PRINCIPAL =====");
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
                /** 1) HU-05 - Dar de alta una categoria **/
                case "1":
                    System.out.print("Nombre de la categoria: ");
                    String nombre = sc.nextLine().trim();
                    System.out.print("Descripcion: ");
                    String desc = sc.nextLine().trim();
                    if(nombre.isEmpty()) { System.out.println("El nombre no puede estar vacio."); break; }

                    Categoria nueva = Categoria.builder().nombre(nombre).descripcion(desc).build();
                    Categoria categoriaGuardada = categoriaRepo.guardar(nueva);
                    System.out.println("Categoria guardada correctamente! ID generado: " + categoriaGuardada.getId());
                    break;
                /** 2) HU-06 - Modificar una categoria existente **/
                case "2": {
                    List<Categoria> categoriasParaModificar = categoriaRepo.listarActivos();
                    if (categoriasParaModificar.isEmpty()) {
                        System.out.println("No hay categorias activas cargadas.");
                        break;
                    }
                    System.out.println("\n-- Categorias activas --");
                    categoriasParaModificar.forEach(c -> System.out.println("ID: " + c.getId() + " | " + c.getNombre()));

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
                }
                /** 3) HU-07 - Dar de baja una categoria **/
                case "3": {
                    System.out.print("Ingrese ID de la categoria para baja logica: ");
                    Long idElim = leerLong();
                    Optional<Categoria> catElimOpt = categoriaRepo.buscarPorId(idElim);
                    if(categoriaRepo.eliminarLogico(idElim)) {
                        String nombreCatElim = catElimOpt.map(Categoria::getNombre).orElse("(sin nombre)");
                        System.out.println("Categoria '" + nombreCatElim + "' dada de baja correctamente.");
                    } else {
                        System.out.println("No se encontro la categoria con el ID provisto.");
                    }
                    break;
                }
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
                /** 4) HU-09 - Dar de alta un producto **/
                case "1": {
                    List<Categoria> categoriasParaProducto = categoriaRepo.listarActivos();
                    if (categoriasParaProducto.isEmpty()) {
                        System.out.println("No hay categorias activas. No se puede cargar un producto.");
                        break;
                    }
                    System.out.println("\n-- Categorias disponibles --");
                    categoriasParaProducto.forEach(c -> System.out.println("ID: " + c.getId() + " | " + c.getNombre()));

                    System.out.print("ID de Categoria a la que pertenece: ");
                    Long idCat = leerLong();
                    Optional<Categoria> catOpt = categoriaRepo.buscarPorId(idCat);
                    if(catOpt.isEmpty() || catOpt.get().isEliminado()) {
                        System.out.println("La categoria no existe o esta dada de baja.");
                        break;
                    }
                    String nombreCategoria = catOpt.get().getNombre();
                    System.out.print("Nombre del Producto: ");
                    String nombre = sc.nextLine().trim();
                    if (nombre.isEmpty()) {
                        System.out.println("El nombre no puede estar vacio.");
                        break;
                    }
                    System.out.print("Descripcion: ");
                    String desc = sc.nextLine().trim();
                    System.out.print("Precio: ");
                    Double precio = leerDouble();
                    System.out.print("Stock Inicial: ");
                    Integer stock = leerInt();
                    System.out.print("URL de Imagen (opcional): ");
                    String imagen = sc.nextLine().trim();
                    System.out.print("¿Disponible? (S/N) [S]: ");
                    String dispOp = sc.nextLine().trim();
                    boolean disponible = dispOp.isEmpty() || dispOp.equalsIgnoreCase("s");

                    if (precio == null || precio <= 0) {
                        System.out.println("El precio debe ser mayor a 0. No se persiste el producto.");
                        break;
                    }
                    if (stock == null || stock < 0) {
                        System.out.println("El stock no puede ser negativo. No se persiste el producto.");
                        break;
                    }

                    Producto nuevoProd = Producto.builder()
                            .nombre(nombre).precio(precio).descripcion(desc)
                            .stock(stock).imagen(imagen.isEmpty() ? null : imagen)
                            .disponible(disponible).build();

                    // altaProductoEnCategoria busca la Categoria y agrega el Producto
                    // dentro de UNA UNICA transaccion con el mismo EntityManager,
                    // evitando el LazyInitializationException que ocurriria si
                    // se intentara agregar a la coleccion despues de cerrar la sesion.
                    Producto productoGuardado;
                    try {
                        productoGuardado = categoriaRepo.altaProductoEnCategoria(idCat, nuevoProd);
                    } catch (IllegalStateException ex) {
                        System.out.println("No se pudo cargar el producto: " + ex.getMessage());
                        break;
                    }

                    System.out.println("Producto cargado con exito en '" + nombreCategoria
                            + "'! ID generado: " + productoGuardado.getId());
                    break;
                }
                case "2": {
                    List<Producto> prodsActivos = productoRepo.listarActivos();
                    if (prodsActivos.isEmpty()) {
                        System.out.println("No hay productos activos para modificar.");
                        break;
                    }
                    System.out.println("\n-- Productos activos --");
                    prodsActivos.forEach(p -> System.out.println("ID: " + p.getId() + " | " + p.getNombre()
                            + " | $" + p.getPrecio() + " | Stock: " + p.getStock()));

                    System.out.print("ID del Producto a modificar: ");
                    Long idProdMod = leerLong();
                    Optional<Producto> prodOpt = productoRepo.buscarPorId(idProdMod);
                    if (prodOpt.isEmpty() || prodOpt.get().isEliminado()) {
                        System.out.println("Producto no existente o inactivo.");
                        break;
                    }

                    Producto p = prodOpt.get();
                    System.out.print("Nuevo Nombre [" + p.getNombre() + "]: ");
                    String nNom = sc.nextLine().trim();
                    System.out.print("Nuevo Precio [" + p.getPrecio() + "]: ");
                    String nPreStr = sc.nextLine().trim();
                    System.out.print("Nuevo Stock [" + p.getStock() + "]: ");
                    String nStkStr = sc.nextLine().trim();

                    if (!nNom.isEmpty()) p.setNombre(nNom);

                    if (!nPreStr.isEmpty()) {
                        try {
                            double nuevoPrecio = Double.parseDouble(nPreStr);
                            if (nuevoPrecio <= 0) {
                                System.out.println("Precio invalido (debe ser > 0). Se conserva el valor anterior.");
                            } else {
                                p.setPrecio(nuevoPrecio);
                            }
                        } catch (NumberFormatException e) {
                            System.out.println("Precio invalido. Se conserva el valor anterior.");
                        }
                    }

                    if (!nStkStr.isEmpty()) {
                        try {
                            int nuevoStock = Integer.parseInt(nStkStr);
                            if (nuevoStock < 0) {
                                System.out.println("Stock invalido (no puede ser negativo). Se conserva el valor anterior.");
                            } else {
                                p.setStock(nuevoStock);
                            }
                        } catch (NumberFormatException e) {
                            System.out.println("Stock invalido. Se conserva el valor anterior.");
                        }
                    }

                    productoRepo.guardar(p);
                    System.out.println("Producto actualizado correctamente.");
                    break;
                }
                case "3": {
                    System.out.print("ID del Producto para baja logica: ");
                    Long idProdElim = leerLong();
                    Optional<Producto> prodElimOpt = productoRepo.buscarPorId(idProdElim);
                    if (prodElimOpt.isEmpty() || prodElimOpt.get().isEliminado()) {
                        System.out.println("No se encontro el producto, o ya esta dado de baja.");
                        break;
                    }
                    String nombreAfectado = prodElimOpt.get().getNombre();
                    if (productoRepo.eliminarLogico(idProdElim)) {
                        System.out.println("Producto \"" + nombreAfectado + "\" (ID " + idProdElim + ") dado de baja correctamente.");
                    } else {
                        System.out.println("No se pudo dar de baja el producto.");
                    }
                    break;
                }
                case "4": {
                    List<Producto> prods = productoRepo.listarActivos();
                    if (prods.isEmpty()) {
                        System.out.println("No hay productos activos.");
                    } else {
                        prods.forEach(p -> System.out.println("ID: " + p.getId() + " | " + p.getNombre()
                                + " | $" + p.getPrecio() + " | Stock: " + p.getStock()
                                + " | Disponible: " + (Boolean.TRUE.equals(p.getDisponible()) ? "Si" : "No")
                                + " | Categoria: " + obtenerNombreCategoriaDeProducto(p.getId())));
                    }
                    break;
                }
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
                case "1": {
                    System.out.print("Mail: ");
                    String mail = sc.nextLine().trim();
                    if (usuarioRepo.buscarPorMail(mail).isPresent()) {
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
                    Usuario guardado = usuarioRepo.guardar(nuevoU);
                    System.out.println("Usuario registrado correctamente! ID generado: " + guardado.getId());
                    break;
                }
                case "2": {
                    List<Usuario> usuariosActivos = usuarioRepo.listarActivos();
                    if (usuariosActivos.isEmpty()) {
                        System.out.println("No hay usuarios activos cargados.");
                        break;
                    }
                    System.out.println("\n-- Usuarios activos --");
                    usuariosActivos.forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido() + " | " + u.getMail()));

                    System.out.print("ID del Usuario a modificar: ");
                    Long idU = leerLong();
                    Optional<Usuario> uOpt = usuarioRepo.buscarPorId(idU);
                    if(uOpt.isEmpty() || uOpt.get().isEliminado()) {
                        System.out.println("Usuario no encontrado o dado de baja.");
                        break;
                    }
                    Usuario u = uOpt.get();

                    System.out.print("Nuevo Nombre [" + u.getNombre() + "]: ");
                    String nN = sc.nextLine().trim();
                    System.out.print("Nuevo Apellido [" + u.getApellido() + "]: ");
                    String nA = sc.nextLine().trim();
                    System.out.print("Nuevo Mail [" + u.getMail() + "]: ");
                    String nMail = sc.nextLine().trim();
                    System.out.print("Nuevo Celular [" + u.getCelular() + "]: ");
                    String nCel = sc.nextLine().trim();
                    System.out.print("Nueva Contraseña [sin cambios]: ");
                    String nPass = sc.nextLine().trim();

                    // Si se ingresa un mail nuevo y distinto al actual, validar que
                    // no este en uso por otro usuario activo antes de aplicar ningun cambio.
                    if (!nMail.isEmpty() && !nMail.equalsIgnoreCase(u.getMail())) {
                        Optional<Usuario> existente = usuarioRepo.buscarPorMail(nMail);
                        if (existente.isPresent() && !existente.get().getId().equals(u.getId())) {
                            System.out.println("ERROR - Ya existe otro usuario activo con ese mail. No se modifico el usuario.");
                            break;
                        }
                        u.setMail(nMail);
                    }

                    if(!nN.isEmpty()) u.setNombre(nN);
                    if(!nA.isEmpty()) u.setApellido(nA);
                    if(!nCel.isEmpty()) u.setCelular(nCel);
                    if(!nPass.isEmpty()) u.setContraseña(nPass);

                    usuarioRepo.guardar(u);
                    System.out.println("Usuario actualizado.");
                    break;
                }
                case "3": {
                    System.out.print("ID del Usuario para baja: ");
                    Long idUElim = leerLong();
                    Optional<Usuario> uElimOpt = usuarioRepo.buscarPorId(idUElim);
                    if (uElimOpt.isEmpty() || uElimOpt.get().isEliminado()) {
                        System.out.println("No se encontro el usuario, o ya esta dado de baja.");
                        break;
                    }
                    String nombreCompleto = uElimOpt.get().getNombre() + " " + uElimOpt.get().getApellido();
                    if (usuarioRepo.eliminarLogico(idUElim)) {
                        System.out.println("Usuario \"" + nombreCompleto + "\" (ID " + idUElim + ") dado de baja. Sus pedidos permanecen en el sistema.");
                    } else {
                        System.out.println("No se pudo dar de baja el usuario.");
                    }
                    break;
                }
                case "4":
                    usuarioRepo.listarActivos().forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getMail() + " | " + u.getNombre() + " " + u.getApellido() + " [" + u.getRol() + "]"));
                    break;
                case "5": {
                    System.out.print("Ingrese el email a buscar: ");
                    String mailBuscar = sc.nextLine().trim();
                    Optional<Usuario> busqueda = usuarioRepo.buscarPorMail(mailBuscar);
                    if (busqueda.isPresent()) {
                        Usuario u = busqueda.get();
                        System.out.println("Encontrado -> ID: " + u.getId()
                                + " | " + u.getNombre() + " " + u.getApellido()
                                + " | Mail: " + u.getMail()
                                + " | Celular: " + u.getCelular()
                                + " | Rol: " + u.getRol());
                    } else {
                        System.out.println("No existe ningun usuario activo con ese mail.");
                    }
                    break;
                }
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
                case "1": {
                    List<Usuario> usuariosActivos = usuarioRepo.listarActivos();
                    if (usuariosActivos.isEmpty()) {
                        System.out.println("No hay usuarios activos. No se puede generar un pedido.");
                        break;
                    }
                    System.out.println("\n-- Usuarios disponibles --");
                    usuariosActivos.forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido()));
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

                    // Lista TEMPORAL en memoria: solo (idProducto, cantidad).
                    // Aca NO se persiste ni se descuenta stock todavia; eso
                    // ocurre recien dentro de la transaccion atomica al confirmar.
                    List<PedidoRepository.ItemPedido> itemsTemp = new ArrayList<>();
                    Map<Long, Integer> reservadoEnSesion = new HashMap<>();

                    boolean agregando = true;
                    while(agregando) {
                        List<Producto> catalogo = productoRepo.listarActivos();
                        System.out.println("\n-- Catalogo de productos activos --");
                        catalogo.forEach(p -> System.out.println(
                                "ID: " + p.getId() + " | " + p.getNombre() +
                                        " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock() +
                                        " | Disponible: " + p.getDisponible()));

                        System.out.print("ID del Producto a agregar: ");
                        Long idP = leerLong();
                        Optional<Producto> pOpt = productoRepo.buscarPorId(idP);
                        if(pOpt.isEmpty() || pOpt.get().isEliminado() || !Boolean.TRUE.equals(pOpt.get().getDisponible())) {
                            System.out.println("Producto no disponible.");
                        } else {
                            Producto producto = pOpt.get();
                            int yaReservado = reservadoEnSesion.getOrDefault(producto.getId(), 0);
                            int stockRestante = producto.getStock() - yaReservado;

                            System.out.print("Cantidad (" + producto.getNombre() + " - Stock disponible: " + stockRestante + "): ");
                            int cant = leerInt();

                            if(cant <= 0) {
                                System.out.println("La cantidad debe ser mayor a 0.");
                            } else if(cant > stockRestante) {
                                System.out.println("Stock insuficiente. Disponible: " + stockRestante);
                            } else {
                                itemsTemp.add(new PedidoRepository.ItemPedido(producto.getId(), cant));
                                reservadoEnSesion.merge(producto.getId(), cant, Integer::sum);
                                System.out.println("Linea añadida al pedido (pendiente de confirmar).");
                            }
                        }
                        System.out.print("¿Desea agregar otro producto al pedido? (S/N): ");
                        if(!sc.nextLine().trim().equalsIgnoreCase("s")) {
                            agregando = false;
                        }
                    }

                    if(itemsTemp.isEmpty()) {
                        System.out.println("Pedido cancelado: No se agregaron items.");
                        break;
                    }

                    // Unica transaccion atomica: si algo falla se hace rollback completo y no se persiste nada.
                    try {
                        Pedido pedidoCreado = pedidoRepo.altaPedidoTransaccional(idU, fp, itemsTemp);
                        System.out.println("\nPedido registrado con exito!");
                        System.out.println("ID: " + pedidoCreado.getId() + " | Fecha: " + pedidoCreado.getFecha() +
                                " | Usuario: " + usuario.getNombre() + " " + usuario.getApellido() +
                                " | Forma de pago: " + pedidoCreado.getFormaPago());
                        pedidoCreado.getDetalles().forEach(d -> System.out.println(
                                "  - " + d.getProducto().getNombre() + " x" + d.getCantidad() + " = $" + d.getSubtotal()));
                        System.out.println("Total: $" + pedidoCreado.getTotal());
                    } catch (IllegalStateException ex) {
                        System.out.println("No se pudo registrar el pedido: " + ex.getMessage());
                        System.out.println("No se modifico ningun dato (rollback completo).");
                    }
                    break;
                }
                case "2": {
                    System.out.print("ID del Pedido a cambiar de estado: ");
                    Long idPEst = leerLong();
                    Optional<Pedido> pEstOpt = pedidoRepo.buscarPorId(idPEst);
                    if (pEstOpt.isEmpty() || pEstOpt.get().isEliminado()) {
                        System.out.println("Pedido no encontrado.");
                        break;
                    }
                    Pedido ped = pEstOpt.get();
                    System.out.println("Estado Actual: " + ped.getEstado());
                    System.out.print("Seleccione nuevo estado (1-PENDIENTE, 2-CONFIRMADO, 3-TERMINADO, 4-CANCELADO): ");
                    String nest = sc.nextLine().trim();
                    EstadoPedido nuevoEstado;
                    switch (nest) {
                        case "1": nuevoEstado = EstadoPedido.PENDIENTE; break;
                        case "2": nuevoEstado = EstadoPedido.CONFIRMADO; break;
                        case "3": nuevoEstado = EstadoPedido.TERMINADO; break;
                        case "4": nuevoEstado = EstadoPedido.CANCELADO; break;
                        default:
                            System.out.println("Opcion no valida.");
                            continue;
                    }
                    ped.setEstado(nuevoEstado);
                    pedidoRepo.guardar(ped);
                    System.out.println("Pedido #" + ped.getId() + " actualizado. Nuevo estado: " + nuevoEstado);
                    break;
                }
                case "3": {
                    System.out.print("ID del Pedido para baja logica: ");
                    Long idPElim = leerLong();
                    Optional<Pedido> pElimOpt = pedidoRepo.buscarPorId(idPElim);
                    if (pElimOpt.isEmpty() || pElimOpt.get().isEliminado()) {
                        System.out.println("No se encontro el pedido, o ya esta dado de baja.");
                        break;
                    }
                    Double totalAfectado = pElimOpt.get().getTotal();
                    if (pedidoRepo.eliminarLogico(idPElim)) {
                        System.out.println("Pedido #" + idPElim + " (Total: $" + totalAfectado + ") dado de baja. El stock NO se restaura.");
                    } else {
                        System.out.println("No se pudo dar de baja el pedido.");
                    }
                    break;
                }
                case "4": {
                    List<Pedido> todos = pedidoRepo.listarActivos();
                    if (todos.isEmpty()) {
                        System.out.println("No hay pedidos activos.");
                    } else {
                        todos.forEach(p -> System.out.println("ID: " + p.getId()
                                + " | Fecha: " + p.getFecha()
                                + " | Estado: " + p.getEstado()
                                + " | Pago: " + p.getFormaPago()
                                + " | Usuario: " + usuarioRepo.buscarUsuarioPorPedido(p.getId())
                                .map(u -> u.getNombre() + " " + u.getApellido()).orElse("(desconocido)")
                                + " | Total: $" + p.getTotal()));
                    }
                    break;
                }
                case "5": {
                    List<Usuario> usuariosParaFiltro = usuarioRepo.listarActivos();
                    if (usuariosParaFiltro.isEmpty()) {
                        System.out.println("No hay usuarios activos.");
                        break;
                    }
                    usuariosParaFiltro.forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido()));
                    System.out.print("ID del Usuario a consultar sus pedidos: ");
                    Long idUBuscar = leerLong();
                    List<Pedido> pPorU = usuarioRepo.buscarPedidosPorUsuario(idUBuscar);
                    if (pPorU.isEmpty()) {
                        System.out.println("El usuario no registra pedidos activos.");
                    } else {
                        pPorU.forEach(p -> System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha()
                                + " | Estado: " + p.getEstado() + " | Pago: " + p.getFormaPago() + " | Total: $" + p.getTotal()));
                    }
                    break;
                }
                case "6": {
                    System.out.print("Seleccione estado (1-PENDIENTE, 2-CONFIRMADO, 3-TERMINADO, 4-CANCELADO): ");
                    String estSel = sc.nextLine().trim();
                    EstadoPedido ep = estSel.equals("2") ? EstadoPedido.CONFIRMADO
                            : estSel.equals("3") ? EstadoPedido.TERMINADO
                              : estSel.equals("4") ? EstadoPedido.CANCELADO
                                : EstadoPedido.PENDIENTE;

                    List<Pedido> porEstado = pedidoRepo.buscarPorEstado(ep);
                    if (porEstado.isEmpty()) {
                        System.out.println("No hay pedidos con ese estado.");
                    } else {
                        porEstado.forEach(p -> System.out.println("ID: " + p.getId()
                                + " | Fecha: " + p.getFecha()
                                + " | Usuario: " + usuarioRepo.buscarUsuarioPorPedido(p.getId())
                                .map(u -> u.getNombre() + " " + u.getApellido()).orElse("(desconocido)")
                                + " | Pago: " + p.getFormaPago()
                                + " | Total: $" + p.getTotal()));
                    }
                    break;

                }
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

    private static String obtenerNombreCategoriaDeProducto(Long productoId) {
        return categoriaRepo.buscarCategoriaPorProducto(productoId)
                .map(Categoria::getNombre)
                .orElse("Sin categoria");
    }

    // --- Métodos de lectura ---
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