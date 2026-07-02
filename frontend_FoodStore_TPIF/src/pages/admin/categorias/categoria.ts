import { checkAuhtUser, logout } from "../../../utils/auth";
import { getCategorias } from "../../../utils/fetchData";
import type { ICategory } from "../../../types/Category";
import { getUSer } from "../../../utils/localStorage";
import type { IUser } from "../../../types/IUser";

let CATEGORIES: ICategory[] = [];
let editandoId: number | null = null;

const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => logout());

const modal = document.getElementById("modal-categoria") as HTMLElement;
const modalTitulo = document.getElementById("modal-titulo") as HTMLElement;
const btnCerrarModal = document.getElementById("btn-cerrar-modal") as HTMLButtonElement;
const btnNuevaCategoria = document.getElementById("btn-nueva-categoria") as HTMLButtonElement;
const formCategoria = document.getElementById("form-categoria") as HTMLFormElement;

const mostrarUsuario = () => {
    const userRaw = getUSer();
    if (!userRaw) return;
    const usuario: IUser = JSON.parse(userRaw);
    const item = document.getElementById("username-nav-item") as HTMLElement;
    item.textContent = usuario.nombre + " " + usuario.apellido;
};


const abrirModal = (categoria?: ICategory) => {
    if (categoria) {
        editandoId = categoria.id;
        modalTitulo.textContent = "Editar Categoria";
        (document.getElementById("nombre") as HTMLInputElement).value = categoria.nombre;
        (document.getElementById("descripcion") as HTMLInputElement).value = categoria.descripcion ?? "";
        (document.getElementById("imagen") as HTMLInputElement).value = categoria.imagen ?? "";
    } else {
        editandoId = null;
        modalTitulo.textContent = "Nueva Categoria";
        formCategoria.reset();
    }
    modal.classList.remove("modal-overlay--oculto");
};

const cerrarModal = () => {
    modal.classList.add("modal-overlay--oculto");
    formCategoria.reset();
    editandoId = null;
};

btnNuevaCategoria?.addEventListener("click", () => abrirModal());
btnCerrarModal?.addEventListener("click", cerrarModal);

const eliminarCategoria = (id: number) => {
    const categoria = CATEGORIES.find((c) => c.id === id);
    if (!categoria) return;

    const confirmar = confirm(`Eliminar la categoria "${categoria.nombre}" (ID #${id})?`);
    if (!confirmar) return;

    categoria.eliminado = true;
    alert("Categoria eliminada correctamente.");
    renderCategorias();
};

const renderCategorias = () => {
    const tabla = document.getElementById("tabla-categorias") as HTMLTableSectionElement;
    tabla.innerHTML = "";

    const activas = CATEGORIES.filter((c) => !c.eliminado);

    if (activas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5">No hay categorias cargadas.</td></tr>`;
        return;
    }

    activas.forEach((categoria) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><strong>#${categoria.id}</strong></td>
            <td><img src="../../../../assets/img/${categoria.imagen}" alt="${categoria.nombre}" class="admin-table-img" onerror="this.classList.add('img-hidden')"></td>
            <td>${categoria.nombre}</td>
            <td>${categoria.descripcion}</td>
            <td>
                <div class="admin-actions-container">
                    <button class="btn-editar">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </div>
            </td>
        `;
        fila.querySelector(".btn-editar")?.addEventListener("click", () => abrirModal(categoria));
        fila.querySelector(".btn-delete")?.addEventListener("click", () => eliminarCategoria(categoria.id));
        tabla.appendChild(fila);
    });
};

formCategoria?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
    const descripcion = (document.getElementById("descripcion") as HTMLInputElement).value.trim();
    const imagen = (document.getElementById("imagen") as HTMLInputElement).value.trim();

    if (!nombre) return alert("El nombre es obligatorio.");

    if (editandoId !== null) {
        const categoria = CATEGORIES.find((c) => c.id === editandoId);
        if (categoria) {
            categoria.nombre = nombre;
            categoria.descripcion = descripcion || categoria.descripcion;
            categoria.imagen = imagen || categoria.imagen;
            alert(`Categoria "${categoria.nombre}" actualizada correctamente.`);
        }
    } else {
        const nuevoId = CATEGORIES.length > 0 ? Math.max(...CATEGORIES.map((c) => c.id)) + 1 : 1;
        const nuevaCategoria: ICategory = {
            id: nuevoId,
            eliminado: false,
            createdAt: new Date().toISOString(),
            nombre,
            descripcion: descripcion || "Sin descripcion",
            imagen: imagen || "placeholder.webp",
        };
        CATEGORIES.push(nuevaCategoria);
        alert(`Categoria agregada con ID #${nuevoId}.`);
    }

    cerrarModal();
    renderCategorias();
});

const initPage = async () => {
    checkAuhtUser(
        "/src/pages/auth/login/login.html",
        "/src/pages/store/home/home.html",
        "ADMIN"
    );

    mostrarUsuario();

    CATEGORIES = await getCategorias();
    renderCategorias();
};

initPage();