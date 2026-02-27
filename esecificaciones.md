ESPECIFICACIÓN DE REQUISITOS DEL SISTEMA
Sistema de Planificación Curricular para Unidades Educativas
ÍNDICE

    Introducción

    Objetivos del Sistema

    Actores del Sistema

    Requisitos Funcionales

    Requisitos No Funcionales

    Módulos del Sistema

    Flujos de Trabajo

    Reglas de Negocio

    Restricciones Técnicas

    Glosario de Términos

1. INTRODUCCIÓN
1.1. Propósito del Sistema

El sistema tiene como objetivo gestionar la planificación curricular de unidades educativas, permitiendo a docentes crear y modificar sus planes de desarrollo curricular, a directores supervisar dichas planificaciones, y a administradores gestionar la estructura académica y los contenidos base.
1.2. Alcance

El sistema cubre desde la organización  (departamentos, distritos, unidades educativas) hasta la planificación detallada por semana, incluyendo contenidos, momentos, recursos, criterios de evaluación y adaptaciones curriculares.
1.3. Contexto

Basado en un modelo educativo multigrado y multiárea, con control de versiones, compartición de contenidos y un sistema de créditos para operaciones clave.
2. OBJETIVOS DEL SISTEMA
2.1. Objetivo General

Desarrollar una plataforma integral para la planificación curricular que facilite el trabajo de docentes, la supervisión de directores y la administración del sistema.
2.2. Objetivos Específicos

    Gestionar usuarios con múltiples roles (Administrador, Director, Profesor)

    Organizar la estructura de unidades educativas
    Permitir generar cuatro tipos de PDC : Inicial, Primaria, Secundaria, Multigrado.

    Mantener un catálogo académico completo (niveles, grados, áreas de conocimiento)

    Proveer contenidos base como plantillas oficiales

    Permitir a docentes crear y modificar sus propios contenidos

    Facilitar la compartición de contenidos entre docentes

    Gestionar áreas de trabajo con múltiples paralelos y horarios

    Planificar por semanas con contenidos, momentos y recursos

    Establecer criterios de evaluación por área

    Registrar adaptaciones curriculares por semana

    Implementar un sistema de créditos para transacciones

3. ACTORES DEL SISTEMA
3.1. Administrador

    Descripción: Usuario con acceso total al sistema

    Responsabilidades:

        Gestionar usuarios y asignación de roles

        Crear y mantener contenidos base (plantillas oficiales)

        Gestionar la estructura  (departamentos, distritos, unidades educativas)

        Administrar catálogos académicos (niveles, grados, áreas, turnos, paralelos)

        Supervisar transacciones de créditos

        Asignar directores a unidades educativas

3.2. Director

    Descripción: Usuario que supervisa una o más unidades educativas

    Responsabilidades:

        Revisar planificaciones de los docentes de su unidad

        Verificar el cumplimiento de contenidos y criterios

        Consultar estadísticas y reportes de planificación

        Gestionar información de su unidad educativa

3.3. Profesor

    Descripción: Usuario principal que realiza la planificación curricular

    Responsabilidades:

        Completar su perfil personal

        Crear y gestionar sus propias áreas de trabajo

        Asignar paralelos y horarios a sus áreas

        Crear contenidos propios (desde cero o copiando de base/compartidos)

        Compartir contenidos con otros docentes
        Crear los  Tios de PDC


        Planificar semanas con contenidos, momentos y recursos

        Definir criterios de evaluación para sus áreas

        Registrar adaptaciones curriculares cuando sea necesario

3.4. Sistema

    Descripción: Acciones automáticas del sistema

    Responsabilidades:

        Crear perfil automáticamente al registrar usuario

        Asignar rol de Profesor por defecto

        Registrar transacciones de créditos

        Mantener integridad referencial de datos

        Aplicar políticas de seguridad (RLS)

