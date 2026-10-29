import { useState } from "react";
import { Link } from "react-router-dom";
import MunicipalBrand from "../components/MunicipalBrand";
import "../styles/ActividadesInicio.css";
import ImagenCampo from "../assets/images/imagen-campo.jpeg";

const actividades = [
  {
    id: 1,
    nombre: "Fútbol infantil",
    categoria: "Fútbol",
    dias: "Lunes y miércoles",
    edad: "De 6 a 12 años",
  },
  {
    id: 2,
    nombre: "Yoga",
    categoria: "Bienestar",
    dias: "Martes y jueves",
    edad: "Desde 16 años",
  },
  {
    id: 3,
    nombre: "Básquet juvenil",
    categoria: "Básquet",
    dias: "Lunes y miércoles",
    edad: "De 12 a 18 años",
  },
  {
    id: 4,
    nombre: "Natación",
    categoria: "Natación",
    dias: "Martes y jueves",
    edad: "De 6 a 18 años",
  },
  {
    id: 5,
    nombre: "Vóley",
    categoria: "Vóley",
    dias: "Lunes y viernes",
    edad: "Desde 12 años",
  },
  {
    id: 6,
    nombre: "Actividad física",
    categoria: "Actividad Física",
    dias: "Lunes, miércoles y viernes",
    edad: "Desde 16 años",
  },
];

function IconoCalendario() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
      <path d="M8 14h2M14 14h2M8 17h2" />
    </svg>
  );
}

function IconoPersonas() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2H3Z" />
      <path d="M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1h-4" />
    </svg>
  );
}

function IconoUsuario() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2H4Z" />
    </svg>
  );
}

function ActividadesInicio() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  // Filtrar las actividades
  const actividadesFiltradas = actividades.filter((actividad) => {
    const coincideBusqueda = actividad.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "Todas" || actividad.categoria === categoria;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="inicio-actividades">

      {/* Encabezado */}
      <header className="inicio-header">
        <div className="inicio-marca">
          <MunicipalBrand />
          <div className="inicio-area">
            Área de Deportes y Recreación
          </div>
        </div>

        <nav className="inicio-navegacion">
          <a href="#actividades">Actividades</a>

          <Link to="/login" className="inicio-boton-login">
            <IconoUsuario />
            Ingresar
          </Link>
        </nav>
      </header>

      {/* Banner principal */}
      <section className="inicio-banner"
       style={{ backgroundImage: `linear-gradient(
        110deg,
        rgba(255, 235, 240, 1) 0%,
        rgba(255, 235, 240, 0.85) 28%,
        rgba(255, 235, 240, 0)),
      url(${ImagenCampo})`,
  }}
>
        <div className="inicio-banner-contenido">
          <div className="inicio-linea"></div>
          <h1>Encontrá tu próxima actividad</h1>
          <p>
            Deporte y bienestar para toda la comunidad de Bouwer.
          </p>
        </div>
      </section>

      {/* Actividades disponibles */}
      <main id="actividades" className="inicio-contenido">
        <div className="inicio-superior">
          <div className="inicio-titulos">
            <h2>Actividades disponibles</h2>
            <p>Explorá las propuestas del Área de Deportes.</p>
          </div>

          <div className="inicio-filtros">
            <div className="inicio-buscador">
              <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>

              <input
                type="text"
                placeholder="Buscar actividad"
                aria-label="Buscar actividad"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              aria-label="Filtrar por categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Fútbol">Fútbol</option>
              <option value="Bienestar">Bienestar</option>
              <option value="Básquet">Básquet</option>
              <option value="Natación">Natación</option>
              <option value="Vóley">Vóley</option>
              <option value="Actividad Física">Actividad Física</option>
            </select>
          </div>
        </div>

        {/* Tarjetas de actividades */}
        <div className="inicio-grid">
          {actividadesFiltradas.map((actividad) => (
            <article className="inicio-card" key={actividad.id}>

              {/* Imagen vacía por ahora */}
              <div className="inicio-card-imagen"></div>

              <div className="inicio-card-contenido">
                <span className="inicio-categoria">
                  {actividad.categoria}
                </span>

                <h3>{actividad.nombre}</h3>

                <div className="inicio-card-informacion">
                  <div className="inicio-dato">
                    <IconoCalendario />
                    <span>{actividad.dias}</span>
                  </div>

                  <div className="inicio-dato">
                    <IconoPersonas />
                    <span>{actividad.edad}</span>
                  </div>

                  <span className="inicio-ver-detalles">
                    Ver detalles
                    <span aria-hidden="true">❯</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {actividadesFiltradas.length === 0 && (
          <p className="inicio-sin-resultados">
            No se encontraron actividades.
          </p>
        )}
      </main>

      {/* Pie de página */}
      <footer className="inicio-footer">
        Municipalidad de Bouwer · Área de Deportes y Recreación · Todos los derechos reservados © 2026
      </footer>
    </div>
  );
}

export default ActividadesInicio;