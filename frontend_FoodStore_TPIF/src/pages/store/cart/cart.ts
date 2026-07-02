import { checkAuhtUser, logout } from "../../../utils/auth";
import { getUSer, addPedidoGuardado } from "../../../utils/localStorage";
import { ENVIO } from "../../../utils/config";
import { obtenerCarrito, guardarCarrito, calcularSubtotal } from "../../../utils/cart";
import type { IUser } from "../../../types/IUser";
import type { Pedido, DetallePedido, FormaPago } from "../../../types/Pedido";
import { inicializarMenuMovil } from "../../../utils/menu";

// --- PROTECCION DE RUTA ---
// cart.ts
checkAuhtUser(
    "/src/pages/auth/login/login.html",
    "/src/pages/admin/dashboard/dashboard.html",
    "USUARIO"
);

// --- MOSTRAR NOMBRE USUARIO ACTIVO ---
const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};

// --- NAVBAR DINAMICO depende de si es ADMIN o USER ---
const gestionarNavbar = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const user: IUser = JSON.parse(userRaw);

    if (buttonLogout) {
        buttonLogout.textContent = "Cerrar Sesion";
        buttonLogout.addEventListener("click", () => {
            logout();
        });
    }

    if (user.rol === "ADMIN") {
        const adminContainer = document.getElementById("admin-nav-item");
        if (adminContainer) {
            adminContainer.className = "nav__item";
            adminContainer.innerHTML = `
                <a href="/src/pages/admin/dashboard/dashboard.html" class="nav__link nav__link--panel-admin">PANEL ADMIN</a>
            `;
        }
    }

    if (user.rol === "USUARIO") {
        const pedidosContainer = document.getElementById("pedidos-nav-item");
        if (pedidosContainer) {
            pedidosContainer.className = "nav__item";
            pedidosContainer.innerHTML = `
                <a href="/src/pages/client/orders/orders.html" class="nav__link">MIS PEDIDOS</a>
            `;
        }
    }
}

// --- COLAPSAR SIDEBAR DE CATEGORIAS EN MOBILE ---
const inicializarSidebarMovil = () => {
    const titulo = document.querySelector(".store-sidebar__title") as HTMLElement | null;
    const lista = document.getElementById("lista-categorias") as HTMLElement | null;

    titulo?.addEventListener("click", () => {
        lista?.classList.toggle("abierto");
        titulo.classList.toggle("activo");
    });
};

// --- LOGOUT ---
const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
    logout();
});

// --- RENDERIZAR CARRITO ---
const renderCarrito = () => {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById("contenedor-carrito") as HTMLElement;
    const mensajeVacio = document.getElementById("mensaje-vacio") as HTMLElement;
    const cartLayout = document.querySelector(".cart-layout") as HTMLElement;
    const subtotalPrecio = document.getElementById("subtotal-precio") as HTMLElement;
    const envioPrecio = document.getElementById("envio-precio") as HTMLElement;
    const totalPrecio = document.getElementById("total-precio") as HTMLElement;

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        mensajeVacio.style.display = "block";
        cartLayout.style.display = "none";
        return;
    }

    mensajeVacio.style.display = "none";
    cartLayout.style.display = "flex";

    carrito.forEach((item) => {
        const fila = document.createElement("div");
        fila.classList.add("cart-item");

        const sinStockDisponible = item.cantidad >= item.product.stock;

        fila.innerHTML = `
            <img class="cart-item__img" src="../../../../assets/img/${item.product.imagen}" alt="${item.product.nombre}" onerror="this.classList.add('img-hidden')">
            <div class="cart-item__info">
                <h3>${item.product.nombre}</h3>
                <p class="cart-item__descripcion">${item.product.descripcion}</p>
                <p class="cart-item__precio-unitario">$${item.product.precio.toLocaleString()} c/u</p>
            </div>
            <div class="cart-item__actions">
                <button class="btn-restar btn-qty" data-id="${item.product.id}">-</button>
                <span>${item.cantidad}</span>
                <button class="btn-sumar btn-qty" data-id="${item.product.id}" ${sinStockDisponible ? "disabled" : ""}>+</button>
                <strong>$${(item.product.precio * item.cantidad).toLocaleString()}</strong>
                <button class="btn-eliminar btn-delete" data-id="${item.product.id}">❌</button>
            </div>
        `;
        contenedor.appendChild(fila);
    });

    const subtotal = calcularSubtotal(carrito);
    const total = subtotal + ENVIO;

    subtotalPrecio.textContent = `$${subtotal.toLocaleString()}`;
    envioPrecio.textContent = `$${ENVIO.toLocaleString()}`;
    totalPrecio.textContent = `$${total.toLocaleString()}`;

    document.querySelectorAll(".btn-sumar").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number((btn as HTMLButtonElement).dataset.id);
            const carritoActual = obtenerCarrito();
            const item = carritoActual.find((i) => i.product.id === id);

            if (item && item.cantidad < item.product.stock) {
                item.cantidad += 1;
            } else if (item) {
                alert("No hay mas stock disponible de este producto.");
            }

            guardarCarrito(carritoActual);
            renderCarrito();
        });
    });

    document.querySelectorAll(".btn-restar").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number((btn as HTMLButtonElement).dataset.id);
            const carritoActual = obtenerCarrito();
            const item = carritoActual.find((i) => i.product.id === id);
            if (item) {
                item.cantidad -= 1;
                if (item.cantidad === 0) {
                    const index = carritoActual.indexOf(item);
                    carritoActual.splice(index, 1);
                }
            }
            guardarCarrito(carritoActual);
            renderCarrito();
        });
    });

    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number((btn as HTMLButtonElement).dataset.id);
            const carritoActual = obtenerCarrito().filter((i) => i.product.id !== id);
            guardarCarrito(carritoActual);
            renderCarrito();
        });
    });
};