4. REQUISITOS FUNCIONALES
4.1. Módulo de Usuarios y Roles
ID	Requisito	Prioridad
RF-01	El sistema debe permitir el registro de usuarios mediante Supabase Auth	Alta
RF-02	Cada usuario debe tener un perfil con datos personales	Alta
RF-03	El perfil debe incluir: título, nombres, apellidos, email, celular, foto	Alta
RF-04	El sistema debe asignar automáticamente el rol de Profesor al registrarse	Alta
RF-05	Los roles disponibles son: Administrador, Director, Profesor	Alta
RF-06	Un usuario puede tener múltiples roles	Media
RF-07	Solo Administradores pueden asignar rol de Director	Alta
RF-08	Los usuarios pueden editar su propio perfil	Alta
RF-09	Los Directores pueden ver perfiles de docentes de su unidad	Media
4.2. Módulo Unidad Educativa
ID	Requisito	Prioridad
RF-10	El sistema debe gestionar Departamentos	Alta
RF-11	Cada Departamento contiene múltiples Distritos	Alta
RF-12	Cada Distrito contiene múltiples Unidades Educativas	Alta
RF-13	Las Unidades Educativas tienen: nombre, código, dirección, teléfono	Alta
RF-14	Cada Unidad Educativa puede tener un Director asignado	Alta
RF-15	Solo Administradores pueden crear/modificar estructura geográfica	Alta
4.3. Módulo Académico Base
ID	Requisito	Prioridad
RF-16	El sistema debe gestionar Niveles (Inicial, Primaria, Secundaria)	Alta
RF-17	Cada Nivel contiene múltiples Grados (1ro, 2do, etc.)	Alta
RF-18	Cada Grado tiene múltiples Áreas de Conocimiento	Alta
RF-19	Las Áreas de Conocimiento tienen nombre y descripción	Alta
RF-20	El sistema debe gestionar Turnos (Mañana, Tarde, Noche)	Alta
RF-21	El sistema debe gestionar Paralelos (A, B, C, D, E)	Alta
4.4. Módulo de Contenidos Base
ID	Requisito	Prioridad
RF-22	Los contenidos base son plantillas oficiales del sistema	Alta
RF-23	Solo Administradores pueden crear/modificar contenidos base	Alta
RF-24	Los contenidos base se organizan jerárquicamente (temas/subtemas)	Alta
RF-25	Cada contenido base pertenece a un Área de Conocimiento	Alta
RF-26	Todos los usuarios pueden ver contenidos base	Alta
4.5. Módulo de Contenidos de Usuario
ID	Requisito	Prioridad
RF-27	Los profesores pueden crear contenidos propios	Alta
RF-28	Los profesores pueden copiar contenidos base como punto de partida	Alta
RF-29	Los profesores pueden copiar contenidos compartidos por otros	Media
RF-30	Los contenidos de usuario se organizan jerárquicamente	Alta
RF-31	Los profesores pueden compartir sus contenidos con otros usuarios	Media
RF-32	Los contenidos pueden comartirse	Baja
RF-33	Cada contenido registra su origen (base, compartido, propio)	Media
4.6. Módulo de Áreas de Trabajo
ID	Requisito	Prioridad
RF-34	Un profesor puede tener múltiples áreas de trabajo	Alta
Cada Area de trabajo tiene turno
RF-35	Cada área de trabajo combina: Unidad, Área, Turno	Alta
RF-36	Un área puede tener múltiples paralelos	Alta
RF-37	Cada paralelo en un área tiene su propio horario (JSON)	Alta
RF-38	Un área puede tener un contenido asignado	Media
RF-39	Un profesor puede modificar paralelos y horarios	Alta
4.7. Módulo de Planificación Semanal
ID	Requisito	Prioridad
El sistema debe ermitir crear PDC de cualquier tio
RF-40	El sistema debe gestionar semanas por gestión, trimestre, mes,semana	Alta
RF-41	Una semana tiene fechas de inicio y fin	Alta
RF-42	Un área puede tener múltiples contenidos en una misma semana	Alta
RF-43	Los contenidos en una semana tienen un orden	Alta
RF-44	Cada contenido en una semana tiene estado (pendiente, planificado, completado)	Media
RF-45	Se pueden agregar observaciones por contenido-semana	Media
4.8. Módulo de Momentos
ID	Requisito	Prioridad
RF-46	Cada contenido en una semana puede tener múltiples momentos	Alta
RF-47	Los tipos de momento son: práctica, teoría, producción, valoración	Alta
RF-48	Cada momento tiene descripción y orden	Alta
4.9. Módulo de Recursos
ID	Requisito	Prioridad
RF-49	El sistema debe gestionar tipos de recurso (Libro, Video, etc.)	Media
RF-50	Los recursos tienen título, autor, editorial, año, ISBN, URL	Media
RF-51	Se pueden asignar recursos a un contenido-semana	Media
RF-52	Los recursos son reutilizables en múltiples semanas	Media
4.10. Módulo de Evaluación
ID	Requisito	Prioridad
RF-53	Cada área de trabajo puede tener múltiples criterios de evaluación	Alta
RF-54	Los criterios tienen dimensión (ser, saber, hacer)	Alta
RF-55	Los criterios tienen descripción y orden	Alta
RF-56	Los criterios pueden activarse/desactivarse	Media
4.11. Módulo de Adaptaciones Curriculares
ID	Requisito	Prioridad
RF-57	Cada contenido-semana puede tener múltiples adaptaciones	Media
RF-58	Las adaptaciones tienen tipo, descripción, recursos y criterios adaptados	Media
RF-59	Las adaptaciones son específicas por contenido-semana	Media
4.12. Módulo de Créditos
ID	Requisito	Prioridad
RF-60	Cada usuario tiene un saldo de créditos	Baja
RF-61	Se registran transacciones de créditos (carga/gasto)	Baja
RF-62	Cada transacción tiene motivo y referencia	Baja
RF-63	Los usuarios pueden ver sus propias transacciones	Baja
5. REQUISITOS NO FUNCIONALES
5.1. Seguridad
ID	Requisito	Prioridad
RNF-01	La autenticación debe gestionarse mediante Supabase Auth	Alta
RNF-02	Implementar Row Level Security (RLS) en todas las tablas	Alta
RNF-03	Los usuarios solo pueden acceder a sus propios datos	Alta
RNF-04	Las contraseñas deben almacenarse de forma segura	Alta
RNF-05	Las políticas de seguridad deben aplicarse por rol	Alta
5.2. Rendimiento
ID	Requisito	Prioridad
RNF-06	Las consultas deben responder en menos de 2 segundos	Alta
RNF-07	Implementar índices en campos de búsqueda frecuente	Alta
RNF-08	Optimizar consultas con vistas materializadas si es necesario	Media
5.3. Escalabilidad
ID	Requisito	Prioridad
RNF-09	El sistema debe soportar múltiples unidades educativas	Alta
RNF-10	Debe permitir crecimiento en número de usuarios	Alta
RNF-11	La estructura debe ser flexible para nuevos requisitos	Media
5.4. Usabilidad
ID	Requisito	Prioridad
RNF-12	Interfaz intuitiva y responsive	Alta
RNF-13	Validación de datos en tiempo real	Media
RNF-14	Mensajes de error claros y descriptivos	Media
5.5. Mantenibilidad
ID	Requisito	Prioridad
RNF-15	Código documentado y estructurado	Alta
RNF-16	Uso de convenciones de nomenclatura consistentes	Alta
RNF-17	Separación clara de responsabilidades	Alta
6. MÓDULOS DEL SISTEMA
6.1. Estructura de Módulos
text

