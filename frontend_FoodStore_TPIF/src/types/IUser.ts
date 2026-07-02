import type { Rol } from "./Rol";

export interface IUser {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  password: string;
  rol: Rol;
}

// Usuario tal como se guarda en localStorage
export type SessionUser = Omit<IUser, "password">;
