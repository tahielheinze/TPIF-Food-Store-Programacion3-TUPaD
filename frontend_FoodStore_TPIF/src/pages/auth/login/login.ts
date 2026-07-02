import type { IUser } from "../../../types/IUser";
import { getUsuarios } from "../../../utils/fetchData";
import { saveUser, getUsuariosRegistrados } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("form-login") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;

form.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();

    // Se combinan los usuarios del JSON con los registrados en esta iteracion (guardados en localStorage, ya que el registro no persiste en el archivo usuarios.json).
    const usuariosJson = await getUsuarios();
    const usuariosRegistrados = getUsuariosRegistrados();
    const todosLosUsuarios: IUser[] = [...usuariosJson, ...usuariosRegistrados];

    const usuarioEncontrado = todosLosUsuarios.find(
        (u) => u.mail === email && u.password === password
    );

    if (!usuarioEncontrado) {
        alert("Email o contrasena incorrectos.");
        return;
    }

    // El objeto guardado en localStorage no incluye el password.
    const { password: _password, ...usuarioSinPassword } = usuarioEncontrado;
    saveUser(usuarioSinPassword);

    if (usuarioEncontrado.rol === "ADMIN") {
        navigate("/src/pages/admin/dashboard/dashboard.html");
    } else {
        navigate("/src/pages/store/home/home.html");
    }
});