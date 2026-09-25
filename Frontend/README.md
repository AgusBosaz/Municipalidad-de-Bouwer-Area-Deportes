# Frontend - Area de Deportes de Bouwer

React con JavaScript, CSS y Vite.

La configuración general del repositorio, SQL Server, Git y la arquitectura se
encuentra en [`../documentos/GUIA_DESARROLLO.md`](../documentos/GUIA_DESARROLLO.md).

## Instalacion

Requiere Node.js 22.12 o superior compatible con Vite (verificado con Node.js 24), y SDK .NET 8 para el backend.
Desde la raiz del repositorio:

```powershell
cd Frontend
npm.cmd ci
```

En otras terminales puede usarse npm en lugar de npm.cmd.

## Ejecucion local

En una terminal, desde la raiz:

```powershell
dotnet run --project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj --launch-profile http
```

En otra terminal, desde la raiz:

```powershell
cd Frontend
npm.cmd run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5218
- Swagger: http://localhost:5218/swagger

Vite reenvia /api/... al backend conservando la ruta. No se necesitan variables de entorno para esta configuracion local. Si el puerto 5173 esta ocupado, Vite informa el problema.

## Organizacion

- src/pages: pantallas completas.
- src/components: componentes reutilizables.
- src/services: solicitudes a la API por funcionalidad.
- src/styles: estilos CSS.
- src/assets/images: imagenes importadas desde React.
- public: archivos publicos servidos directamente.

## Solicitudes a la API

`src/services/api.js` exporta `apiRequest(path, options)`.
La ruta comienza con / y no incluye /api.
Devuelve datos JSON o texto, null para respuestas vacias, y lanza un error con status para respuestas HTTP fallidas. Los errores de red se propagan para que la pantalla los maneje.
Para POST o PUT, pasar method y body: JSON.stringify(datos). Se agrega Content-Type: application/json cuando el body es un string.

Los Controllers deben usar `[Route("api/[controller]")]`. Actualmente `StudentsController` no contiene acciones; todavía no hay endpoints de negocio para consumir.

## Verificacion

```powershell
npm.cmd run lint
npm.cmd run build
```

El proxy corresponde al desarrollo local. Al publicar, el servidor debera enviar /api al backend; compilar React no configura ese servidor.
