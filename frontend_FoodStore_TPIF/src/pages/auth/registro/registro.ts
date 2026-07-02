import type { IUser } from "../../../types/IUser";
import { getUsuarios } from "../../../utils/fetchData";
import { getUsuariosRegistrados, addUsuarioRegistrado, saveUser } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("form-registro") as HTMLFormElement;
const inputNombre = document.getElementById("nombre") as HTMLInputElement;
const inputApellido = document.getElementById("apellido") as HTMLInputElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputCelular = document.getElementById("celular") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;

form.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();

    const nombre = inputNombre.value.trim();
    const apellido = inputApellido.value.trim();
    const email = inputEmail.value.trim();
    const celular = inputCelular.value.trim();
    const password = inputPassword.value.trim();

    if (!EMAIL_REGEX.test(email)) {
        alert("Ingresa un email con formato valido.");
        return;
    }

    if (password.length < 6) {
        alert("La contrasena debe tener al menos 6 caracteres.");
        return;
    }

    const usuariosJson = await getUsuarios();
    const usuariosRegistrados = getUsuariosRegistrados();
    const todosLosUsuarios: IUser[] = [...usuariosJson, ...usuariosRegistrados];

    const yaExiste = todosLosUsuarios.find((u) => u.mail === email);
    if (yaExiste) {
        alert("Ya existe una cuenta con ese email.");
        return;
    }

    const nuevoUsuario: IUser = {
        id: Date.now(),
        nombre: nombre,
        apellido: apellido,
        mail: email,
        celular: celular,
        password: password,
        rol: "USUARIO",
    };

    addUsuarioRegistrado(nuevoUsuario);

    // Auto-login: se guarda el usuario recién creado en la sesión activa (sin password).
    const { password: _password, ...usuarioSinPassword } = nuevoUsuario;
    saveUser(usuarioSinPassword);

    alert(`Cuenta creada correctamente. ¡Bienvenido/a, ${nombre}!`);
    navigate("/src/pages/store/home/home.html");
});