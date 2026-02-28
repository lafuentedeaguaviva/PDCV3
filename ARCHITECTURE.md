# Arquitectura MVC (Modelo-Vista-Controlador) en PDCV3

Para garantizar la mantenibilidad, escalabilidad y una clara separación de responsabilidades, el proyecto sigue el patrón de diseño MVC adaptado al ecosistema de Next.js (App Router).

## 1. Modelo (Model) - Capa de Datos
**Ubicación:** `src/services/` y `src/types/`

El Modelo se encarga de la gestión de datos, la comunicación con el backend (Supabase) y la definición de las interfaces de dominio.

- **Servicios (`src/services/`):** Son clases o objetos que encapsulan llamadas a la base de datos. Solo manejan datos y errores, no conocen la UI.
- **Tipos (`src/types/`):** Definen la estructura de los objetos de negocio, asegurando integridad de tipos en toda la aplicación.

## 2. Vista (View) - Capa de Presentación
**Ubicación:** `src/components/` y `src/app/` (JSX)

La Vista es responsable de mostrar los datos al usuario y capturar sus interacciones. Debe ser lo más "tonta" posible.

- **Componentes (`src/components/`):** Componentes visuales reutilizables que reciben datos por `props` y emiten eventos a través de funciones de callback.
- **Átomos/Moléculas:** Seguimos un sistema de diseño atómico para maximizar la consistencia visual.

## 3. Controlador (Controller) - Capa de Lógica
**Ubicación:** `src/hooks/` (Custom Hooks)

El Controlador actúa como puente entre el Modelo y la Vista. Gestiona el estado de la aplicación, las validaciones y los efectos secundarios.

- **Custom Hooks (`src/hooks/`):** Extraen la lógica compleja de las páginas. Proveen a la Vista los datos procesados y las funciones (`handlers`) necesarias.
- **Páginas (`src/app/`):** Actúan como orquestadores mínimos que usan los controladores y renderizan las vistas.

---

## Flujo de Datos
1. El **Controlador** (Hook) solicita datos al **Modelo** (Service).
2. El **Modelo** retorna datos crudos o procesados.
3. El **Controlador** actualiza su estado interno.
4. La **Vista** se re-renderiza con la nueva información proveída por el Controlador.
5. El Usuario interactúa con la **Vista**, que llama a un `handler` del **Controlador**.