SISTEMA DE PLANIFICACIÓN CURRICULAR
├── Módulo 1: Usuarios y Roles
│   ├── Gestión de Perfiles
│   ├── Asignación de Roles
│   └── Autenticación
│
├── Módulo 2: Unidad Educativa
│   ├── Departamentos
│   ├── Distritos
│   └── Unidades Educativas
│
├── Módulo 3: Estructura Académica
│   ├── Niveles
│   ├── Grados
│   ├── Áreas de Conocimiento
│   ├── Turnos
│   └── Paralelos
│
├── Módulo 4: Contenidos
│   ├── Contenidos Base (Admin)
│   ├── Contenidos de Usuario
│   └── Compartición de Contenidos
│
├── Módulo 5: Áreas de Trabajo
│   ├── Asignación de Áreas
│   ├── Gestión de Paralelos
│   └── Horarios
│
├── Módulo 6: Planificación Semanal
│   ├── Semanas
│   ├── Asignación de Contenidos
│   └── Estados
│
├── Módulo 7: Momentos
│   ├── Práctica
│   ├── Teoría
│   ├── Producción
│   └── Valoración
│
├── Módulo 8: Recursos
│   ├── Tipos de Recurso
│   ├── Gestión de Recursos
│   └── Asignación a Semanas
│
├── Módulo 9: Evaluación
│   ├── Criterios de Evaluación
│   └── Dimensiones (Ser, Saber, Hacer)
│
├── Módulo 10: Adaptaciones Curriculares
│   └── Adaptaciones por Semana

