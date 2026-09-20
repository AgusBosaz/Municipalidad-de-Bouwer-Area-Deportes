# Guía de desarrollo

Esta guía explica cómo preparar el proyecto y dónde debe trabajar cada integrante. Las decisiones académicas generales se encuentran en [`../context.md`](../context.md).

## 1. Requisitos

Cada desarrollador debe tener instalado:

- Git.
- SDK de .NET 8.
- SQL Server.
- SQL Server Management Studio (SSMS).
- Node.js 22.12 o una versión posterior compatible con Vite.

## 2. Clonar y restaurar el proyecto

```powershell
git clone https://github.com/AgusBosaz/Municipalidad-de-Bouwer-Area-Deportes.git
cd Municipalidad-de-Bouwer-Area-Deportes
dotnet restore Backend/MuniBack.sln
dotnet tool restore
cd Frontend
npm.cmd ci
cd ..
```

`dotnet restore` descarga las dependencias de .NET. `dotnet tool restore` instala la versión compartida de `dotnet-ef`. `npm.cmd ci` instala exactamente las versiones registradas en `package-lock.json`.

En una terminal donde `npm` funcione normalmente se puede utilizar `npm` en lugar de `npm.cmd`.

## 3. Configurar SQL Server local

Cada integrante tendrá su propia base local. En SSMS, el nombre necesario aparece en el campo **Server name** de la ventana de conexión.

Desde la raíz del repositorio, reemplazar `NOMBRE_SERVIDOR` por el nombre correspondiente:

```powershell
dotnet user-secrets set "ConnectionStrings:BouwerDatabase" "Server=NOMBRE_SERVIDOR;Database=MuniBouwerDeportes;Trusted_Connection=True;TrustServerCertificate=True;" --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
```

La cadena queda guardada fuera del repositorio. No se deben escribir nombres de servidores, usuarios ni contraseñas en `appsettings.json`.

Crear o actualizar la base local:

```powershell
dotnet tool run dotnet-ef database update --project Backend/Muni-Bouwer.Data/Muni-Bouwer.Data.csproj --startup-project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
```

Este comando aplica las migraciones compartidas y crea `MuniBouwerDeportes` si todavía no existe.

## 4. Ejecutar la aplicación

Abrir dos terminales desde la raíz del repositorio.

Backend:

```powershell
dotnet run --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj --launch-profile http
```

- API: `http://localhost:5218`
- Swagger: `http://localhost:5218/swagger`

Frontend:

```powershell
cd Frontend
npm.cmd run dev
```

- React: `http://localhost:5173`

Durante el desarrollo, Vite reenvía las solicitudes `/api/...` al backend. Los Services del frontend no deben repetir `http://localhost:5218`.

## 5. Responsabilidad de cada capa

### API / Controllers

Ubicación: `Backend/Muni-Bouwer.Api/Controllers`

- Reciben solicitudes HTTP.
- Validan los datos propios de la solicitud.
- Llaman a la capa Business.
- Devuelven códigos HTTP adecuados.
- Usan rutas con el formato `[Route("api/[controller]")]`.

Los Controllers no acceden directamente al `DbContext` y no contienen reglas de negocio.

### Business / Services

Ubicación: `Backend/Muni-Bouwer.Business/Services`

- Contienen las reglas de negocio.
- Validan condiciones propias del dominio.
- Coordinan las operaciones.
- Llaman a la capa DAL.

### Data / DAL

Ubicación: `Backend/Muni-Bouwer.Data/DAL`

- Utilizan `BouwerDbContext`.
- Realizan consultas con LINQ.
- Agregan, modifican y eliminan entidades.
- Guardan los cambios en SQL Server.

No se utilizarán Repository Pattern ni Unit of Work.

### Entities / Models

Ubicación: `Backend/Muni-Bouwer.Entities/Models`

- Representan las entidades y relaciones del dominio.
- No contienen lógica de Controllers ni acceso a la base de datos.
- Deben mantenerse sincronizadas con el diagrama acordado.

