import type { IUser, SessionUser } from "../types/IUser";
import type { Pedido } from "../types/Pedido";

const USER_KEY = "user";
const USUARIOS_REGISTRADOS_KEY = "usuariosRegistrados";
const PEDIDOS_GUARDADOS_KEY = "pedidosGuardados";

// --- Sesion activa ---

export const saveUser = (user: SessionUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUSer = (): string | null => {
    return localStorage.getItem(USER_KEY);
};

export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};

// --- Usuarios registrados en esta iteracion (no persisten en el JSON) ---

export const getUsuariosRegistrados = (): IUser[] => {
    const guardados = localStorage.getItem(USUARIOS_REGISTRADOS_KEY);
    return guardados ? JSON.parse(guardados) : [];
};

export const addUsuarioRegistrado = (user: IUser) => {
    const usuarios = getUsuariosRegistrados();
    usuarios.push(user);
    localStorage.setItem(USUARIOS_REGISTRADOS_KEY, JSON.stringify(usuarios));
};

// --- Pedidos generados en esta iteracion (no persisten en el JSON) ---

export const getPedidosGuardados = (): Pedido[] => {
    const guardados = localStorage.getItem(PEDIDOS_GUARDADOS_KEY);
    return guardados ? JSON.parse(guardados) : [];
};

export const addPedidoGuardado = (pedido: Pedido) => {
    const pedidos = getPedidosGuardados();
    pedidos.push(pedido);
    localStorage.setItem(PEDIDOS_GUARDADOS_KEY, JSON.stringify(pedidos));
};