Modulo 10 PDC
  Imrimir descargar word o df Pdc
│
└── Módulo 11: Créditos
    ├── Saldo de Usuarios
    └── Transacciones

7. FLUJOS DE TRABAJO
7.1. Flujo de Registro de Usuario
text

1. Usuario se registra en Supabase Auth
2. Trigger crea registro en tabla perfiles
3. Sistema asigna rol de Profesor por defecto
4. Usuario completa su perfil (título, nombres, apellidos, celular)
5. Administrador puede asignar roles adicionales (Director)
6. Si es Director, se asigna a una Unidad Educativa

7.2. Flujo de Creación de Área de Trabajo
text

1. Profesor accede al sistema
2. Selecciona "Nueva Área de Trabajo"
3. Selecciona Unidad Educativa, Área de Conocimiento, Turno
4. Guarda el área
5. Agrega paralelos con sus horarios específicos
6. El área queda disponible para planificación

7.3. Flujo de Creación de Contenido
text

OPCIÓN A: Desde Cero
1. Profesor selecciona "Nuevo Contenido"
2. Ingresa título, descripción, orden
3. Guarda como contenido propio

OPCIÓN B: Copiar de Base
1. Profesor navega contenidos base
2. Selecciona "Copiar"
3. Sistema crea copia en contenidos_usuario
4. Profesor puede modificar título/descripción

OPCIÓN C: Copiar Compartido
1. Profesor ve contenidos compartidos con él
2. Selecciona "Copiar"
3. Sistema crea copia en contenidos_usuario
4. Profesor puede modificar

7.4. Flujo de Planificación Semanal
text

1. Profesor selecciona un área de trabajo
2. Visualiza semanas del calendario
3. Para una semana específica, selecciona "Agregar Contenido"
4. Elige contenido de su biblioteca
5. Define orden y observaciones
6. Agrega momentos (práctica, teoría, etc.)
7. Asigna recursos si es necesario
8. Marca estado (planificado)
9. Puede agregar adaptaciones curriculares

7.5. Flujo de Supervisión de Director
text

1. Director accede al sistema
2. Visualiza lista de docentes de su unidad
3. Selecciona un docente
4. Ve planificaciones por semana
5. Puede filtrar por área, fecha, estado
6. Genera reportes si es necesario

