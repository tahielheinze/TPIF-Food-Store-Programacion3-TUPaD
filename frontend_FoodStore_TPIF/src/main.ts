import { navigate } from "./utils/navigate";
import { getUSer } from "./utils/localStorage";
import type { IUser } from "./types/IUser";

const initApp = () => {
    const userGuardado = getUSer();

    // 1. Si no hay sesion iniciada, el usuario va a ver la tienda.
    if (!userGuardado) {
        navigate("/src/pages/store/home/home.html");
        return;
    }

    const user: IUser = JSON.parse(userGuardado);

    // 2. Si hay sesion iniciada, entonces;
    // si es admin va al panel admin directamente.
    if (user.rol === "ADMIN") {
        navigate("/src/pages/admin/dashboard/dashboard.html");
    // si es cliente autenticado va la tienda.
    } else {
        navigate("/src/pages/store/home/home.html");
    }
};

initApp();