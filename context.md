# CONTEXT.md
## Proyecto Integrador de 2.º Año — Programación II

> Este archivo proporciona contexto e instrucciones a cualquier asistente de Inteligencia Artificial utilizado durante el desarrollo del Proyecto Integrador.
> La IA debe respetar estas reglas al analizar, explicar, modificar o generar código para este proyecto.

---

## 1. Contexto académico

Este proyecto corresponde a estudiantes de segundo año de una Tecnicatura Superior en Desarrollo de Software.

El Proyecto Integrador articula contenidos de:
- Prácticas Profesionalizantes I
- Programación II
- Modelado y Arquitectura de Software
- Estadística y Probabilidades
- Otros contenidos institucionales relacionados con el proyecto

La aplicación debe permitir integrar los conocimientos adquiridos durante el año mediante el desarrollo de una aplicación web simple y funcional.

La fecha de entrega establecida en la consigna general es el **13/11/2026**.

La IA debe considerar en todo momento que se trata de un proyecto académico. Las soluciones propuestas deben ser comprensibles, justificables y acordes al nivel de Programación II.

---

## 2. Objetivo general del sistema

El equipo deberá diseñar y desarrollar una aplicación web que resuelva una problemática previamente relevada.

Como mínimo, el sistema deberá implementar las operaciones básicas de un CRUD:

- Crear registros.
- Consultar registros.
- Consultar un registro particular.
- Modificar registros.
- Eliminar registros.

El proyecto deberá partir del relevamiento del problema y sus requerimientos y llegar hasta una aplicación funcional.

La temática específica dependerá del proyecto seleccionado por cada equipo.

---

## 3. Tecnologías y herramientas

### Backend
- C#
- .NET 8
- ASP.NET Core Web API
- Controllers
- Entity Framework Core
- LINQ
- Expresiones lambda

### Base de datos
- SQL Server
- Entity Framework Core como ORM

### Herramientas
- Visual Studio Code
- SQL Server Management Studio (SSMS)
- Git
- GitHub, GitLab o Bitbucket

### Frontend

Para este proyecto, el docente autorizó utilizar React. Mantener una implementación simple basada en:

- React con JavaScript
- Vite
- HTML
- CSS
- JavaScript
- Fetch API para consumir la Web API

No incorporar otros frameworks de frontend sin autorización del docente.

---

## 4. Arquitectura obligatoria

El backend deberá utilizar una arquitectura en capas.

Como mínimo deberán existir cuatro responsabilidades claramente diferenciadas:

### 4.1 Presentación / API / Controllers

Responsabilidades:

- Recibir solicitudes HTTP.
- Recibir parámetros de ruta, query string o body.
- Realizar validaciones correspondientes a la solicitud.
- Llamar a la capa de lógica de negocio.
- Devolver respuestas HTTP.
- Utilizar códigos de estado adecuados.

Los Controllers deben mantenerse simples.

**No colocar lógica de negocio ni acceso directo a la base de datos dentro de los Controllers.**

### 4.2 Lógica de Negocio / Service

Responsabilidades:

- Implementar las reglas de negocio.
- Procesar la información.
- Realizar validaciones propias del dominio.
- Coordinar operaciones.
- Comunicarse con la capa de acceso a datos.

La lógica importante del sistema debe encontrarse aquí y no en los Controllers.

### 4.3 Acceso a Datos / DAL

Responsabilidades:

- Comunicarse con Entity Framework Core.
- Utilizar el DbContext.
- Consultar la base de datos.
- Agregar, modificar y eliminar entidades.
- Persistir cambios.

En este proyecto **no se utilizará DAO**.

No agregar Repository Pattern, Unit of Work u otros patrones de persistencia salvo indicación expresa del docente.

### 4.4 Entities / Models

Responsabilidades:

- Representar las entidades del dominio.
- Definir propiedades.
- Definir relaciones entre entidades.
- Aplicar los conceptos de POO correspondientes.

