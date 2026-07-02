export type Estado = "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";

export type FormaPago = "TARJETA" | "TRANSFERENCIA" | "EFECTIVO";

export interface DetallePedido {
    idProducto: number;
    cantidad: number;
    subtotal: number;
}

export interface Pedido {
    id: number;
    eliminado: boolean;
    createdAt: string;
    fecha: string;
    estado: Estado;
    total: number;
    formaPago: FormaPago;
    idUsuario: number;
    detalles: DetallePedido[];
}