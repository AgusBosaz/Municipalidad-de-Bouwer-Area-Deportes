# Recupero de contraseña con Mailjet

El recupero por correo está disponible para coordinadores y docentes activos que tengan un email cargado. Los estudiantes no inician sesión y no usan este flujo.

**Mailjet es opcional para levantar la aplicación y usar el login.** Si no se configura, la solicitud de recupero responde `503` y las demás funciones siguen disponibles. Para probar o entregar el recupero por correo, sí hay que completar los pasos siguientes.

## 1. Preparar la base local

Seguir primero la [guía de desarrollo](GUIA_DESARROLLO.md) para configurar la conexión a SQL Server y la clave JWT. Desde la raíz del repositorio, aplicar las migraciones compartidas:

```powershell
dotnet tool run dotnet-ef database update --project Backend/Muni-Bouwer.Data/Muni-Bouwer.Data.csproj --startup-project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
```

Este comando incluye `AddUserEmail` y `AddPasswordRecovery`. Se puede volver a ejecutar: EF Core aplica solo las migraciones que faltan. Las migraciones no se ejecutan al iniciar la API.

## 2. Preparar la cuenta y el remitente en Mailjet

1. Crear una cuenta de Mailjet o acceder a una cuenta del proyecto. Para la entrega, la cuenta y el correo remitente deben quedar bajo control del municipio.
2. En Mailjet, abrir **Account Settings → Senders & Domains** y elegir **Add a sender address**.
3. Escribir un nombre para identificar el remitente y una dirección de correo a la que se tenga acceso. Seleccionar **Website emails**: incluye los correos de contraseñas olvidadas.
4. Abrir el mensaje de verificación en esa casilla, confirmar el enlace y comprobar que el remitente figure como **Active**. No alcanza con haberlo agregado; debe estar validado.

Mailjet permite validar una dirección individual sin comprar un dominio. Sin embargo, [advierte que un remitente Gmail, Outlook u otro correo gratuito puede llegar a spam o no entregarse](https://documentation.mailjet.com/hc/en-us/articles/360042759253-How-to-add-a-sender-address). Probar la recepción real antes de depender de este mecanismo.

## 3. Obtener las credenciales de Mailjet

En **API Key Management**, obtener la **API Key** y la **Secret Key** correspondientes a la cuenta. La Secret Key puede mostrarse solo al crearla; guardarla en un gestor de secretos. Si se pierde, generar o restablecer una nueva. No enviar claves por chat ni incluirlas en Git, capturas o archivos del frontend.

Cada integrante que quiera probar el envío puede usar una cuenta propia de Mailjet con un remitente validado, o credenciales de una cuenta del proyecto entregadas por un canal seguro. Quien no vaya a probar recupero no necesita estas credenciales.

## 4. Configurar la API local

Desde la raíz del repositorio, cargar estos valores en **.NET User Secrets** del proyecto API. Reemplazar los textos entre `< >` por valores reales:

```powershell
dotnet user-secrets set "Mailjet:ApiKey" "<API_KEY>" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
dotnet user-secrets set "Mailjet:SecretKey" "<SECRET_KEY>" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
dotnet user-secrets set "Mailjet:FromEmail" "<EMAIL_REMITENTE_VALIDADO>" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
dotnet user-secrets set "Frontend:BaseUrl" "http://localhost:5173" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
```

`Mailjet:FromEmail` lleva **solo la dirección de correo** que aparece como Active, sin el nombre visible. Para cambiar el nombre mostrado, se puede configurar opcionalmente `Mailjet:FromName`; si se omite, se usa «Área de Deportes».

User Secrets queda fuera del repositorio, pero no cifra los valores. Los comandos con claves escritas literalmente pueden quedar en el historial de la terminal; usar el mecanismo de secretos del entorno si esto supone un problema. No compartir la salida de `dotnet user-secrets list`: muestra los valores.

Reiniciar la API después de configurar los secretos.

## 5. Preparar una cuenta de prueba

Los coordinadores y docentes existentes antes de `AddUserEmail` conservan `Email = NULL`. Es necesario cargar y comprobar su dirección para que puedan recuperar la contraseña. Para una prueba, crear un docente con un correo accesible mediante Swagger, o actualizar uno existente con `PUT /api/Instructor/{id}` y su DTO completo. El email del destinatario puede ser distinto del remitente validado en Mailjet.

La cuenta debe estar activa y tener contraseña. El sistema responde igual cuando se solicita el recupero para un correo desconocido; no revela si existe una cuenta.

## 6. Probar el flujo

1. Iniciar la API con `dotnet run --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj --launch-profile http` y el frontend con `npm.cmd run dev` desde `Frontend`.
2. En `http://localhost:5173/login`, abrir **¿Olvidaste tu contraseña?** e ingresar el email del docente o coordinador de prueba.
3. La respuesta debe mostrar «Si el correo corresponde...». También se puede llamar a `POST /api/Auth/password-reset/request` desde Swagger con `{ "email": "..." }`; responde `202`. **El `202` no confirma la entrega del mensaje.**
4. Revisar entrada y spam. Abrir el enlace recibido antes de que pasen 30 minutos, elegir una contraseña de al menos 8 caracteres y confirmar.
5. Iniciar sesión con la contraseña nueva. Comprobar que la anterior se rechaza y que el mismo enlace no permite cambiarla una segunda vez. Al reabrir un enlace usado puede verse el formulario; el backend lo rechaza al enviarlo.

Si no llega el mensaje, comprobar que el remitente esté Active, que el destinatario tenga email cargado y que la API haya reiniciado con la configuración. Revisar los registros de la API y los eventos de Mailjet. Un error del proveedor se registra en la API, mientras la respuesta de solicitud conserva el mensaje genérico para no revelar cuentas.

## 7. Configuración al desplegar

Aplicar las migraciones en la base del entorno y cargar los emails de coordinadores y docentes actuales. Configurar como secretos o variables de entorno del **backend**: `Mailjet__ApiKey`, `Mailjet__SecretKey`, `Mailjet__FromEmail`, opcionalmente `Mailjet__FromName`, y `Frontend__BaseUrl` con la URL pública **HTTPS** del frontend. Probar la recepción en Gmail y Outlook antes de entregar.

Los JWT emitidos por versiones anteriores no tienen el claim `credential_version`, por lo que esos usuarios deberán iniciar sesión nuevamente tras el despliegue. Después de un restablecimiento también se invalidan sus sesiones anteriores.

## Cómo funciona

`POST /api/Auth/password-reset/request` envía un token aleatorio mediante Mailjet solo para una cuenta habilitada. En la base se guarda el hash del token, no el token en texto plano. `POST /api/Auth/password-reset/confirm` lo consume una sola vez y lo rechaza si venció, fue usado o cambió el email o la contraseña desde su emisión. El envío está detrás de `IRecoveryEmailSender`, de modo que puede sustituirse el proveedor sin cambiar el flujo de recuperación.
