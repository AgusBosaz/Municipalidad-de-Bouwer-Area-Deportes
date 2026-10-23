# Recupero de contraseña por correo

El recupero está disponible para cuentas activas de coordinador y docente con email cargado. Los estudiantes no inician sesión y no usan este flujo.

## Antes de habilitarlo

1. Aplicar las migraciones `AddUserEmail` y `AddPasswordRecovery` a la base del entorno. No se aplican automáticamente al iniciar la API.
2. Cargar y comprobar los emails de las cuentas actuales de coordinadores y docentes. Los usuarios anteriores a `AddUserEmail` conservan `Email = NULL` hasta que se actualicen.
3. Crear una cuenta de Mailjet bajo control del municipio. En **Senders & Domains**, agregar una dirección remitente y confirmarla desde su buzón. Mailjet permite validar una dirección individual sin comprar un dominio, pero advierte que los remitentes de Gmail, Outlook u otros servicios gratuitos pueden llegar a spam o no entregarse. Verificar la recepción antes de habilitar este flujo para usuarios reales.
4. Crear una API Key y Secret Key de Mailjet. Configurar en el **backend** `Mailjet__ApiKey`, `Mailjet__SecretKey`, `Mailjet__FromEmail` (la dirección validada), opcionalmente `Mailjet__FromName`, y `Frontend__BaseUrl` (URL pública HTTPS; en desarrollo puede ser `http://localhost:5173`). No guardar las claves en el repositorio ni en el frontend. El backend responde 503 al solicitar un enlace si falta la configuración.
5. Reiniciar la API después de aplicar migraciones y configurar variables.

Para actualizar una base local con EF Core:

```powershell
dotnet ef database update --project Backend/Muni-Bouwer.Data/Muni-Bouwer.Data.csproj --startup-project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
```

En desarrollo se pueden guardar los valores con .NET User Secrets del proyecto API; las claves reales no deben compartirse ni incluirse en capturas. Si cambia el proveedor de correo en el futuro, solo se reemplaza la implementación de `IRecoveryEmailSender`.

Ejemplo de configuración local (reemplazar los valores entre `< >`):

```powershell
dotnet user-secrets set "Mailjet:ApiKey" "<API_KEY>" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
dotnet user-secrets set "Mailjet:SecretKey" "<SECRET_KEY>" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
dotnet user-secrets set "Mailjet:FromEmail" "<EMAIL_VALIDADO>" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
dotnet user-secrets set "Frontend:BaseUrl" "http://localhost:5173" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
```

## Flujo

- `POST /api/Auth/password-reset/request` recibe `{ "email": "..." }`. Responde igual para un email existente y uno desconocido.
- Si la cuenta está habilitada, se envía un enlace válido durante 30 minutos. El token aleatorio no se guarda en texto plano en la base; solo se conserva su hash.
- `POST /api/Auth/password-reset/confirm` recibe `{ "token": "...", "password": "..." }`. El enlace se consume una vez y se rechaza si venció, se usó o cambió el email o la contraseña desde que se emitió.
- Al cambiar la contraseña se incrementa `CredentialVersion`, por lo que los JWT anteriores dejan de ser válidos. La persona debe volver a iniciar sesión.

Al desplegar esta versión, los JWT emitidos por versiones anteriores tampoco tienen el claim `credential_version`; esos usuarios deberán iniciar sesión nuevamente.

Antes de entregar, probar recepción real en Gmail y Outlook, enlace vencido y reutilizado, cuenta inexistente, y una sesión abierta antes del cambio de contraseña. Mailjet puede aceptar el mensaje para envío sin que este llegue al buzón: comprobar la entrega en correos reales y en los registros de Mailjet.
