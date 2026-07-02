import { checkAuhtUser, logout } from "../../utils/auth";
import { getProductos, getCategorias } from "../../utils/fetchData";
import type { Product } from "../../types/Product";
import type { ICategory } from "../../types/Category";
import type { IUser } from "../../types/IUser";
import { getUSer } from "../../utils/localStorage";

let PRODUCTS: Product[] = [];
let CATEGORIES: ICategory[] = [];
let editandoId: number | null = null;

const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => logout());

const modal = document.getElementById("modal-producto") as HTMLElement;
const modalTitulo = document.getElementById("modal-titulo") as HTMLElement;
const btnCerrarModal = document.getElementById("btn-cerrar-modal") as HTMLButtonElement;
const btnNuevoProducto = document.getElementById("btn-nuevo-producto") as HTMLButtonElement;
const formProducto = document.getElementById("form-producto") as HTMLFormElement;

const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};


const cargarSelectCategorias = () => {
    const select = document.getElementById("categoria") as HTMLSelectElement;
    select.innerHTML = `<option value="">Seleccionar</option>`;
    CATEGORIES.forEach((cat) => {
        const option = document.createElement("option");
        option.value = String(cat.id);
        option.textContent = cat.nombre;
        select.appendChild(option);
    });
};

const abrirModal = (producto?: Product) => {
    cargarSelectCategorias();

    if (producto) {
        editandoId = producto.id;
        modalTitulo.textContent = "Editar Producto";
        (document.getElementById("nombre") as HTMLInputElement).value = producto.nombre;
        (document.getElementById("descripcion") as HTMLInputElement).value = producto.descripcion ?? "";
        (document.getElementById("precio") as HTMLInputElement).value = String(producto.precio);
        (document.getElementById("stock") as HTMLInputElement).value = String(producto.stock);
        (document.getElementById("categoria") as HTMLSelectElement).value = String(producto.categoriaId);
        (document.getElementById("imagen") as HTMLInputElement).value = producto.imagen ?? "";
        (document.getElementById("disponible") as HTMLInputElement).checked = producto.disponible;
    } else {
        editandoId = null;
        modalTitulo.textContent = "Nuevo Producto";
        formProducto.reset();
        (document.getElementById("disponible") as HTMLInputElement).checked = true;
    }

    modal.classList.remove("modal-overlay--oculto");
};

const cerrarModal = () => {
    modal.classList.add("modal-overlay--oculto");
    formProducto.reset();
    editandoId = null;
};

btnNuevoProducto?.addEventListener("click", () => abrirModal());
btnCerrarModal?.addEventListener("click", cerrarModal);

const eliminarProducto = (id: number) => {
    const producto = PRODUCTS.find((p) => p.id === id);
    if (!producto) return;

    const confirmar = confirm(`Eliminar "${producto.nombre}" (ID #${id})?`);
    if (!confirmar) return;

    producto.eliminado = true;
    alert("Producto eliminado correctamente.");
    renderProductos();
};

const renderProductos = () => {
    const tabla = document.getElementById("tabla-productos") as HTMLTableSectionElement;
    tabla.innerHTML = "";

    const activos = PRODUCTS.filter((p) => !p.eliminado);

    if (activos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="9">No hay productos cargados.</td></tr>`;
        return;
    }

    activos.forEach((producto) => {
        const fila = document.createElement("tr");
        const categoria = CATEGORIES.find((c) => c.id === producto.categoriaId);
        const disponible = producto.disponible && producto.stock > 0;

        fila.innerHTML = `
            <td><strong>#${producto.id}</strong></td>
            <td><img src="../../../assets/img/${producto.imagen}" alt="${producto.nombre}" class="admin-table-img" onerror="this.classList.add('img-hidden')"></td>
            <td>${producto.nombre}</td>
            <td>${producto.descripcion}</td>
            <td><strong>$${producto.precio.toLocaleString()}</strong></td>
            <td>${categoria ? categoria.nombre : "Sin categoria"}</td>
            <td>${producto.stock}</td>
            <td><span class="badge-disponibilidad ${disponible ? "badge-disponibilidad--activo" : "badge-disponibilidad--inactivo"}"></span></td>
            <td>
                <div class="admin-actions-container">
                    <button class="btn-editar">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </div>
            </td>
        `;

        fila.querySelector(".btn-editar")?.addEventListener("click", () => abrirModal(producto));
        fila.querySelector(".btn-delete")?.addEventListener("click", () => eliminarProducto(producto.id));
        tabla.appendChild(fila);
    });
};

formProducto?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
    const descripcion = (document.getElementById("descripcion") as HTMLInputElement).value.trim();
    const precio = Number((document.getElementById("precio") as HTMLInputElement).value);
    const stock = Number((document.getElementById("stock") as HTMLInputElement).value);
    const categoriaId = Number((document.getElementById("categoria") as HTMLSelectElement).value);
    const imagen = (document.getElementById("imagen") as HTMLInputElement).value.trim();
    const disponible = (document.getElementById("disponible") as HTMLInputElement).checked;

    if (!nombre) return alert("El nombre es obligatorio.");
    if (!categoriaId) return alert("Selecciona una categoria.");
    if (isNaN(precio) || precio <= 0) return alert("El precio debe ser mayor a 0.");
    if (isNaN(stock) || stock < 0) return alert("El stock no puede ser negativo.");

    if (editandoId !== null) {
        const producto = PRODUCTS.find((p) => p.id === editandoId);
        if (producto) {
            producto.nombre = nombre;
            producto.descripcion = descripcion || producto.descripcion;
            producto.precio = precio;
            producto.stock = stock;
            producto.categoriaId = categoriaId;
            producto.imagen = imagen || producto.imagen;
            producto.disponible = disponible;
            alert(`"${producto.nombre}" actualizado correctamente.`);
        }
    } else {
        const nuevoId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map((p) => p.id)) + 1 : 1;
        const nuevoProducto: Product = {
            id: nuevoId,
            eliminado: false,
            createdAt: new Date().toISOString(),
            nombre,
            descripcion: descripcion || "Sin descripcion",
            precio,
            stock,
            categoriaId,
            imagen: imagen || "placeholder.webp",
            disponible,
        };
        PRODUCTS.push(nuevoProducto);
        alert(`Producto agregado con ID #${nuevoId}.`);
    }

    cerrarModal();
    renderProductos();
});

const initPage = async () => {
    checkAuhtUser(
        "/src/pages/auth/login/login.html",
        "/src/pages/store/home/home.html",
        "ADMIN"
    );

    const [productos, categorias] = await Promise.all([getProductos(), getCategorias()]);
    PRODUCTS = productos;
    CATEGORIES = categorias;

    mostrarUsuario();
    renderProductos();
};

initPage();