Esta capa no debe depender de Controllers.

---

## 5. Dependencias entre capas

La IA debe preservar la separación de responsabilidades.

Como criterio general:

**Controller → Service → DAL → Base de datos**

Las Entities/Models representan los objetos utilizados por las distintas capas según corresponda.

No saltar capas simplemente para escribir menos código.

Por ejemplo, un Controller no debe utilizar directamente el DbContext si la arquitectura definida establece que el acceso debe realizarse mediante Service y DAL.

---

## 6. Programación Orientada a Objetos

Los estudiantes han trabajado los siguientes conceptos:

- Clases y objetos.
- Atributos y propiedades.
- Métodos.
- Encapsulamiento.
- Abstracción.
- Herencia.
- Polimorfismo.
- Modularidad.
- Clases abstractas.
- Interfaces.
- Constructores.
- Métodos estáticos.
- Métodos abstractos.
- `virtual`.
- `override`.

La IA puede utilizar estos conceptos cuando tengan sentido dentro del problema.

**No debe forzar herencia, interfaces o clases abstractas únicamente para demostrar su utilización.**

Cuando proponga aplicar uno de estos conceptos debe poder explicar por qué es adecuado.

---

## 7. Estructuras de datos vistas

Los estudiantes conocen:

- Arrays.
- Listas (`List<T>`).
- Pilas.
- Colas.
- Diccionarios.

También han trabajado algoritmos de ordenamiento, entre ellos:

- Burbuja.
- Inserción.
- Selección.
- Quick Sort.

La IA puede explicar estas estructuras y algoritmos cuando sean necesarios.

---

## 8. Web API

Los estudiantes trabajan con ASP.NET Core Web API utilizando Controllers.

Deben comprender operaciones como:

- GET
- GET por ID
- POST
- PUT
- DELETE

Ejemplo conceptual:

```text
GET     /api/alumnos
GET     /api/alumnos/5
POST    /api/alumnos
PUT     /api/alumnos/5
DELETE  /api/alumnos/5
```

La IA debe respetar convenciones REST sencillas y comprensibles.

---

## 9. Códigos HTTP

Utilizar correctamente los códigos HTTP vistos durante la materia.

Entre ellos:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

No devolver siempre `200 OK` independientemente del resultado.

La IA debe explicar brevemente por qué corresponde determinado código cuando el estudiante tenga dudas.

---

## 10. IActionResult

Los Controllers pueden utilizar `IActionResult` para representar diferentes respuestas HTTP.

La IA debe priorizar implementaciones claras, por ejemplo:

```csharp
return Ok(resultado);
return NotFound();
return BadRequest("Datos inválidos");
return NoContent();
```

No introducir tipos de respuesta o abstracciones más complejas sin necesidad académica o funcional.

---

## 11. Validaciones

La aplicación debe validar la información recibida.

Ejemplos:

- Campos obligatorios.
- Valores inválidos.
- IDs inexistentes.
- Registros duplicados cuando corresponda.
- Reglas propias del dominio.

La IA debe diferenciar, cuando sea pertinente, entre:

- Validaciones de entrada.
- Validaciones de negocio.
- Errores inesperados.

---

## 12. Manejo de excepciones

Los estudiantes conocen `try/catch`.

La IA puede utilizarlo para enseñar y resolver el manejo de excepciones de forma clara.

Ejemplo:

```csharp
try
{
    // operación
}
catch (Exception ex)
{
    // tratamiento correspondiente
}
```

No llenar innecesariamente todos los métodos con `try/catch`.

Cuando exista una alternativa más clara, explicar la diferencia sin reemplazar automáticamente la forma de trabajo utilizada en clase.

---

## 13. Expresiones lambda

Los estudiantes conocen expresiones lambda de C#.

Ejemplo:

```csharp
x => x.Id == id
```

La IA puede utilizarlas principalmente junto con LINQ.

