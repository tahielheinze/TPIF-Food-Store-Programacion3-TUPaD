import { logout } from "../../../utils/auth";
import { getUSer } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";
import { getProductos, getCategorias } from "../../../utils/fetchData";
import { agregarAlCarrito as agregarAlCarritoUtil, contarItemsCarrito } from "../../../utils/cart";
import type { Product } from "../../../types/Product";
import type { ICategory } from "../../../types/Category";
import type { IUser } from "../../../types/IUser";
import { inicializarMenuMovil } from "../../../utils/menu.ts";

let PRODUCTS: Product[] = [];
let CATEGORIES: ICategory[] = [];

let categoriaActual: number | "todas" = "todas";
let textoBusqueda = "";
let ordenActual = "recomendados";

// --- MOSTRAR NOMBRE USUARIO ACTIVO ---
const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};

// --- RENDERIZADO DE CATEGORIAS (SIDEBAR) ---
const cargarCategorias = async () => {
    const lista = document.getElementById("lista-categorias") as HTMLUListElement;
    CATEGORIES = await getCategorias();

    lista.innerHTML = "";

    const liTodas = document.createElement("li");
    liTodas.innerHTML = `<a href="#" data-categoria="todas" class="activo">Todas</a>`;
    lista.appendChild(liTodas);

    CATEGORIES.forEach((cat) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" data-categoria="${cat.id}">${cat.nombre}</a>`;
        lista.appendChild(li);
    });

    lista.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault();
        const target = e.target as HTMLAnchorElement;
        const categoriaSeleccionada = target.dataset.categoria;
        if (!categoriaSeleccionada) return;

        lista.querySelectorAll("a").forEach((a) => a.classList.remove("activo"));
        target.classList.add("activo");

        categoriaActual = categoriaSeleccionada === "todas" ? "todas" : Number(categoriaSeleccionada);
        aplicarFiltros();
    });
};

// --- BUSQUEDA EN TIEMPO REAL ---
const inicializarBuscador = () => {
    const inputBuscar = document.getElementById("input-busqueda") as HTMLInputElement;
    const formBusqueda = document.getElementById("form-busqueda") as HTMLFormElement;

    formBusqueda?.addEventListener("submit", (e: Event) => e.preventDefault());

    inputBuscar?.addEventListener("input", () => {
        textoBusqueda = inputBuscar.value.trim().toLowerCase();
        aplicarFiltros();
    });
};

// --- DROPDOWN DE ORDENAMIENTO ---
const inicializarOrden = () => {
    const btnOrden = document.getElementById("btn-orden") as HTMLButtonElement;
    const listaOrden = document.getElementById("lista-orden") as HTMLUListElement;

    btnOrden?.addEventListener("click", (e) => {
        e.stopPropagation();
        listaOrden.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
        listaOrden?.classList.add("hidden");
    });

    listaOrden?.querySelectorAll("li").forEach((li) => {
        li.addEventListener("click", () => {
            const orden = (li as HTMLElement).dataset.orden;
            if (!orden) return;

            ordenActual = orden;
            listaOrden.querySelectorAll("li").forEach((el) => el.classList.remove("activo"));
            li.classList.add("activo");
            listaOrden.classList.add("hidden");

            aplicarFiltros();
        });
    });
};

// --- COMBINA CATEGORIA + BUSQUEDA + ORDEN ---
const aplicarFiltros = () => {
    let resultado = PRODUCTS.filter((p) => !p.eliminado && p.disponible);

    if (categoriaActual !== "todas") {
        resultado = resultado.filter((p) => p.categoriaId === categoriaActual);
    }

    if (textoBusqueda !== "") {
        resultado = resultado.filter((p) => p.nombre.toLowerCase().includes(textoBusqueda));
    }

    resultado = ordenarProductos(resultado, ordenActual);
    cargarProductos(resultado);
};

const ordenarProductos = (lista: Product[], orden: string): Product[] => {
    const copia = [...lista];
    switch (orden) {
        case "az":
            return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
        case "za":
            return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
        case "precio-asc":
            return copia.sort((a, b) => a.precio - b.precio);
        case "precio-desc":
            return copia.sort((a, b) => b.precio - a.precio);
        default:
            return copia; // "recomendados": orden original del catálogo
    }
};

// --- RENDERIZADO DE LOS PRODUCTOS ---
const cargarProductos = (lista: Product[]) => {
    const contenedor = document.getElementById("contenedor-productos") as HTMLElement;
    const mensajeVacio = document.getElementById("mensaje-vacio") as HTMLElement;

    contenedor.innerHTML = "";

    if (lista.length === 0) {
        mensajeVacio.style.display = "block";
        return;
    }

    mensajeVacio.style.display = "none";

    lista.forEach((producto) => {
        const card = document.createElement("div");
        card.classList.add("card-producto");
        card.innerHTML = `
            <img src="../../../../assets/img/${producto.imagen}" alt="${producto.nombre}" onerror="this.classList.add('img-hidden')">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p><strong>$${producto.precio.toLocaleString()}</strong></p>
            <div class="botones-container">
                <button class="btn-agregar" ${producto.stock === 0 ? "disabled" : ""}>
                    ${producto.stock > 0 ? "Agregar al carrito" : "Sin stock"}
                </button>
            </div>
        `;

        card.addEventListener("click", () => {
            navigate(`../productDetail/productDetail.html?id=${producto.id}`);
        });

        if (producto.stock > 0) {
            const btn = card.querySelector(".btn-agregar") as HTMLButtonElement;
            btn.addEventListener("click", (e: MouseEvent) => {
                e.stopPropagation();
                manejarAgregarAlCarrito(producto);
            });
        }

        contenedor.appendChild(card);
    });
};

// --- ACTUALIZAR CONTADOR DEL CARRITO ---
const actualizarContadorCarrito = () => {
    const span = document.getElementById("carrito-count") as HTMLSpanElement;
    if (span) span.textContent = String(contarItemsCarrito());
};

// --- AGREGAR AL CARRITO (con control de sesion) ---
const manejarAgregarAlCarrito = (product: Product) => {
    const userRaw = getUSer();

    if (!userRaw) {
        alert("Hola! Para empezar a armar tu carrito necesitas iniciar sesion.");
        navigate("/src/pages/auth/login/login.html");
        return;
    }

    const resultado = agregarAlCarritoUtil(product, 1);
    alert(resultado.mensaje);
    if (resultado.ok) actualizarContadorCarrito();
};

// --- PROTECCION DEL ACCESO AL CARRITO DESDE EL NAVBAR ---
const protegerEnlaceCarrito = () => {
    const linkCarrito = document.querySelector('a[href="../cart/cart.html"]') as HTMLAnchorElement;

    linkCarrito?.addEventListener("click", (e: MouseEvent) => {
        const userRaw = getUSer();
        if (!userRaw) {
            e.preventDefault();
            alert("Por favor, inicia sesion para visualizar tu carrito");
            navigate("/src/pages/auth/login/login.html");
        }
    });
};

// --- CONTROL DINAMICO DEL NAVBAR ---
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
        buttonLogout.addEventListener("click", () => logout());
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

// --- INICIO ---
const iniciarHome = async () => {
    PRODUCTS = await getProductos();
    await cargarCategorias();
    aplicarFiltros();
    actualizarContadorCarrito();
    protegerEnlaceCarrito();
    gestionarNavbar();
    inicializarMenuMovil();
    inicializarSidebarMovil();
    inicializarBuscador();
    inicializarOrden();
    mostrarUsuario();
};

iniciarHome();