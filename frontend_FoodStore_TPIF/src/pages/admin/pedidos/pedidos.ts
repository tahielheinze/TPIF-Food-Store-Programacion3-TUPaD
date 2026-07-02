import { checkAuhtUser, logout } from "../../../utils/auth";
import { getPedidos, getUsuarios, getProductos } from "../../../utils/fetchData";
import type { Pedido, Estado } from "../../../types/Pedido";
import type { IUser } from "../../../types/IUser";
import { getUSer } from "../../../utils/localStorage";
import type { Product } from "../../../types/Product";

let PEDIDOS: Pedido[] = [];
let USUARIOS: IUser[] = [];
let PRODUCTOS: Product[] = [];

const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => logout());


const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};

const claseBadgePorEstado = (estado: Estado): string => {
    switch (estado) {
        case "PENDIENTE": return "badge badge--pendiente";
        case "CONFIRMADO": return "badge badge--confirmado";
        case "TERMINADO": return "badge badge--terminado";
        case "CANCELADO": return "badge badge--cancelado";
        default: return "badge";
    }
};

const formatearFecha = (fechaIso: string): string => {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const nombreCliente = (idUsuario: number): string => {
    const usuario = USUARIOS.find((u) => u.id === idUsuario);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cliente desconocido";
};

const renderPedidos = (lista: Pedido[]) => {
    const tabla = document.getElementById("tabla-pedidos") as HTMLTableSectionElement;
    tabla.innerHTML = "";

    const activos = lista
        .filter((p) => !p.eliminado)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    if (activos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="6">No hay pedidos para mostrar.</td></tr>`;
        return;
    }

    activos.forEach((pedido) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><strong>#${pedido.id}</strong></td>
            <td>${nombreCliente(pedido.idUsuario)}</td>
            <td>${formatearFecha(pedido.fecha)}</td>
            <td><span class="${claseBadgePorEstado(pedido.estado)}">${pedido.estado}</span></td>
            <td><strong>$${pedido.total.toLocaleString()}</strong></td>
            <td>
                <div class="admin-actions-container">
                    <button class="btn-editar">Ver Detalle</button>
                </div>
            </td>
        `;
        fila.querySelector(".btn-editar")?.addEventListener("click", () => abrirDetalle(pedido));
        tabla.appendChild(fila);
    });
};

const filtroEstado = document.getElementById("filtro-estado") as HTMLSelectElement;
filtroEstado?.addEventListener("change", () => {
    const valor = filtroEstado.value;
    renderPedidos(valor === "todos" ? PEDIDOS : PEDIDOS.filter((p) => p.estado === valor));
});

const modal = document.getElementById("modal-detalle") as HTMLElement;
const modalTitulo = document.getElementById("modal-titulo") as HTMLElement;
const modalContenido = document.getElementById("modal-contenido") as HTMLElement;
const btnCerrarModal = document.getElementById("btn-cerrar-modal") as HTMLButtonElement;

const cerrarModal = () => modal.classList.add("modal-overlay--oculto");
btnCerrarModal?.addEventListener("click", cerrarModal);

const abrirDetalle = (pedido: Pedido) => {
    modalTitulo.textContent = `Pedido #${pedido.id} — ${nombreCliente(pedido.idUsuario)}`;

    const filasProductos = pedido.detalles
        .map((d) => {
            const producto = PRODUCTOS.find((p) => p.id === d.idProducto);
            const nombre = producto ? producto.nombre : "Producto no disponible";
            return `
                <div class="cart-summary__row">
                    <span>${nombre} x${d.cantidad}</span>
                    <span>$${d.subtotal.toLocaleString()}</span>
                </div>
            `;
        })
        .join("");

    modalContenido.innerHTML = `
        <p><strong>Fecha:</strong> ${formatearFecha(pedido.fecha)}</p>
        <p><strong>Método de pago:</strong> ${pedido.formaPago}</p>
        <hr class="separator">
        <h4>Productos</h4>
        ${filasProductos}
        <hr class="separator">
        <div class="cart-summary__row cart-summary__row--total">
            <span>Total:</span>
            <span>$${pedido.total.toLocaleString()}</span>
        </div>
        <hr class="separator">
        <label for="select-estado"><strong>Cambiar estado:</strong></label>
        <select id="select-estado">
            <option value="PENDIENTE" ${pedido.estado === "PENDIENTE" ? "selected" : ""}>Pendiente</option>
            <option value="CONFIRMADO" ${pedido.estado === "CONFIRMADO" ? "selected" : ""}>Confirmado</option>
            <option value="TERMINADO" ${pedido.estado === "TERMINADO" ? "selected" : ""}>Terminado</option>
            <option value="CANCELADO" ${pedido.estado === "CANCELADO" ? "selected" : ""}>Cancelado</option>
        </select>
        <button id="btn-actualizar-estado" type="button">Actualizar Estado</button>
    `;

    document.getElementById("btn-actualizar-estado")?.addEventListener("click", () => {
        const nuevoEstado = (document.getElementById("select-estado") as HTMLSelectElement).value as Estado;
        pedido.estado = nuevoEstado;
        alert(`Pedido #${pedido.id} actualizado a "${nuevoEstado}".`);
        cerrarModal();
        renderPedidos(filtroEstado.value === "todos" ? PEDIDOS : PEDIDOS.filter((p) => p.estado === filtroEstado.value));
    });

    modal.classList.remove("modal-overlay--oculto");
};

const initPage = async () => {
    checkAuhtUser(
        "/src/pages/auth/login/login.html",
        "/src/pages/store/home/home.html",
        "ADMIN"
    );
    
    const [pedidos, usuarios, productos] = await Promise.all([getPedidos(), getUsuarios(), getProductos()]);
    PEDIDOS = pedidos;
    USUARIOS = usuarios;
    PRODUCTOS = productos;
    
    mostrarUsuario();
    renderPedidos(PEDIDOS);
};

initPage();