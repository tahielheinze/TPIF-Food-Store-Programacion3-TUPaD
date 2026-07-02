// Inicializa el comportamiento del menú hamburguesa en mobile.
// Alterna la visibilidad de la nav y anima el ícono del botón.

export const inicializarMenuMovil = () => {
    const btnMenu = document.getElementById("btn-menu-movil") as HTMLButtonElement | null;
    const nav = document.querySelector(".nav") as HTMLElement | null;

    if (!btnMenu || !nav) return;

    btnMenu.addEventListener("click", () => {
        const abierto = nav.classList.toggle("nav--abierto");
        btnMenu.classList.toggle("activo", abierto);
        btnMenu.setAttribute("aria-expanded", String(abierto));
    });
};