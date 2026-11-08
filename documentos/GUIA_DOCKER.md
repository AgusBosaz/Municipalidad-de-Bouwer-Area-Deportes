# Guía de Docker para pruebas locales

Esta guía permite levantar el frontend, la API y SQL Server en contenedores para desarrollo y pruebas. Es una alternativa a la ejecución habitual: para trabajar sin Docker, seguí la [guía de desarrollo](GUIA_DESARROLLO.md).

La configuración de este documento es **solo local**. No está lista para producción: usa el entorno `Development`, un SQL Server de prueba, conexiones con certificado de confianza local y puertos de la computadora. El servidor, HTTPS, los secretos, los respaldos, las migraciones y el despliegue final se definirán con la empresa.

## 1. Requisitos

- Docker Desktop instalado, iniciado y configurado para contenedores Linux. Ejecutá `docker --version` y `docker compose version` para comprobarlo.
- Git y una copia actualizada del proyecto.
- SDK de .NET 8 o compatible para aplicar las migraciones desde la computadora. El SDK incluye la herramienta `dotnet`; la herramienta `dotnet-ef` se restaura más adelante.
- Puertos locales 14333, 15218 y 15173 disponibles.

Ejecutá los comandos de esta guía en PowerShell, desde la **raíz del proyecto**, donde se encuentra `docker-compose.yml`. La primera construcción descarga imágenes y puede tardar.

## 2. Crear la configuración local

Compose necesita una contraseña para SQL Server, la cadena de conexión de la API y una clave para firmar los tokens JWT. El siguiente bloque solicita una contraseña y genera una clave aleatoria; no sobrescribe un `.env` existente.

Usá una contraseña exclusiva para pruebas, de al menos 8 caracteres, que combine mayúsculas, minúsculas, números y símbolos. Guardala para aplicar migraciones y no la compartas. Si SQL Server ya fue inicializado en el volumen, tenés que ingresar la contraseña con la que se creó: cambiar el archivo `.env` no cambia la contraseña almacenada en SQL Server.

```powershell
if (Test-Path .env) {
    Write-Host 'Ya existe un archivo .env; no se modificó.'
} else {
    $claveSegura = Read-Host 'Contraseña de SQL Server de prueba' -AsSecureString
    $claveSql = [System.Net.NetworkCredential]::new('', $claveSegura).Password
    $claveConexion = $claveSql.Replace('"', '""')
    $conexion = "Server=sql,1433;Database=MuniBouwerDockerPrueba;User Id=sa;Password=`"$claveConexion`";TrustServerCertificate=True;"

    $bytes = New-Object byte[] 64
    $generador = [Security.Cryptography.RandomNumberGenerator]::Create()
    $generador.GetBytes($bytes)
    $generador.Dispose()
    $jwt = [Convert]::ToBase64String($bytes)

    function ValorEnv($valor) {
        return $valor.Replace('\', '\\').Replace("'", "\'")
    }
    $lineas = @(
        "SQL_PASSWORD='$(ValorEnv $claveSql)'"
        "SQL_CONNECTION='$(ValorEnv $conexion)'"
        "JWT_KEY='$(ValorEnv $jwt)'"
    )
    [IO.File]::WriteAllLines((Join-Path (Get-Location) '.env'), $lineas, [Text.UTF8Encoding]::new($false))
    Remove-Item Function:ValorEnv
    Remove-Variable claveSegura, claveSql, claveConexion, conexion, bytes, generador, jwt, lineas
    Write-Host 'Archivo .env local creado.'
}
```

`.env` queda fuera de Git por la regla de `.gitignore`, pero sus valores no están cifrados. No lo compartas ni lo subas al repositorio. Docker también conserva las variables en la configuración de los contenedores: son credenciales de prueba, no de producción. Conservá la clave JWT entre reinicios; cambiarla invalida los tokens anteriores.

Para validar la configuración sin imprimir los valores:

```powershell
docker compose config --quiet
```

Si ya tenés variables `SQL_PASSWORD`, `SQL_CONNECTION` o `JWT_KEY` en la terminal, pueden prevalecer sobre `.env`. Abrí una terminal nueva para probar el archivo, o quitá esas variables de la sesión antes de validar.

## 3. Crear el volumen e iniciar SQL Server

El archivo Compose usa un volumen externo llamado `muni-sql-prueba-data`. Crealo una sola vez:

```powershell
docker volume create muni-sql-prueba-data
docker compose up -d sql
docker compose ps
```

Esperá a que el estado de `sql` indique **healthy**. La primera vez puede tardar varios minutos. Para revisar su arranque:

```powershell
docker compose logs sql
```

El volumen conserva la base entre reinicios. No lo elimines si necesitás los datos. Si ya existe de una prueba anterior, Compose lo reutiliza; verificá que corresponda a esta aplicación antes de usarlo.

## 4. Aplicar las migraciones

Con SQL Server saludable, restaurá la herramienta de Entity Framework:

```powershell
dotnet tool restore
```

El bloque siguiente solicita la contraseña del SQL Server de prueba y apunta expresamente al puerto publicado por Docker. Crea o actualiza `MuniBouwerDockerPrueba`; no utiliza la conexión de desarrollo habitual guardada en User Secrets. No ejecutes el comando contra una base ajena sin verificar la conexión y contar con autorización.

```powershell
$claveSegura = Read-Host 'Contraseña de SQL Server de prueba' -AsSecureString
$claveSql = [System.Net.NetworkCredential]::new('', $claveSegura).Password
$claveEscapada = $claveSql.Replace('"', '""')
$conexionAnterior = [Environment]::GetEnvironmentVariable('ConnectionStrings__BouwerDatabase')