Debe explicar su funcionamiento si introduce una expresión que pueda resultar difícil de interpretar.

---

## 14. LINQ

Los estudiantes conocen LINQ.

Se pueden utilizar, entre otros:

- `Where`
- `FirstOrDefault`
- `Any`
- `Select`
- `OrderBy`
- `OrderByDescending`
- `Count`
- `ToList`

Ejemplo:

```csharp
var alumnosActivos = alumnos
    .Where(a => a.Activo)
    .ToList();
```

Priorizar consultas legibles.

Evitar expresiones LINQ excesivamente largas o complejas cuando puedan dividirse en pasos comprensibles.

---

## 15. DTOs

Los estudiantes conocen el concepto de DTO.

Utilizar DTOs cuando permitan separar los datos expuestos por la API de las entidades del dominio.

Pueden existir, según las necesidades del proyecto:

- DTO para creación.
- DTO para actualización.
- DTO para respuesta.

La IA no debe crear una cantidad innecesaria de DTOs.

Cada DTO debe tener una finalidad que el estudiante pueda explicar.

---

## 16. Entity Framework Core

La base de datos deberá desarrollarse utilizando Entity Framework Core como ORM.

La IA puede ayudar con:

- `DbContext`.
- `DbSet`.
- Relaciones entre entidades.
- Consultas LINQ.
- Altas.
- Modificaciones.
- Eliminaciones.
- Persistencia mediante `SaveChanges` / `SaveChangesAsync`.
- Configuración necesaria del modelo.

La base de datos utilizada por el proyecto es SQL Server.

No reemplazar Entity Framework Core por otro ORM.

---

## 17. Relaciones de base de datos

La IA debe ayudar a modelar correctamente relaciones cuando sean necesarias.

Ejemplos:

- Uno a uno.
- Uno a muchos.
- Muchos a muchos.

En relaciones muchos a muchos puede ser necesaria una entidad intermedia que represente la relación, especialmente cuando esta posee información propia.

La IA debe explicar las claves primarias y foráneas de manera didáctica cuando el estudiante lo necesite.

---

## 18. Documentación y diseño

El proyecto incluye una etapa previa de análisis y diseño.

Puede contener:

- Contexto organizacional.
- Descripción del problema.
- Objetivo general.
- Objetivos específicos.
- Alcance.
- Supuestos.
- Restricciones.
- Requerimientos funcionales.
- Requerimientos no funcionales.

También se solicitarán diagramas según corresponda:

- Casos de uso.
- Clases.
- Secuencia.
- Actividades.
- Diagramas de flujo de datos.
- Diagramas de arquitectura/componentes/capas.

La IA puede ayudar a interpretar, revisar y mejorar estos elementos, pero no debe inventar requerimientos que el equipo no haya definido.

Si falta información, debe preguntarla.

---

## 19. Git

El proyecto deberá utilizar control de versiones.

El repositorio deberá incluir:

- `README.md`.
- `.gitignore`.
- Historial de commits claro.
- Mensajes descriptivos.
- Uso de ramas para desarrollo.

La IA puede sugerir comandos Git y explicar qué hacen.

No debe sugerir eliminar el historial del proyecto para solucionar errores salvo una situación excepcional y claramente explicada.

---

## 20. README

El proyecto deberá contener un `README.md` que permita comprender y ejecutar la aplicación.

Como mínimo debería documentar:

- Nombre del proyecto.
- Descripción.
- Problema que resuelve.
- Integrantes.
- Tecnologías.
- Requisitos.
- Instalación.
- Configuración.
- Ejecución.
- Uso básico.

No confundir `README.md` con este archivo `context.md`.

El README está destinado principalmente a personas que visiten el repositorio.

`context.md` está destinado principalmente a proporcionar contexto e instrucciones a una IA.

---

# 21. REGLAS OBLIGATORIAS PARA LA IA

Las siguientes reglas tienen prioridad al colaborar con un estudiante en este proyecto.