### Entities / DTOs

Ubicación: `Backend/Muni-Bouwer.Entities/DTOs`

- Definen los datos que recibe o devuelve la API.
- Se crean únicamente cuando cumplen una finalidad concreta.
- Pueden existir DTOs de creación, actualización o respuesta cuando el caso de uso lo requiera.

## 6. Organización del frontend

| Carpeta | Contenido |
|---|---|
| `src/pages` | Pantallas completas |
| `src/components` | Elementos reutilizables |
| `src/services` | Solicitudes a la API |
| `src/styles` | Archivos CSS |
| `src/assets/images` | Imágenes importadas desde React |
| `public` | Archivos públicos servidos directamente |

`src/services/api.js` contiene la función común `solicitarApi`. Cada funcionalidad puede crear su propio Service y reutilizarla.

Ejemplo conceptual:

```javascript
import { solicitarApi } from './api'

export function obtenerActividades() {
  return solicitarApi('/actividades')
}
```

La ruta del ejemplo supone que el Controller correspondiente utiliza `/api/actividades`.

## 7. Convenciones de nombres

Backend:

```text
Actividad.cs
ActividadController.cs
ActividadService.cs
ActividadDAL.cs
CrearActividadDto.cs
ActualizarActividadDto.cs
ActividadRespuestaDto.cs
```

Frontend:

```text
pages/actividades/ActividadesPage.jsx
components/actividades/ActividadForm.jsx
services/actividadService.js
styles/actividades.css
```

Los nombres deben expresar su responsabilidad. No crear carpetas llamadas `Equipo1`, `Equipo2` o `Equipo3`; la organización se realiza por funcionalidad.

## 8. Flujo de una funcionalidad

Una operación completa sigue este recorrido:

```text
Página React
    ↓
Service del frontend
    ↓
Controller
    ↓
Service de Business
    ↓
DAL
    ↓
BouwerDbContext
    ↓
SQL Server
```

Antes de implementar una funcionalidad, revisar si la entidad y sus relaciones ya existen. No crear propiedades, reglas o endpoints que el equipo no haya acordado.

## 9. Trabajo con Git

Crear una rama desde una versión actualizada de `main`:

```powershell
git switch main
git pull
git switch -c feature/nombre-descriptivo
```

Ejemplos:

```text
feature/crud-actividades
feature/inscripcion-alumnos
fix/validacion-cupo
```

Antes de enviar cambios:

```powershell
dotnet build Backend/MuniBack.sln --no-restore
cd Frontend
npm.cmd run lint
npm.cmd run build
```

Crear commits descriptivos y abrir un Pull Request. No integrar directamente en `main` sin revisión.

No subir:

- `bin/` y `obj/`.
- `node_modules/` y `dist/`.
- Archivos `.env` locales.
- Cadenas de conexión o contraseñas.

El `.gitignore` ya excluye esos archivos.

## 10. Migraciones

Las migraciones afectan a todos los equipos. Deben ser creadas por la persona responsable de coordinar el modelo de datos para evitar archivos incompatibles entre ramas.

Cuando un cambio aprobado modifica el modelo:

```powershell
dotnet tool run dotnet-ef migrations add NombreDescriptivo --project Backend/Muni-Bouwer.Data/Muni-Bouwer.Data.csproj --startup-project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj --output-dir Migrations
```

Luego se aplica en la base local:

```powershell
dotnet tool run dotnet-ef database update --project Backend/Muni-Bouwer.Data/Muni-Bouwer.Data.csproj --startup-project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
```

La migración generada debe incluirse en el Pull Request junto con el cambio de las entidades.

## 11. Uso de asistentes de IA

Antes de pedir ayuda sobre el proyecto, indicar al asistente:

> Leé el archivo `context.md` de la raíz y respetá sus instrucciones antes de analizar o modificar el proyecto.

El asistente también debe revisar los archivos existentes y el [diagrama UML](diagrama_uml_MB_Area_Deportes.md) antes de proponer cambios al modelo.
