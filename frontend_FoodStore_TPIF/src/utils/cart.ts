import type { CartItem, Product } from "../types/Product";

const CARRITO_KEY = "carrito";

// --- OBTENER CARRITO ---
export const obtenerCarrito = (): CartItem[] => {
    const carritoGuardado = localStorage.getItem(CARRITO_KEY);
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
};

// --- GUARDAR CARRITO ---
export const guardarCarrito = (carrito: CartItem[]) => {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
};

// --- AGREGAR PRODUCTO AL CARRITO ---
// Centraliza la validacion de stock que antes estaba repetida en
// home.ts, productDetail.ts y cart.ts. Retorna un resultado en vez de
// hacer el alert directamente, para que cada pantalla decida como avisar.
export const agregarAlCarrito = (
    product: Product,
    cantidad: number = 1
): { ok: boolean; mensaje: string } => {
    const carrito = obtenerCarrito();
    const itemExistente = carrito.find((item) => item.product.id === product.id);
    const cantidadTotal = (itemExistente ? itemExistente.cantidad : 0) + cantidad;

    if (cantidadTotal > product.stock) {
        return { ok: false, mensaje: "No hay suficiente stock disponible." };
    }

    if (itemExistente) {
        itemExistente.cantidad = cantidadTotal;
    } else {
        carrito.push({ product, cantidad });
    }

    guardarCarrito(carrito);
    return { ok: true, mensaje: `"${product.nombre}" agregado al carrito.` };
};

// --- CONTAR ITEMS DEL CARRITO ---
export const contarItemsCarrito = (): number => {
    return obtenerCarrito().reduce((acc, item) => acc + item.cantidad, 0);
};

// --- CALCULAR SUBTOTAL ---
export const calcularSubtotal = (carrito: CartItem[]): number => {
    return carrito.reduce((acc, item) => acc + item.product.precio * item.cantidad, 0);
};