# Entrega local para revisión

La base de trabajo es `ded5118`, con Equipo, Líneas y la autenticación del administrador. La distribución usa la misma aplicación Next/Payload en Docker, PostgreSQL 16, MinIO y migraciones versionadas. Las dos imágenes de muestra son ilustraciones ficticias reutilizadas de las vistas previas de Equipo y Líneas.

| Sección | Antes de la entrega | Recorrido disponible |
|---|---|---|
| Equipo | Tarjetas públicas | Directorio, ficha con biografía y líneas. Los correos editoriales son privados. |
| Líneas | Listado y ficha con participantes | Desde una línea se llega también al proyecto y a la publicación. |
| Publicaciones y patentes | Colecciones en Payload | Una sección, dos listados y fichas con autores o inventores. Un artículo puede tener enlace de acceso abierto. |
| Proyectos | Colección | Ficha de financiamiento, fechas, contrato cuando corresponde, personas y líneas. El monto requiere la marca de publicación. |
| Equipamiento | Colección | Equipos, categoría, fotografía, capacidades y consulta de colaboración. |
| Actualidad | Colección Noticias | Noticias y fichas con texto, portada y relaciones. |
| Únete y Contacto | Sin formularios públicos | Envío con consentimiento, confirmación y bandeja Solicitudes en Payload. Nombre, correo y mensaje se cifran con AES-256-GCM. |
| Información y búsqueda | Colección Páginas | Páginas editoriales, aviso de demostración y buscador por campos visibles. Los contenidos de la portada y las introducciones de los formularios se editan en Páginas. |

El editor puede modificar los ejemplos. La preparación usa una transacción de PostgreSQL, un bloqueo entre procesos y una marca persistente para evitar duplicados o la reposición de registros modificados o retirados. El material de muestra se habilita expresamente en el Compose del launcher. Los puertos de PostgreSQL y MinIO quedan internos. Para comprobar el estado del sitio usa el launcher de la misma carpeta.

## Evidencia del ensayo local

En Windows con Docker Desktop y WSL 2, el clon descargado de GitHub se preparó en una carpeta con espacios. El ZIP descargado en otra carpeta rechazó el puerto ya ocupado y explicó cómo seleccionar otro. Cada prueba de escritura usó cuentas y volúmenes exclusivos de demostración.

En Chromium a 390 y 1280 px se recorrieron los enlaces con teclado, los listados, las fichas, la búsqueda y las imágenes. Las ocho colecciones públicas ocultaron una ficha retirada en el listado y devolvieron 404 en su dirección. Los estados de borrador de Línea, Noticia y Página quedaron fuera. Se comprobó que un monto privado se omite en la API y en la ficha.

Una cuenta creada desde el formulario inicial de Payload guardó un cargo. Se detuvo la instalación desde Windows, se confirmó el estado detenido y se volvió a iniciar. Una sesión nueva recuperó el mismo cargo y el mismo SHA-256 del retrato. Los dos formularios entregaron mensajes legibles en Solicitudes y la consulta anónima a la bandeja devolvió 403. Se comprobó el cifrado en PostgreSQL. En la instancia auxiliar se restauró un dump de PostgreSQL en otra base y se recuperaron cinco objetos en otro bucket, comparados por SHA-256. La restauración se ensayó en la misma máquina.

## Límites de esta versión

El buscador consulta campos seleccionados, con hasta 24 coincidencias por colección. Quedan el índice full-text español con relevancia y la traducción editorial al inglés. El importador BibTeX con simulación, deduplicación y reversión, los filtros bibliométricos avanzados y la galería institucional completa quedan para los siguientes hitos. Las secciones y ejemplos son editables. El calendario de publicación automático requiere un ejecutor de tareas en el proveedor. Los formularios reciben mensajes en el panel. La validación legal del aviso, el trámite ARCO, los plazos de conservación y los controles de abuso siguen abiertos antes de recibir información real.

## Primera prueba privada en la nube

| Elemento | Estado comprobado | Qué falta | Quién debe actuar |
|---|---|---|---|
| Acceso y alojamiento | Imagen standalone y Compose local. | Para la demo privada, elegir un VPS Linux, región, techo de gasto y responsables. Restringir acceso a invitados y al operador antes de abrir el primer registro. | Contratante autoriza cuenta y presupuesto. Operador configura. |
| Dominio y TLS | En local solo se publica la app en loopback. | Subdominio de pruebas, DNS y proxy HTTPS con certificado válido en origen. Comprobar redirección, cookies y panel desde otra red. | Titular del DNS y operador. |
| PostgreSQL y migraciones | Instalación nueva desde migraciones. PostgreSQL tiene su volumen propio. | Disco persistente y respaldo externo. Ensayar las migraciones contra una copia comparable al staging y ejecutarlas una sola vez por despliegue. | Operador. |
| Media | MinIO y PostgreSQL usan volúmenes separados. | En el proveedor, configurar bucket privado y credenciales limitadas. Subir por Payload, recuperar por HTTPS y recrear la app. | Operador con acceso al almacenamiento. |
| Secretos y cuentas | Cada copia genera credenciales y clave de cifrado. El operador promueve al primer administrador y Payload exige TOTP. | Designar custodios, autorizar invitados, guardar claves fuera del host y decidir cómo verificar identidad y recuperar al último administrador. | Contratante y responsable de seguridad. |
| Formularios y correo | Únete y Contacto entregan en la bandeja local. | Durante la demo usar datos ficticios. Si se requiere correo o recuperación por email, habilitar SMTP, verificar remitente, entrega y tratamiento de fallos. | Contratante decide canal. Operador lo configura. |
| Errores y restauración | Logs locales. Dump restaurado en otra base y cinco objetos recuperados en otro bucket de la misma máquina. | Probar recuperación en un host separado con la cuenta, un mensaje y la misma imagen. Definir retención, copia fuera del VPS, prueba periódica y alertas con datos sensibles excluidos. | Operador, con objetivos de recuperación acordados. |
| Lanzamiento público | Paleta provisional, localización ES/EN habilitada y controles de CI. | Validar accesibilidad con contenido definitivo, identidad, políticas de privacidad, antispam, compatibilidad Next/Payload, disponibilidad con caída de BD y objetivos de rendimiento. | Laboratorio, responsables de contenido y desarrollo. |

La primera prueba remota debe empezar con la cuenta de la organización y una URL privada HTTPS. Un invitado edita un cargo, sube una imagen con texto alternativo y envía un mensaje ficticio. Otro visitante comprueba la ficha. El operador recrea la app y restaura base, imágenes y claves en un entorno separado. El invitado vuelve a entrar, consulta el mensaje y compara la imagen recuperada. La contratación y el despliegue quedan pendientes de autorización.
