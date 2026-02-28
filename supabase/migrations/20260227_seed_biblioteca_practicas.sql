-- Seed: Biblioteca de Técnicas de Práctica
-- Propósitos: Activación, Exploración, Aplicación, Transferencia, Reflexión

INSERT INTO biblioteca_practicas 
    (proposito, tipo, tecnica, descripcion_concreta, ejemplo_inicial, ejemplo_primaria, ejemplo_secundaria, ejemplo_multigrado, preguntas_generales)
VALUES

-- ===== ACTIVACIÓN =====
(
    'Activación', 'Experiencial', 'Lluvia de Ideas',
    'Los estudiantes expresan libremente sus conocimientos previos sobre el tema sin restricciones. El docente registra todas las ideas en la pizarra sin juzgarlas.',
    'Dibuja en tu cuaderno todo lo que sabes sobre los animales del campo',
    '¿Qué sabes sobre la multiplicación? Di todo lo que recuerdes',
    'Escribe en tarjetas todo lo que sabes sobre la Revolución Industrial',
    'Cada nivel aporta ideas desde su conocimiento y se agrupan por complejidad',
    '¿Qué sabemos del tema? ¿Qué nos gustaría aprender? ¿Qué creemos que es verdad?'
),
(
    'Activación', 'Visual', 'Galería de Imágenes',
    'Se presentan imágenes relacionadas al tema para activar conocimientos previos y generar hipótesis. Los estudiantes observan, interpretan y discuten antes de la instrucción formal.',
    'Observa las fotos de diferentes plantas. ¿Qué ves? ¿Qué crees que aprenderemos hoy?',
    'Observa estas imágenes de fracciones en la vida real. ¿Qué tienen en común?',
    'Analiza estas fotografías históricas: ¿qué contexto social representan?',
    'Cada grupo observa las imágenes y las interpreta desde su nivel de comprensión',
    '¿Qué observas en estas imágenes? ¿Qué historia cuentan? ¿Qué relación tienen con nuestra vida?'
),
(
    'Activación', 'Lúdica', 'El Objeto Misterioso',
    'Se introduce un objeto real o imagen enigmática relacionada con el contenido. Los estudiantes hacen predicciones y preguntas antes de conocer el tema.',
    'Hay algo escondido en esta bolsa. Toca y adivina: ¿qué es? ¿Para qué sirve?',
    'Este objeto tiene que ver con lo que aprenderemos. ¿Qué crees que es y por qué?',
    'Este artefacto fue usado hace 100 años. Investiga: ¿cuál era su función?',
    'Los más pequeños tocan y describen; los mayores investigan y presentan hipótesis',
    '¿Qué sensaciones tuviste? ¿Qué predices? ¿Cómo llegaste a esa conclusión?'
),
(
    'Activación', 'Colaborativa', 'Caminata de Galería',
    'Se colocan preguntas o afirmaciones en las paredes del aula. Los estudiantes circulan, leen y anotan sus respuestas o comentarios en cada estación.',
    'Visita cada dibujo en la pared y pon un sticker donde más te guste',
    'Responde la pregunta de cada cartel con una palabra o dibujo',
    'Comenta o debate cada afirmación con evidencias en los carteles',
    'Roles diferenciados: los pequeños dibujan, los mayores argumentan por escrito',
    '¿Con cuál afirmación estás más de acuerdo? ¿Qué te sorprendió de las respuestas de tus compañeros?'
),

