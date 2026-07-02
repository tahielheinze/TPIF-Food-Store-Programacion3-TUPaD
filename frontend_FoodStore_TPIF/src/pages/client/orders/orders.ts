import { checkAuhtUser, logout } from "../../../utils/auth";
import { getUSer, getPedidosGuardados } from "../../../utils/localStorage";
import { getPedidos, getProductos } from "../../../utils/fetchData";
import type { IUser } from "../../../types/IUser";
import type { Pedido, Estado } from "../../../types/Pedido";
import type { Product } from "../../../types/Product";
import { inicializarMenuMovil } from "../../../utils/menu";

// --- PROTECCION DE RUTA ---
checkAuhtUser(
    "/src/pages/auth/login/login.html",
    "/src/pages/admin/dashboard/dashboard.html",
    "USUARIO"
);

const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};



// --- LOGOUT ---
const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
    logout();
});

// --- CLASE DE BADGE SEGUN ESTADO ---
const claseBadgePorEstado = (estado: Estado): string => {
    switch (estado) {
        case "PENDIENTE":
            return "badge badge--pendiente";
        case "CONFIRMADO":
            return "badge badge--confirmado";
        case "TERMINADO":
            return "badge badge--terminado";
        case "CANCELADO":
            return "badge badge--cancelado";
        default:
            return "badge";
    }
};

// --- FORMATEAR FECHA ---
const formatearFecha = (fechaIso: string): string => {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// --- INICIO ---
const iniciarOrders = async () => {
    const userRaw = getUSer();
    if (!userRaw) return; // checkAuhtUser ya redirige, esto es solo por las dudas

    const usuario: IUser = JSON.parse(userRaw);

    const [pedidosJson, productos] = await Promise.all([getPedidos(), getProductos()]);
    const pedidosLocales = getPedidosGuardados();
    const todosLosPedidos: Pedido[] = [...pedidosJson, ...pedidosLocales];

    const pedidosDelUsuario = todosLosPedidos
        .filter((p) => p.idUsuario === usuario.id && !p.eliminado)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());


    mostrarUsuario();
    renderPedidos(pedidosDelUsuario, productos);
};

// --- RENDERIZAR LISTADO DE PEDIDOS ---
const renderPedidos = (pedidos: Pedido[], productos: Product[]) => {
    const contenedor = document.getElementById("contenedor-pedidos") as HTMLElement;
    const mensajeVacio = document.getElementById("mensaje-vacio") as HTMLElement;

    contenedor.innerHTML = "";

    if (pedidos.length === 0) {
        mensajeVacio.style.display = "block";
        return;
    }

    mensajeVacio.style.display = "none";

    pedidos.forEach((pedido) => {
        const nombresProductos = pedido.detalles
            .slice(0, 3)
            .map((d) => {
                const producto = productos.find((p) => p.id === d.idProducto);
                return producto ? producto.nombre : "Producto no disponible";
            })
            .join(", ");

        const card = document.createElement("div");
        card.classList.add("order-card");
        card.innerHTML = `
            <div class="order-card__header">
                <span class="${claseBadgePorEstado(pedido.estado)}">${pedido.estado}</span>
                <span class="order-card__fecha">${formatearFecha(pedido.fecha)}</span>
            </div>
            <p class="order-card__id">Pedido #${pedido.id}</p>
            <p class="order-card__productos">${nombresProductos}${pedido.detalles.length > 3 ? "..." : ""}</p>
            <p class="order-card__total"><strong>$${pedido.total.toLocaleString()}</strong></p>
        `;

        card.addEventListener("click", () => abrirDetalle(pedido, productos));
        contenedor.appendChild(card);
    });
};

// --- MODAL DE DETALLE ---
const modalDetalle = document.getElementById("modal-detalle") as HTMLElement;
const modalDetalleTitulo = document.getElementById("modal-detalle-titulo") as HTMLElement;
const modalDetalleContenido = document.getElementById("modal-detalle-contenido") as HTMLElement;
const btnCerrarModalDetalle = document.getElementById("btn-cerrar-modal-detalle") as HTMLButtonElement;

const abrirDetalle = (pedido: Pedido, productos: Product[]) => {
    modalDetalleTitulo.textContent = `Detalle del Pedido #${pedido.id}`;

    const subtotal = pedido.detalles.reduce((acc, d) => acc + d.subtotal, 0);
    const envio = pedido.total - subtotal;

    const filasProductos = pedido.detalles
        .map((d) => {
            const producto = productos.find((p) => p.id === d.idProducto);
            const nombre = producto ? producto.nombre : "Producto no disponible";
            return `
                <div class="cart-summary__row">
                    <span>${nombre} x${d.cantidad}</span>
                    <span>$${d.subtotal.toLocaleString()}</span>
                </div>
            `;
        })
        .join("");

    modalDetalleContenido.innerHTML = `
        <p><strong>Estado:</strong> <span class="${claseBadgePorEstado(pedido.estado)}">${pedido.estado}</span></p>
        <p><strong>Fecha:</strong> ${formatearFecha(pedido.fecha)}</p>
        <p><strong>Metodo de pago:</strong> ${pedido.formaPago}</p>
        <hr class="separator">
        <h4>Productos</h4>
        ${filasProductos}
        <hr class="separator">
        <div class="cart-summary__row">
            <span>Subtotal:</span>
            <span>$${subtotal.toLocaleString()}</span>
        </div>
        <div class="cart-summary__row">
            <span>Envio:</span>
            <span>$${envio.toLocaleString()}</span>
        </div>
        <div class="cart-summary__row cart-summary__row--total">
            <span>Total:</span>
            <span>$${pedido.total.toLocaleString()}</span>
        </div>
    `;

    modalDetalle.classList.remove("modal-overlay--oculto");
};

btnCerrarModalDetalle?.addEventListener("click", () => {
    modalDetalle.classList.add("modal-overlay--oculto");
});

// --- COLAPSAR SIDEBAR DE CATEGORIAS EN MOBILE ---
const inicializarSidebarMovil = () => {
    const titulo = document.querySelector(".store-sidebar__title") as HTMLElement | null;
    const lista = document.getElementById("lista-categorias") as HTMLElement | null;

    titulo?.addEventListener("click", () => {
        lista?.classList.toggle("abierto");
        titulo.classList.toggle("activo");
    });
};

iniciarOrders();
inicializarMenuMovil();
inicializarSidebarMovil();