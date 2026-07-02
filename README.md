# Food Store — Trabajo Final Integrador (Programación 3)

Este proyecto es el Trabajo Final de la materia Programación 3 de la Tecnicatura Universitaria en Programación (TUPaD UTN).
Consiste en un sistema completo de gestión de pedidos de comida, implementado en dos partes independientes que se comunican conceptualmente.

## Enlace Video de Presentación
[Explicación del Código]()

## Arquitectura del Sistema

El sistema se divide en dos grandes pilares para separar la interfaz de usuario de la persistencia de datos:

  1. Frontend Web: Desarrollado con TypeScript y Vite. Gestiona la experiencia del usuario, el catálogo y el carrito de compras.
  2. Backend (Consola): Desarrollado con Java, JPA/Hibernate y base de datos H2. Gestiona la persistencia real de datos, transacciones y lógica de negocio compleja.

## 🖥️ Parte 1: Frontend Web

Interfaz web moderna que permite la interacción completa del cliente y el administrador.
Características Principales:
  - Catálogo Dinámico: Filtrado, búsqueda y ordenamiento de productos.
  - Gestión de Carrito: Persistencia en localStorage y cálculo automático de totales.
  - Autenticación: Sistema de roles (ADMIN / USUARIO) con rutas protegidas.
  - Panel de Administración: Estadísticas, CRUD de entidades y gestión de pedidos.
  - Persistencia (Mock): Actualmente consume datos de archivos JSON locales (preparado para integrarse con API REST).

## ⚙️ Parte 2: Backend (Consola)

Motor de persistencia diseñado para garantizar la integridad y robustez de los datos.
Características Principales:
  - ORM JPA/Hibernate: Mapeo de entidades con base de datos embebida H2.
  - Transaccionalidad: Procesamiento atómico de pedidos (alta de pedido + stock).
  - Lógica Avanzada: Consultas JPQL personalizadas y reportes de ventas.
  - Mantenimiento: Implementación de "Baja Lógica" (soft delete) para preservar el historial de pedidos.

## Tecnologías:
-   Java 21 | JPA / Hibernate 6 | Gradle 8 | H2 Database

## Instalación y Ejecución
### Frontend
  - Instalar dependencias: pnpm install
  - Ejecutar desarrollo: pnpm run dev (Disponible en http://localhost:5173)

### Backend
  - Requisitos: JDK 21 o superior.
  - Ejecución: ./gradlew run (en la raíz del proyecto).

## Consideraciones Importantes
  - Evolución: La capa de fetch en el frontend está aislada y tipada, permitiendo cambiar las URLs a los endpoints del backend con una modificación mínima.
  - Seguridad: El frontend actual es una implementación didáctica; la lógica de persistencia real y seguridad robusta está centralizada en el backend Java.
