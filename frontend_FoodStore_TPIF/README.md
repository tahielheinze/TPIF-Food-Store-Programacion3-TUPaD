# Food Store - TPIF - Frontend

Proyecto Frontend para **Food Store**, Trabajo Practico Final de Programación 3 - Universidad Tecnológica Nacional - TUPaD UTN.

## Enlace Video
[Explicación del Código]()

## Descripción
Aplicación que permite a los usuarios navegar por un catálogo de productos, filtrar por categorías, buscar productos por nombre y gestionar un carrito de compras interactivo con persistencia de datos en local storage.

## Funciones implementadas
- **Catálogo Dinamico**: 
    - Renderizado de productos desde una fuente de datos centralizada.
- **Carrito de Compras**:
    - Agregar productos
    - Persistencia en `localstorage`.
    - Cálculo automático del total.
    - Vaciar carrito.
- **Búsqueda y Filtros**:
    - Buscador por nombre de producto.
    - Menú lateral de categorias con opción de "Ver Todo"
    - Ordenamiento de productos: A-Z, Z-A, menor precio y mayor precio.
- **Autenticación y Roles**:
    - Login y registro contra `usuarios.json` (con auto-login al registrarse).
    - Rutas protegidas según rol (ADMIN / USUARIO).
- **Panel de Administración**:
    - Dashboard con estadísticas generales.
    - CRUD de Categorías y Productos.
    - Gestión de Pedidos con cambio de estado.
- **Mis Pedidos**: historial de compras filtrado por usuario logueado.

## Tecnologías Utilizadas
- HTML5 / CSS3
- JavaScript / TypeScript
- Vite como entorno de desarrollo.

## Instalación y Ejecución
1. **Instalar el gestor de paquetes:** Usamos `pnpm` como gestor de paquetes.
2. **Instalar dependencias:** Usar `pnpm` para la gestión de paquetes.
3. **Ejecutar el servidor de Desarrollo:**
   - El servidor de desarrollo estará disponible en http://localhost:5173.

## Credenciales de Prueba

|   Rol   |       Email      | Contraseña |
|---------|------------------|------------|
| ADMIN   | admin@admin.com  | 123456     |
| USUARIO | cliente@food.com | cliente123 |

> Nota: Se puede crear un nuevo usuario desde el registro, queda guardado en el localStorage con el rol de USUARIO.

## Consideraciones Importantes
- **Costo de envío:** se utiliza una constante fija `ENVIO = 500`, definida en `src/utils/config.ts`. El total del pedido se calcula como `subtotal + ENVIO`.
- Este proyecto **no implementa seguridad real**: las contraseñas se comparan en texto plano contra los JSON, no hay tokens, y la validación de rol depende de `localStorage`
- Las operaciones de escritura (alta, edición, baja) sobre categorías, productos y pedidos se aplican únicamente en memoria: al recargar la página se pierde el estado modificado. 
- Los usuarios registrados y los pedidos generados durante el uso sí persisten en `localStorage` entre sesiones.

## Estructura del Proyecto

final-prog3/
├── index.html # Redirección a login
├── package.json # Dependencias y scripts
├── tsconfig.json # Configuración TypeScript
├── vite.config.ts # Configuración Vite
└── src/
├── main.ts # Punto de entrada
├── css/ style.css # Estilos globales
├── types/ # Definiciones de tipos TypeScript
├── utils/ # Utilidades y helpers (fetch, auth, cart)
└── pages/
├── auth/ # Login y registro
│ ├── login/
│ └── register/
├── store/ # Páginas del cliente
│ ├── home/ # Catálogo de productos
│ ├── productDetail/
│ └── cart/ # Carrito de compras
├── client/ # Área del cliente
│ └── orders/ # Mis pedidos
└── admin/ # Panel de administración
    ├── dashboard/ # Dashboard
    ├── categorias/ # CRUD categorías
    └── pedidos/ # CRUD productos