-- ===== EXPLORACIÓN =====
(
    'Exploración', 'Investigativa', 'Estudio de Caso',
    'Los estudiantes analizan una situación real o hipotética relacionada con el contenido, identificando problemas, causas y posibles soluciones de manera colaborativa.',
    'Leemos el cuento de los tres cerditos y buscamos el problema principal',
    'Analiza este problema matemático de la vida real y busca la solución',
    'Estudia este caso de conflicto ambiental y propón soluciones fundamentadas',
    'Los de inicial identifican el problema; los de primaria buscan causas; secundaria propone soluciones',
    '¿Cuál es el problema central? ¿Qué lo causó? ¿Qué harías tú en esa situación?'
),
(
    'Exploración', 'Experimental', 'Observación Científica',
    'Los estudiantes observan un fenómeno, objeto o proceso natural usando los sentidos o instrumentos. Registran sus observaciones y sacan conclusiones.',
    'Observa las semillas con la lupa. ¿Qué ves? Dibuja lo que encuentras',
    'Mide el crecimiento de tu planta cada semana y registra los cambios',
    'Diseña y ejecuta un experimento para comprobar la hipótesis planteada',
    'Todos observan el mismo fenómeno pero registran y analizan según su nivel',
    '¿Qué observaste? ¿Qué cambió? ¿Qué conclusión puedes sacar de lo que viste?'
),
(
    'Exploración', 'Digital', 'Búsqueda Guiada',
    'Los estudiantes investigan un tema usando recursos digitales o bibliográficos con preguntas guía del docente. Organizan y presentan la información encontrada.',
    'Con ayuda del docente, busca imágenes de animales del desierto y describe uno',
    'Busca información sobre un país y completa la ficha geográfica',
    'Investiga en fuentes diversas y elabora un informe comparativo con citas',
    'Los pequeños buscan imágenes; los mayores leen textos y sintetizan información',
    '¿Qué fuentes consultaste? ¿Cómo sabés que la información es confiable? ¿Qué descubriste de nuevo?'
),
(
    'Exploración', 'Colaborativa', 'Rompecabezas de Expertos (Jigsaw)',
    'Se divide el tema en partes. Cada grupo se convierte en experto de una parte y luego enseña a los demás. Promueve la interdependencia positiva y el aprendizaje activo.',
    'Cada grupo aprende cómo vive un animal diferente y lo cuenta a la clase',
    'Cada equipo estudia un país y explica su cultura al resto del salón',
    'Grupos de expertos investigan diferentes causas de un fenómeno y las comparten',
    'Los de mayor nivel coordinan; los de menor nivel aportan desde sus competencias',
    '¿Qué aprendiste de tu grupo? ¿Qué te resultó más difícil de explicar? ¿Qué añadirías?'
),

-- ===== APLICACIÓN =====
(
    'Aplicación', 'Práctica', 'Resolución de Problemas',
    'Los estudiantes aplican el conocimiento adquirido para resolver situaciones nuevas, similares o más complejas que las trabajadas durante la teoría.',
    'Encuentra cuántas manzanas hay en total uniendo los grupos',
    'Resuelve estos tres problemas usando la estrategia que aprendimos hoy',
    'Aplica el teorema de Pitágoras para calcular la altura del edificio en el plano',
    'Problemas diferenciados por complejidad según el nivel de cada estudiante',
    '¿Cómo llegaste a esa respuesta? ¿Podrías resolverlo de otra manera? ¿Qué pasaría si...?'
),
(
    'Aplicación', 'Creativa', 'Producción de Texto',
    'Los estudiantes crean un texto propio (cuento, carta, noticia, poema) aplicando las habilidades lingüísticas trabajadas. El proceso incluye planificación, escritura y revisión.',
    'Dibuja y dicta una historia de 3 momentos: inicio, problema y final',
    'Escribe una carta a un personaje histórico usando el formato aprendido',
    'Redacta un artículo de opinión con argumentos y contra-argumentos',
    'Cada nivel produce textos de diferente extensión y complejidad con el mismo tema',
    '¿Qué quisiste comunicar? ¿A quién va dirigido tu texto? ¿Qué cambiarías si pudieras?'
),
(
    'Aplicación', 'Manual', 'Construcción de Modelo',
    'Los estudiantes construyen un modelo, maqueta o prototipo para representar un concepto abstracto de manera concreta y tangible.',
    'Construye un volcán con plastilina y explica sus partes',
    'Construye una maqueta del sistema solar con materiales reciclados',
    'Diseña y construye un prototipo que solucione un problema identificado',
    'Cada nivel aporta según sus habilidades motrices y conceptuales al proyecto grupal',
    '¿Qué parte fue más difícil de construir? ¿Qué representa cada parte del modelo? ¿Qué mejorarías?'
),
(
    'Aplicación', 'Lúdica', 'Juego de Roles',
    'Los estudiantes asumen roles o personajes específicos para simular situaciones reales o históricas. Pone en práctica habilidades comunicativas y empatía.',
    'Juega a ser el doctor y explica cómo lavarse las manos correctamente',
    'Simula una feria de ciencias donde eres el expositor de tu experimento',
    'Representa un juicio histórico asumiendo el rol de distintos protagonistas',
    'Los mayores guían a los menores en el juego explicando las reglas y conceptos',
    '¿Cómo te sentiste en ese rol? ¿Qué aprendiste de los otros roles? ¿Fue realista la simulación?'
),

