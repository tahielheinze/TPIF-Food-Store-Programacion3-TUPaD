import { checkAuhtUser, logout } from "../../../utils/auth";
import { getUSer } from "../../../utils/localStorage";
import { getProductos, getCategorias, getPedidos } from "../../../utils/fetchData";
import type { IUser } from "../../../types/IUser";
import type { Estado } from "../../../types/Pedido";

const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => logout());

const ESTADOS: Estado[] = ["PENDIENTE", "CONFIRMADO", "TERMINADO", "CANCELADO"];

const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};

const initPage = async () => {
    checkAuhtUser(
        "/src/pages/auth/login/login.html",
        "/src/pages/store/home/home.html",
        "ADMIN"
    );

    mostrarUsuario();

    const [productos, categorias, pedidos] = await Promise.all([
        getProductos(),
        getCategorias(),
        getPedidos(),
    ]);

    const categoriasActivas = categorias.filter((c) => !c.eliminado);
    const productosActivos = productos.filter((p) => !p.eliminado);
    const pedidosActivos = pedidos.filter((p) => !p.eliminado);
    const productosDisponibles = productosActivos.filter((p) => p.disponible && p.stock > 0);

    (document.getElementById("stat-categorias") as HTMLElement).textContent = String(categoriasActivas.length);
    (document.getElementById("stat-productos") as HTMLElement).textContent = String(productosActivos.length);
    (document.getElementById("stat-pedidos") as HTMLElement).textContent = String(pedidosActivos.length);
    (document.getElementById("stat-disponibles") as HTMLElement).textContent = String(productosDisponibles.length);

    const resumenGrid = document.getElementById("resumen-grid") as HTMLElement;
    resumenGrid.innerHTML = "";

    const itemsResumen: { label: string; value: number }[] = [
        { label: "Productos disponibles", value: productosDisponibles.length },
        { label: "Productos sin stock o inactivos", value: productosActivos.length - productosDisponibles.length },
    ];

    ESTADOS.forEach((estado) => {
        const cantidad = pedidosActivos.filter((p) => p.estado === estado).length;
        itemsResumen.push({ label: `Pedidos ${estado.toLowerCase()}`, value: cantidad });
    });

    itemsResumen.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("admin-resumen__item");
        div.innerHTML = `<span>${item.label}</span><span>${item.value}</span>`;
        resumenGrid.appendChild(div);
    });
};

initPage();