8. REGLAS DE NEGOCIO
8.1. Reglas de Usuarios y Roles
ID	Regla
RN-01	Todo usuario registrado tiene rol de Profesor por defecto
RN-02	Un usuario puede ser Director de una sola unidad educativa
RN-03	Solo Administradores pueden crear otros Administradores
RN-04	Un Director no puede ser Administrador
8.2. Reglas de Estructura Académica
ID	Regla
RN-05	Un grado pertenece a un único nivel
RN-06	Un área de conocimiento pertenece a un único grado
RN-07	Un paralelo puede tener el mismo nombre en diferentes unidades
RN-08	Los turnos son fijos (Mañana, Tarde, Noche)
8.3. Reglas de Contenidos
ID	Regla
RN-09	Los contenidos base solo pueden ser modificados por Administradores
RN-10	Un contenido de usuario puede tener un solo origen (base o usuario)
RN-11	Un contenido compartido debe tener autorización del propietario
RN-12	Los contenidos públicos son visibles para todos
8.4. Reglas de Áreas de Trabajo
ID	Regla
RN-13	Un profesor no puede tener dos áreas con misma unidad, área y turno
RN-14	Un área puede tener múltiples paralelos
RN-15	Cada paralelo en un área tiene su propio horario
RN-16	Un área puede tener un solo contenido activo
8.5. Reglas de Planificación
ID	Regla
RN-17	Una semana se identifica por gestión, trimestre, mes y semana
RN-18	Un contenido no puede estar dos veces en la misma semana para un área
RN-19	Los momentos tienen un orden secuencial
RN-20	Los criterios de evaluación se definen por área, no por semana
9. RESTRICCIONES TÉCNICAS
9.1. Plataforma

    Base de datos: PostgreSQL (Supabase)

    Autenticación: Supabase Auth

    Almacenamiento: Supabase Storage para archivos

    Tiempo real: Supabase Realtime (opcional)

9.2. Base de Datos

    Uso de UUID como identificadores primarios

    Campos de tipo TIMESTAMPTZ para fechas

    JSONB para datos flexibles (horarios, metadatos)

    Índices en campos de búsqueda frecuente

    Políticas RLS obligatorias

9.3. Seguridad

    Todas las tablas deben tener RLS habilitado

    Las funciones sensibles deben ser SECURITY DEFINER

    Las contraseñas nunca se almacenan en tablas públicas

    Validación de datos en el servidor

9.4. Integraciones

    Supabase Auth para gestión de usuarios

    Supabase Storage para archivos (fotos, recursos)

    Posible integración con IA para sugerencias (futuro)

10. GLOSARIO DE TÉRMINOS
Término	Definición
Administrador	Usuario con acceso total al sistema
Director	Usuario que supervisa una unidad educativa
Profesor	Usuario que realiza planificación curricular
Perfil	Conjunto de datos personales del usuario
Rol	Función que desempeña un usuario en el sistema
Departamento	División geográfica principal
Distrito	Subdivisión geográfica dentro de un departamento
Unidad Educativa	Escuela o colegio
Nivel	Inicial, Primaria, Secundaria
Grado	1ro, 2do, 3ro, etc. dentro de un nivel
Área de Conocimiento	Materia o asignatura (Matemáticas, Lenguaje)
Turno	Mañana, Tarde, Noche
Paralelo	División de un grado (A, B, C)
Contenido Base	Plantilla oficial creada por administrador
Contenido Usuario	Contenido creado o modificado por profesor
Área de Trabajo	Asignación de profesor a un área específica
Semana	Período de planificación (con fechas)
Momento	Etapa de una clase (práctica, teoría, producción, valoración)
Recurso	Material educativo (libro, video, etc.)
Criterio de Evaluación	Estándar para evaluar aprendizaje
Dimensión	Aspecto de evaluación (ser, saber, hacer)
Adaptación Curricular	Ajuste para estudiantes con necesidades especiales
Crédito	Unidad de valor para transacciones en el sistema
RLS	Row Level Security - Seguridad a nivel de fila