-- ===== TRANSFERENCIA =====
(
    'Transferencia', 'Reflexiva', 'Proyecto Integrador',
    'Los estudiantes aplican conocimientos de varias áreas para resolver un problema o crear un producto que tenga impacto real en su comunidad o contexto.',
    'Crea un libro de recetas saludables de tu comunidad con dibujos',
    'Diseña un folleto informativo sobre el cuidado del agua para tu barrio',
    'Desarrolla un proyecto de emprendimiento social que responda a una necesidad real',
    'Cada nivel contribuye desde su área de fortaleza en un proyecto compartido',
    '¿A quién beneficia tu proyecto? ¿Qué conocimientos usaste de otras materias? ¿Qué impacto tendría?'
),
(
    'Transferencia', 'Comunitaria', 'Conexión con la Comunidad',
    'Los estudiantes llevan el conocimiento fuera del aula conectándolo con personas, espacios o problemas reales de su comunidad local.',
    'Entrevista a un adulto de tu familia sobre cómo era la escuela antes',
    'Investiga un oficio o tradición de tu comunidad y preséntala en clase',
    'Realiza una propuesta de mejora para un espacio público de tu barrio',
    'Todos participan en la entrevista o visita según sus posibilidades comunicativas',
    '¿Qué aprendiste de tu comunidad? ¿Cómo puedes aportar a mejorarla? ¿Qué valores encontraste?'
),

-- ===== REFLEXIÓN =====
(
    'Reflexión', 'Metacognitiva', 'Semáforo de Aprendizaje',
    'Los estudiantes evalúan su propio nivel de comprensión usando colores: verde (entendí todo), amarillo (tengo dudas), rojo (no entendí). Permite al docente regular la clase.',
    'Colorea el semáforo según cómo te sentiste aprendiendo hoy',
    'Escribe una pregunta que todavía tienes sobre el tema de hoy',
    'Explica con tus palabras qué aprendiste y qué aún no tienes claro',
    'Cada nivel usa el semáforo pero con formas de expresión diferentes',
    '¿Qué fue lo más difícil? ¿Qué estrategia te funcionó mejor? ¿Qué necesitas repasar?'
),
(
    'Reflexión', 'Escrita', 'Diario de Aprendizaje',
    'Los estudiantes escriben o dibujan reflexiones sobre su proceso de aprendizaje al final de cada sesión. Desarrolla la metacognición y la autoevaluación.',
    'Dibuja lo que aprendiste hoy y lo que te gustó más de la clase',
    'Escribe 3 cosas que aprendiste, 2 que ya sabías y 1 pregunta que tienes',
    'Reflexiona por escrito: ¿qué estrategias usé? ¿qué cambiaría de mi proceso?',
    'Formato diferenciado: dibujo para inicial, párrafo breve para primaria, ensayo para secundaria',
    '¿Cómo cambió lo que pensabas antes con lo que sabes ahora? ¿Para qué te sirve en tu vida?'
),
(
    'Reflexión', 'Grupal', 'Círculo de Cierre',
    'La clase se organiza en círculo para compartir aprendizajes, emociones y propósitos. Cierra la sesión promoviendo la escucha activa y la conexión emocional con el saber.',
    'Sentados en círculo, cada uno dice con una palabra: ¿cómo nos fue hoy?',
    'Comparte con el grupo: ¿qué aprendiste y cómo lo usarás fuera de la escuela?',
    'Debate reflexivo: ¿qué implicaciones tiene lo aprendido para nuestra sociedad?',
    'Cada nivel aporta desde su perspectiva enriqueciendo la reflexión colectiva',
    '¿Qué te llevas de hoy? ¿Qué te gustaría investigar más? ¿Cómo conecta esto con tu vida?'
);