## Regla 1 — Analizar antes de generar

Antes de modificar código existente:

1. Leer el código proporcionado.
2. Identificar la capa correspondiente.
3. Identificar las clases y métodos existentes.
4. Respetar nombres y estructura cuando sean correctos.
5. Recién después proponer modificaciones.

No asumir que existe código que no fue proporcionado.

---

## Regla 2 — No inventar elementos del proyecto

No inventar:

- Entidades.
- Propiedades.
- Métodos.
- Relaciones.
- Endpoints.
- Reglas de negocio.
- Tablas.
- Requerimientos.

Si para resolver una tarea hace falta información que no existe en el contexto proporcionado, preguntarla al estudiante.

---

## Regla 3 — Respetar la arquitectura

No modificar la arquitectura del proyecto simplemente porque exista una alternativa considerada más moderna.

Respetar:

**Controller → Service → DAL**

y la capa de:

**Entities / Models**

No mover lógica a otra capa sin explicar el motivo.

---

## Regla 4 — No agregar patrones no estudiados

No introducir automáticamente:

- Repository Pattern.
- Unit of Work.
- CQRS.
- MediatR.
- AutoMapper.
- Clean Architecture.
- DDD.
- Event Sourcing.
- Minimal APIs.
- Microservicios.

Tampoco agregar librerías externas cuando .NET o el código existente permitan resolver el problema de manera sencilla.

Si el estudiante pregunta específicamente por alguna de estas tecnologías, puede explicarse, pero debe aclararse que se encuentra fuera del alcance base del proyecto.

---

## Regla 5 — Priorizar código didáctico

El objetivo no es generar el código más corto posible.

El objetivo es generar código que un estudiante de segundo año pueda:

- Leer.
- Comprender.
- Modificar.
- Explicar.
- Defender oralmente.

Preferir:

```csharp
var alumno = alumnos.FirstOrDefault(a => a.Id == id);

if (alumno == null)
{
    return NotFound();
}

return Ok(alumno);
```

frente a soluciones excesivamente compactas que dificulten su comprensión.

---

## Regla 6 — No sobreingeniería

Aplicar la solución más sencilla que respete:

- Los requerimientos.
- La arquitectura.
- Las buenas prácticas trabajadas.
- Los contenidos de Programación II.

No crear capas, abstracciones, interfaces o clases adicionales sin una necesidad concreta.

---

## Regla 7 — Explicar el código

Cuando genere una solución nueva, la IA debe poder explicar:

- Qué hace.
- En qué capa debe ubicarse.
- Por qué se encuentra en esa capa.
- Cómo se relaciona con el resto del sistema.
- Qué conceptos de Programación II utiliza.

Cuando sea útil, explicar primero la idea y después mostrar el código.

---

## Regla 8 — No hacer cambios masivos sin avisar

Si una solución requiere modificar varios archivos, primero indicar:

1. Qué archivos se modificarán.
2. Qué responsabilidad tiene cada uno.
3. Por qué son necesarios los cambios.

Luego realizar los cambios paso a paso.

---

## Regla 9 — Mantener consistencia

Si el proyecto ya utiliza una determinada forma de:

- Nombrar clases.
- Crear Services.
- Crear DAL.
- Crear DTOs.
- Manejar respuestas.
- Organizar carpetas.
- Utilizar Entity Framework.

continuar utilizando esa misma convención salvo que exista un error concreto.

---

## Regla 10 — Corregir enseñando

Cuando encuentre un error:

1. Identificar el error.
2. Explicar por qué ocurre.
3. Indicar dónde se encuentra.
4. Proponer la corrección.
5. Mostrar el código corregido cuando corresponda.

Evitar limitarse a reemplazar todo el archivo sin explicación.

---

## Regla 11 — No ocultar complejidad innecesariamente

No utilizar una solución avanzada únicamente porque produzca menos líneas de código.

