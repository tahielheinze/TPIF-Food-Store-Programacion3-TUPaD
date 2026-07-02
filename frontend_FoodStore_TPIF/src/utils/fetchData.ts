import type { Product } from "../types/Product";
import type { ICategory } from "../types/Category";
import type { IUser } from "../types/IUser";
import type { Pedido } from "../types/Pedido";

//FetchData apunta a los archivos locales en public/data/
// Cuando se conecte el backend (Parte 2), solo hay que cambiar
// estas URLs por los endpoints de la API REST correspondiente

export const getProductos = async (): Promise<Product[]> => {
    const response = await fetch("/data/productos.json");
    return response.json();
};

export const getCategorias = async (): Promise<ICategory[]> => {
    const response = await fetch("/data/categorias.json");
    return response.json();
};

export const getUsuarios = async (): Promise<IUser[]> => {
    const response = await fetch("/data/usuarios.json");
    return response.json();
};

export const getPedidos = async (): Promise<Pedido[]> => {
    const response = await fetch("/data/pedidos.json");
    return response.json();
};