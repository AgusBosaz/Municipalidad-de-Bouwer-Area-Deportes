# Sistema de Gestión del Área de Deportes

Proyecto Integrador de segundo año de la Tecnicatura Superior en Desarrollo de Software, desarrollado para el Área de Deportes de la Municipalidad de Bouwer.

## Descripción

La plataforma busca centralizar la información utilizada por el Área de Deportes y facilitar la administración de alumnos, docentes y actividades deportivas.

El sistema se encuentra en desarrollo. Su alcance actual contempla el registro de usuarios, la asignación de docentes y alumnos a actividades, las inscripciones, la documentación, las fichas médicas y las asistencias.

## Objetivo

Desarrollar una aplicación web sencilla y funcional que permita aplicar los contenidos trabajados durante el año:

- Programación Orientada a Objetos.
- C# y .NET 8.
- ASP.NET Core Web API.
- Operaciones CRUD.
- LINQ y expresiones lambda.
- DTOs y validaciones.
- Entity Framework Core y SQL Server.
- Arquitectura en capas.
- React, JavaScript y CSS.
- Git y GitHub.

## Funcionalidades planificadas

- Administración de alumnos, docentes y coordinadores.
- Administración de actividades deportivas y cupos.
- Asignación de docentes a actividades.
- Inscripción de alumnos en actividades.
- Registro de documentación y fichas médicas.
- Registro de asistencias de alumnos y docentes.
- Administración de roles y permisos.

## Arquitectura

El backend está organizado en capas:

```text
Solicitud HTTP
      ↓
Controller
      ↓
Service
      ↓
DAL
      ↓
Entity Framework Core
      ↓
SQL Server
```

```text
Backend/
├── Muni-Bouwer.Api/       Controllers y configuración HTTP
├── Muni-Bouwer.Business/  Services y reglas de negocio
├── Muni-Bouwer.Data/      DAL, DbContext y migraciones
└── Muni-Bouwer.Entities/  Entidades y DTOs

Frontend/
└── src/
    ├── assets/
    ├── components/
    ├── pages/
    ├── services/
    └── styles/
```

## Tecnologías

| Área | Tecnologías |
|---|---|
| Backend | C#, .NET 8 y ASP.NET Core Web API |
| Persistencia | Entity Framework Core 8 |
| Base de datos | SQL Server |
| Frontend | React, JavaScript, CSS y Vite |
| Documentación | Markdown y Mermaid |
| Control de versiones | Git y GitHub |

## Estado actual

La estructura inicial del backend y del frontend está preparada. El modelo de entidades, el `DbContext` y la migración inicial de la base de datos también están disponibles. Los equipos pueden comenzar a implementar los casos de uso, endpoints y pantallas correspondientes.

## Cómo comenzar

Las instrucciones para clonar, configurar la base local y ejecutar la aplicación están en la [Guía de desarrollo](documentos/GUIA_DESARROLLO.md).

## Documentación

- [Guía de desarrollo](documentos/GUIA_DESARROLLO.md)
- [Diagrama UML](documentos/diagrama_uml_MB_Area_Deportes.md)
- [Contexto y reglas académicas para asistentes de IA](context.md)
- [Documentación específica del frontend](Frontend/README.md)

## Integrantes

Los nombres y responsabilidades de los integrantes serán incorporados cuando los tres equipos definan el reparto de trabajo.

## Entrega académica

Fecha prevista de entrega: **13 de noviembre de 2026**.
