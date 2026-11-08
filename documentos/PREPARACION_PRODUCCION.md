# Preparación de la entrega y producción

Este documento reúne lo que puede prepararse con el proyecto y lo que debe confirmarse con la empresa. El Compose incluido es de **desarrollo local**: no representa una instalación de producción ni una política de seguridad aprobada.

## Estado del pipeline

El archivo `.gitlab-ci.yml` compila la solución y el frontend, y ejecuta las pruebas unitarias. Su smoke test prepara SQL Server temporal, aplica migraciones, inicia la API y consulta el endpoint público. La etapa `deploy` está declarada pero **no contiene un trabajo de despliegue**, ni se construyen o publican imágenes de producción desde el pipeline.

El smoke test requiere un runner compatible con imágenes y servicios Docker, capacidad y memoria suficientes para SQL Server, acceso a los registros de imágenes y a NuGet, y posibilidad de ejecutar trabajos sin etiqueta o con las etiquetas que se acuerden. Las credenciales incluidas en ese trabajo son únicamente para una base efímera de prueba; nunca reutilizarlas en un ambiente real. El pipeline real debe validarse en GitLab y adaptar tiempos, etiquetas y recursos al runner disponible.

## Información a solicitar a la empresa

1. Servidor o plataforma de ejecución, sistema operativo, arquitectura, acceso y responsable de la instalación.
2. Runner disponible, ejecutor, etiquetas, permisos, capacidad para servicios y registro de imágenes autorizado.
3. Motor y dirección de SQL Server, autenticación, permisos mínimos, persistencia, cifrado, responsable y frecuencia de respaldos, y prueba de restauración.
4. URL pública, DNS, certificados HTTPS y proxy o balanceador: dónde termina TLS y qué puertos están expuestos.
5. Mecanismo de secretos para JWT, base y Mailjet; responsables de generar, entregar y rotar credenciales sin guardarlas en el repositorio.
6. Remitente validado de Mailjet y dirección HTTPS real del frontend para el recupero de contraseñas.
7. Forma autorizada de aplicar migraciones, crear el primer coordinador, supervisar y revertir un despliegue.

## Configuración que deberá suministrarse

La API necesita `ConnectionStrings__BouwerDatabase`, `Jwt__Key`, `Jwt__Issuer` y `Jwt__Audience`. La clave JWT debe ser aleatoria, privada, estable entre reinicios y compartida solo con las instancias autorizadas. El proyecto tiene valores predeterminados para issuer y audience; confirmar los valores de producción. No publicar los secretos en imágenes, YAML, comandos con historial ni registros.

Para recuperación por correo se necesitan `Mailjet__ApiKey`, `Mailjet__SecretKey`, `Mailjet__FromEmail` y `Frontend__BaseUrl`; se puede definir `Mailjet__FromName`. Fuera de desarrollo, la URL del frontend para el recupero debe usar HTTPS. Probar la entrega real, la caducidad y el uso único del enlace con una cuenta autorizada.

El frontend usa rutas relativas `/api`. El Nginx local reenvía a `api:8080`; verificar el nombre del servicio y la red en el servidor. La API solo permite explícitamente `http://localhost:5173` en CORS: si frontend y API usan el mismo origen mediante proxy, no se necesita CORS entre ellos; si usan orígenes diferentes, hay que configurar y probar una lista explícita de orígenes de producción.

La API usa `UseHttpsRedirection` y limita login y recupero por dirección IP. Si hay un proxy que termina HTTPS, hay que acordar la configuración de encabezados reenviados y direcciones de proxy confiables, y probar redirecciones y límites. No confiar de forma indiscriminada en encabezados recibidos de internet.

La aplicación local usa HTTP y `ASPNETCORE_ENVIRONMENT=Development`. En producción debe utilizarse `Production`, HTTPS válido y una topología que no exponga directamente SQL Server ni puertos administrativos a internet. Swagger está habilitado solo en desarrollo. El límite local de Nginx permite solicitudes de 11 MB y la API valida PDFs de hasta 10 MB: comprobar también los límites de cualquier proxy adicional.

## Datos, acceso y recuperabilidad

Las fichas PDF y los datos médicos se almacenan en SQL Server. Antes de poner en producción, definir permisos de acceso al servidor y a la base, cifrado de comunicaciones y respaldos, retención, monitoreo y una prueba real de restauración. El control del backend limita la consulta de fichas del docente a alumnos de sus actividades y la modificación al coordinador; validar estos casos con usuarios reales de prueba en el entorno definitivo.

No incluir datos personales reales en pruebas o capturas. No registrar tokens, contraseñas temporales, claves de correo ni cadenas de conexión. El frontend guarda el token de sesión en `sessionStorage`; evaluar esta decisión y la protección contra XSS junto con la política de seguridad de la empresa.

## Procedimiento de entrega a validar

1. Obtener una versión aprobada, respaldar la base existente si corresponde y verificar que el respaldo puede restaurarse.
2. Preparar configuración y secretos fuera del código y comprobar que el destino de base es el previsto.
3. Aplicar las migraciones de forma controlada. La API **no aplica migraciones automáticamente**; al iniciar sí ejecuta los seeders de roles y permisos. No iniciar varias tareas de migración simultáneamente.
4. En una base nueva sin coordinadores, ejecutar una vez `Muni-Bouwer.Bootstrap` con acceso administrativo controlado. Verificar el servidor y la base antes de confirmar. Entregar la contraseña temporal por un canal acordado; no se vuelve a mostrar y debe cambiarse al ingresar. La herramienta no crea otro coordinador si ya existe uno, incluso inactivo.
5. Publicar y arrancar los servicios con la infraestructura aprobada. Revisar salud de la API, conectividad con SQL Server y registros sin datos sensibles.
6. Probar con datos de prueba: login, cambio inicial y recupero, creación de docente, actividad, inscripción, asistencia y acceso autorizado y denegado a fichas PDF. Retirar los datos de prueba según el procedimiento de la empresa.
7. Definir quién monitorea, cómo se aplican actualizaciones y qué hacer ante un error. La reversión de código y la restauración o compatibilidad de la base deben planificarse juntas.

El despliegue definitivo no se considera validado hasta ejecutar estas comprobaciones en el entorno real con la empresa.