try {
    $env:ConnectionStrings__BouwerDatabase = "Server=localhost,14333;Database=MuniBouwerDockerPrueba;User Id=sa;Password=`"$claveEscapada`";TrustServerCertificate=True;"
    dotnet tool run dotnet-ef database update `
      --project Backend/Muni-Bouwer.Data/Muni-Bouwer.Data.csproj `
      --startup-project Backend/Muni-Bouwer.Api/Muni-Bouwer.Api.csproj
}
finally {
    [Environment]::SetEnvironmentVariable('ConnectionStrings__BouwerDatabase', $conexionAnterior)
    Remove-Variable claveSegura, claveSql, claveEscapada, conexionAnterior -ErrorAction SilentlyContinue
}
```

Si Entity Framework solicita configuración adicional para construir el proyecto de inicio, revisá los requisitos JWT en la [guía de desarrollo](GUIA_DESARROLLO.md). No compartas las claves. Si la migración termina correctamente, la salida finaliza con `Done.`.

## 5. Iniciar y probar la aplicación

```powershell
docker compose up -d --build
docker compose ps
```

Compose espera el control de salud de SQL antes de iniciar la API. La API carga los roles y permisos iniciales al arrancar. El frontend puede tardar unos segundos adicionales en estar disponible.

- Aplicación: <http://localhost:15173>
- Swagger de la API de prueba: <http://localhost:15218/swagger>
- Consulta pública: <http://localhost:15173/api/Activity/public>

En una base nueva, la consulta pública puede devolver `[]`. Los roles y permisos iniciales no crean un usuario coordinador. **Todavía falta incorporar al proyecto un mecanismo compartido y seguro para crear el primer coordinador en una base vacía**; no se deben agregar contraseñas reales a una migración o al repositorio. Coordinar su creación antes de probar el ingreso.

El recupero de contraseña por correo requiere configuración adicional de Mailjet y una URL de frontend adecuada; no queda configurado solo por levantar Compose. Ver [RECUPERO_PASSWORD.md](RECUPERO_PASSWORD.md).

## 6. Detener, reiniciar y revisar

```powershell
docker compose stop
docker compose up -d
docker compose ps
docker compose logs --tail 100 api
docker compose logs --tail 100 sql
docker compose logs --tail 100 frontend
```

Ejecutá nuevamente las migraciones del paso 4 cuando el proyecto incorpore nuevas migraciones. Las migraciones no se ejecutan automáticamente al iniciar la API. `docker compose stop` conserva los contenedores y el volumen. No uses comandos para eliminar volúmenes si necesitás conservar los datos.

Si la API no arranca, comprobá que SQL esté `healthy`, que las migraciones se hayan aplicado y que la contraseña coincida con la del volumen existente. Si falla el acceso a la aplicación, revisá el estado y los registros de cada servicio sin compartir claves.

## 7. Para coordinar antes del despliegue

Confirmar con la empresa el sistema y acceso al servidor, runner de GitLab, registro de imágenes, dominio y HTTPS, ubicación y credenciales de SQL Server, estrategia de persistencia y respaldos, mecanismo de secretos, correo de Mailjet y forma de ejecutar migraciones. También hay que preparar el primer coordinador y validar el recorrido completo en un entorno apropiado.

El archivo `docker-compose.yml` actual usa la red y el volumen locales y no reemplaza esa configuración. Los Dockerfiles y Compose son un punto de partida que deberá verificarse y adaptarse a la infraestructura definitiva.
