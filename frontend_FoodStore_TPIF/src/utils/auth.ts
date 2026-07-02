import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { getUSer, removeUser } from "./localStorage";
import { navigate } from "./navigate";

export const checkAuhtUser = (
  redireccion1: string, // Si no está logueado (Login)
  redireccion2: string, // Si no tiene el rol de la pagina (Escape)
  rol: Rol              // Rol que requiere la página actual
) => {
  console.log("Comienzo de chequeo de autenticación...");

  const user = getUSer();

  if (!user) {
    console.log("No existe usuario en sesión. Redirigiendo al login...");
    navigate(redireccion1);
    return;
  }

  const parseUser: IUser = JSON.parse(user);

  // Si el rol del usuario activo es "admin" tiene pase libre entre la store y el panel.
  if (parseUser.rol === "ADMIN") {
    console.log("Acceso concedido: El usuario es Administrador.");
    return; 
  }

  // Si el rol de la pagina con el del usuario no coincide, se lo redirige.
  if (parseUser.rol !== rol) {
    console.log(`Acceso denegado. Se esperaba rol ${rol}. Redirigiendo...`);
    navigate(redireccion2);
    return;
  }
};

export const logout = () => {
  removeUser();
  navigate("/src/pages/auth/login/login.html");
};