El estudiante debe poder seguir el flujo:

**Solicitud HTTP → Controller → Service → DAL → Entity Framework → Base de datos → respuesta**

---

## Regla 12 — Considerar la defensa oral

Todo código propuesto debe ser código que el estudiante pueda comprender y explicar durante la presentación final.

Ante dos soluciones técnicamente válidas, priorizar aquella que:

1. Respete los contenidos estudiados.
2. Sea más fácil de comprender.
3. Mantenga correctamente la arquitectura.
4. Permita justificar claramente las decisiones tomadas.

---

## 22. Forma de responder al estudiante

Cuando el estudiante solicite ayuda con una implementación, seguir preferentemente esta estructura:

### 1. Qué vamos a hacer
Explicación breve del objetivo.

### 2. Dónde corresponde
Indicar proyecto/capa y archivo.

### 3. Código
Mostrar únicamente el código necesario.

### 4. Cómo funciona
Explicar las partes importantes.

### 5. Flujo
Cuando corresponda, explicar cómo viaja la información entre capas.

No repetir esta estructura mecánicamente si la pregunta puede responderse de manera más sencilla.

---

## 23. Cuando falte información

La IA debe preguntar antes de asumir datos importantes.

Ejemplos:

- ¿Cómo se llama la entidad?
- ¿Qué propiedades tiene?
- ¿Cuál es la relación entre estas entidades?
- ¿Qué debe ocurrir según el requerimiento?
- ¿Cómo está organizado actualmente el proyecto?

Si el estudiante puede proporcionar un archivo existente, priorizar analizarlo antes de generar uno nuevo.

---

## 24. Criterio principal

Este proyecto no busca simular una arquitectura empresarial extremadamente compleja.

Busca demostrar que el estudiante comprende y puede integrar:

**POO + C# + Web API + CRUD + LINQ + DTOs + validaciones + manejo de errores + Entity Framework Core + SQL Server + arquitectura en capas + análisis y diseño.**

La IA debe ayudar al estudiante a comprender y desarrollar el proyecto sin reemplazar ese aprendizaje.

---

## 25. Instrucción final para cualquier IA

Antes de responder sobre este proyecto, verificá mentalmente:

1. ¿Estoy respetando la arquitectura definida?
2. ¿Estoy utilizando contenidos que los estudiantes conocen?
3. ¿Estoy agregando algo innecesariamente avanzado?
4. ¿El estudiante podría explicar este código en una defensa oral?
5. ¿Estoy suponiendo información que no me proporcionaron?

Si alguna respuesta representa un problema, adaptar la solución antes de presentarla.

---

## 26. Decisiones confirmadas de este proyecto

Estas decisiones complementan las reglas anteriores y deben respetarse al trabajar en este repositorio:

- `Usuario` es una clase abstracta.
- `Alumno`, `Docente` y `Coordinador` heredan de `Usuario`.
- Por el momento, el alumno es registrado y administrado por docentes y coordinadores; no inicia sesión.
- `PasswordHash` es opcional mientras existan tipos de usuario sin acceso al sistema.
- No agregar `Email` ni otros datos de autenticación hasta que el equipo los defina.
- Los métodos de casos de uso mostrados en el diagrama, como inscribir alumnos, crear actividades o tomar asistencia, deben implementarse en Services y no dentro de las entidades.
- Se utiliza Entity Framework Core con enfoque Code First y SQL Server.
- Cada desarrollador utiliza una base de datos local llamada `MuniBouwerDeportes`.
- La cadena de conexión de cada computadora debe guardarse mediante User Secrets y nunca subirse a Git.
- Las migraciones se comparten en el repositorio y deben coordinarse para evitar migraciones incompatibles entre ramas.
- La estructura actual y los comandos de configuración se encuentran documentados en `README.md`.
- El diagrama UML compartido se encuentra en `documentos/diagrama_uml_MB_Area_Deportes.md`.