// --- VACIAR CARRITO ---
const btnVaciar = document.getElementById("btn-vaciar") as HTMLButtonElement;
btnVaciar?.addEventListener("click", () => {
    const confirmar = confirm("Queres vaciar el carrito?");
    if (confirmar) {
        guardarCarrito([]);
        renderCarrito();
    }
});

// --- MODAL DE CHECKOUT ---
const modalCheckout = document.getElementById("modal-checkout") as HTMLElement;
const btnProcederPago = document.getElementById("btn-proceder-pago") as HTMLButtonElement;
const btnCerrarModal = document.getElementById("btn-cerrar-modal") as HTMLButtonElement;
const formCheckout = document.getElementById("form-checkout") as HTMLFormElement;
const modalTotalPrecio = document.getElementById("modal-total-precio") as HTMLElement;

const abrirModal = () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert("Tu carrito esta vacio.");
        return;
    }
    const total = calcularSubtotal(carrito) + ENVIO;
    modalTotalPrecio.textContent = `$${total.toLocaleString()}`;
    modalCheckout.classList.remove("modal-overlay--oculto");
};

const cerrarModal = () => {
    modalCheckout.classList.add("modal-overlay--oculto");
};

btnProcederPago?.addEventListener("click", abrirModal);
btnCerrarModal?.addEventListener("click", cerrarModal);

// --- CONFIRMAR PEDIDO ---
formCheckout?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    const userRaw = getUSer();
    if (!userRaw) {
        alert("Debes iniciar sesion para confirmar el pedido.");
        return;
    }
    const usuario: IUser = JSON.parse(userRaw);

    const metodoPago = (document.getElementById("metodoPago") as HTMLSelectElement).value as FormaPago;
    if (!metodoPago) {
        alert("Selecciona un metodo de pago.");
        return;
    }

    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert("Tu carrito esta vacio.");
        return;
    }

    const detalles: DetallePedido[] = carrito.map((item) => ({
        idProducto: item.product.id,
        cantidad: item.cantidad,
        subtotal: item.product.precio * item.cantidad,
    }));

    const subtotal = calcularSubtotal(carrito);
    const total = subtotal + ENVIO;

    const nuevoPedido: Pedido = {
        id: Date.now(),
        eliminado: false,
        createdAt: new Date().toISOString(),
        fecha: new Date().toISOString(),
        estado: "PENDIENTE",
        total: total,
        formaPago: metodoPago,
        idUsuario: usuario.id,
        detalles: detalles,
    };

    addPedidoGuardado(nuevoPedido);
    guardarCarrito([]);

    alert("Pedido confirmado con exito.");
    cerrarModal();
    formCheckout.reset();
    renderCarrito();
});

// --- INICIO ---
renderCarrito();
mostrarUsuario();
gestionarNavbar();
inicializarMenuMovil();
inicializarSidebarMovil();