# Food Store — Trabajo Final Integrador (Backend JPA)

Proyecto Food Store, Trabajo Práctico Final de Programación 3 — Universidad Tecnológica Nacional - TUPaD UTN.

## Enlace Video
[Explicación del Código]()

## Descripción

Backend del sistema Food Store, desarrollado para gestionar la persistencia de datos mediante el framework JPA/Hibernate. La aplicación permite la administración completa de un sistema de ventas, incluyendo la gestión de productos, categorías, usuarios y el procesamiento transaccional de pedidos.

## Funciones implementadas
- **Gestión de Entidades (CRUD)**
    - Implementación completa de operaciones para Categorías, Productos, Usuarios y Pedidos.
    - Transaccionalidad: Procesamiento de pedidos de forma atómica: alta de pedido, cálculo de subtotales/totales y actualización de stock en una misma transacción.
- **Lógica de Negocio y Reportes**
    - Reportes de ventas por usuario y estado de pedido.
    - Reporte de facturación total consolidada.
    - Baja lógica de productos y categorías.
- **Persistencia Robusta:**
    - Mapeo ORM con Hibernate, utilizando una base de datos local H2.
    - Navegación Relacional: Consultas JPQL optimizadas para la navegación entre entidades (Usuarios <-> Pedidos <-> Detalles).

## Tecnologías Utilizadas
- Java 21
- JPA / Hibernate 6
- H2 Database (Modo archivo: ./data/jpa_db)
- Lombok (Generación automática de código)
- Gradle 8 (Gestión de dependencias)

## Estructura del Proyecto
src/main/java/com/tp/jpa/
├── model/           # Entidades JPA y Enumeraciones
├── repository/      # Capa de acceso a datos (BaseRepository genérico + Repositorios específicos)
├── util/            # Configuración singleton de JPA
└── Main.java        # Menú interactivo de consola

## Instalación y Ejecución
1. **Requisitos:** 
    - Tener instalado el JDK 21 o superior.
2. **Dependencias:**
    - El proyecto utiliza Gradle. No requiere configuraciones externas ya que H2 funciona en modo embebido.
3. **Ejecucion:**
    - Desde la terminal en la raíz del proyecto: ./gradlew run (o gradlew.bat run en Windows).
    - La aplicación iniciará el menú de consola, permitiendo realizar todas las operaciones CRUD y reportes.

## Consideraciones Importantes
- **Transacciones:** El alta de pedidos se ejecuta dentro de un EntityManager único para asegurar la integridad de datos (Atomicidad).
- **Consultas:** Se utiliza JPQL para evitar la sobrecarga de memoria, filtrando los datos directamente en la base de datos.
- **Persistencia:** A diferencia de la parte Frontend, este backend garantiza la persistencia real en disco mediante el archivo de base de datos H2 situado en ./data/jpa_db.
- **Baja Logica:** Las entidades extienden de Base.java, lo que permite marcar registros como eliminado = true sin comprometer la integridad histórica de los pedidos ya realizados.
