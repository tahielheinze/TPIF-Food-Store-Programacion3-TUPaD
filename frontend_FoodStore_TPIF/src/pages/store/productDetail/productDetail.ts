import { logout } from "../../../utils/auth";
import { getUSer } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";
import { getProductos, getCategorias } from "../../../utils/fetchData";
import { agregarAlCarrito as agregarAlCarritoUtil, contarItemsCarrito } from "../../../utils/cart";
import type { Product } from "../../../types/Product";
import type { IUser } from "../../../types/IUser";
import { inicializarMenuMovil } from "../../../utils/menu";

// --- MOSTRAR NOMBRE USUARIO ACTIVO ---
const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};

// --- OBTENER ID DE LA URL ---
const obtenerIdDesdeUrl = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    return idParam ? Number(idParam) : null;
};

// --- ACTUALIZAR CONTADOR DEL CARRITO ---
const actualizarContadorCarrito = () => {
    const span = document.getElementById("carrito-count") as HTMLSpanElement;
    if (span) span.textContent = String(contarItemsCarrito());
};

// --- LOGOUT Y NAVBAR BASICO ---
const gestionarNavbar = () => {
    const userRaw = getUSer();
    const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;

    if (!userRaw) {
        if (buttonLogout) {
            buttonLogout.textContent = "Iniciar Sesion";
            buttonLogout.addEventListener("click", (e) => {
                e.preventDefault();
                navigate("/src/pages/auth/login/login.html");
            });
        }
        return;
    }

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
};

// --- COLAPSAR SIDEBAR DE CATEGORIAS EN MOBILE ---
const inicializarSidebarMovil = () => {
    const titulo = document.querySelector(".store-sidebar__title") as HTMLElement | null;
    const lista = document.getElementById("lista-categorias") as HTMLElement | null;

    titulo?.addEventListener("click", () => {
        lista?.classList.toggle("abierto");
        titulo.classList.toggle("activo");
    });
};

// --- AGREGAR AL CARRITO (con control de sesion) ---
const manejarAgregarAlCarrito = (product: Product, cantidad: number) => {
    const userRaw = getUSer();

    if (!userRaw) {
        alert("Hola! Para empezar a armar tu carrito necesitas iniciar sesion.");
        navigate("/src/pages/auth/login/login.html");
        return;
    }

    const resultado = agregarAlCarritoUtil(product, cantidad);
    alert(resultado.mensaje);
    if (resultado.ok) actualizarContadorCarrito();
};

// --- RENDERIZAR DETALLE ---
const renderDetalle = (producto: Product, nombreCategoria: string) => {
    const contenedor = document.getElementById("detalle-container") as HTMLElement;

    contenedor.innerHTML = `
        <div class="product-detail__imagen-container">
            <img class="product-detail__imagen" src="../../../../assets/img/${producto.imagen}" alt="${producto.nombre}" onerror="this.classList.add('img-hidden')">
        </div>
        <div class="product-detail__info">
            <p class="product-detail__categoria">${nombreCategoria}</p>
            <h2 class="product-detail__nombre">${producto.nombre}</h2>
            <p class="product-detail__precio">$${producto.precio.toLocaleString()}</p>
            <span class="badge ${producto.disponible && producto.stock > 0 ? "badge--confirmado" : "badge--cancelado"}">
                ${producto.disponible && producto.stock > 0 ? "Disponible" : "Sin stock"}
            </span>
            <p class="product-detail__descripcion">${producto.descripcion}</p>
            <p class="product-detail__stock">Stock disponible: ${producto.stock}</p>

            <div class="product-detail__cantidad">
                <label for="input-cantidad"><strong>Cantidad:</strong></label>
                <div class="product-detail__cantidad-controls">
                    <button id="btn-restar-cantidad" class="btn-qty" type="button">-</button>
                    <span id="cantidad-actual">1</span>
                    <button id="btn-sumar-cantidad" class="btn-qty" type="button">+</button>
                </div>
            </div>

            <div class="botones-container">
                <button id="btn-agregar-detalle" class="btn-agregar" ${!producto.disponible || producto.stock === 0 ? "disabled" : ""}>
                    ${producto.disponible && producto.stock > 0 ? "Agregar al Carrito" : "Sin stock"}
                </button>
                <a href="../home/home.html" class="nav__link--admin cart-empty__link">Volver</a>
            </div>
        </div>
    `;

    let cantidadSeleccionada = 1;
    const spanCantidad = document.getElementById("cantidad-actual") as HTMLElement;
    const btnRestar = document.getElementById("btn-restar-cantidad") as HTMLButtonElement;
    const btnSumar = document.getElementById("btn-sumar-cantidad") as HTMLButtonElement;
    const btnAgregar = document.getElementById("btn-agregar-detalle") as HTMLButtonElement;

    btnRestar.addEventListener("click", () => {
        if (cantidadSeleccionada > 1) {
            cantidadSeleccionada -= 1;
            spanCantidad.textContent = String(cantidadSeleccionada);
        }
    });

    btnSumar.addEventListener("click", () => {
        if (cantidadSeleccionada < producto.stock) {
            cantidadSeleccionada += 1;
            spanCantidad.textContent = String(cantidadSeleccionada);
        } else {
            alert("Alcanzaste el stock disponible.");
        }
    });

    btnAgregar?.addEventListener("click", () => {
        manejarAgregarAlCarrito(producto, cantidadSeleccionada);
    });
};

// --- INICIO ---
const iniciarDetalle = async () => {
    const id = obtenerIdDesdeUrl();
    const detalleContainer = document.getElementById("detalle-container") as HTMLElement;
    const mensajeNoEncontrado = document.getElementById("mensaje-no-encontrado") as HTMLElement;

    if (id === null) {
        detalleContainer.style.display = "none";
        mensajeNoEncontrado.style.display = "block";
        return;
    }

    const [productos, categorias] = await Promise.all([getProductos(), getCategorias()]);
    const producto = productos.find((p) => p.id === id);

    if (!producto) {
        detalleContainer.style.display = "none";
        mensajeNoEncontrado.style.display = "block";
        return;
    }

    const categoria = categorias.find((c) => c.id === producto.categoriaId);
    renderDetalle(producto, categoria ? categoria.nombre : "Sin categoria");

    actualizarContadorCarrito();
    gestionarNavbar();
    mostrarUsuario();
    inicializarMenuMovil();
    inicializarSidebarMovil();
};

iniciarDetalle();