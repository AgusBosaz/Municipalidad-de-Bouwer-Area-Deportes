import { useEffect, useState } from "react";
import { getPublicActivities } from "../services/activityService";
import { Link } from "react-router-dom";
import MunicipalBrand from "../components/MunicipalBrand";
import "../styles/ActividadesInicio.css";
import ImagenCampo from "../assets/images/imagen-campo.jpeg";


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

const categoriasEdad = {
  0: "Niños",
  1: "Adolescentes",
  2: "Adultos mayores",
};

const diasSemana = [
  { nombre: "Lunes", valor: 1 },
  { nombre: "Martes", valor: 2 },
  { nombre: "Miércoles", valor: 4 },
  { nombre: "Jueves", valor: 8 },
  { nombre: "Viernes", valor: 16 },
  { nombre: "Sábado", valor: 32 },
  { nombre: "Domingo", valor: 64 },
];

function mostrarDias(days) {
  const seleccionados = diasSemana
    .filter((dia) => (days & dia.valor) !== 0)
    .map((dia) => dia.nombre);

  return seleccionados.length > 0
    ? seleccionados.join(", ")
    : "Días a confirmar";
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

  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getPublicActivities()
      .then((data) => {
        if (active) setActividades(data);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar las actividades.");
      })
      .finally(() => {
        if (active) setCargando(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Filtrar las actividades
  const actividadesFiltradas = actividades.filter((actividad) => {
    const coincideBusqueda = actividad.name
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "Todas" || String(actividad.category) === categoria;

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
        style={{
          backgroundImage: `linear-gradient(
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
              <option value="0">Niños</option>
              <option value="1">Adolescentes</option>
              <option value="2">Adultos mayores</option>
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
                  {categoriasEdad[actividad.category] ?? "Categoría a confirmar"}
                </span>

                <h3>{actividad.name}</h3>

                <div className="inicio-card-informacion">
                  <div className="inicio-dato">
                    <IconoCalendario />
                    <span>
                      {mostrarDias(actividad.days)} · {actividad.startTime?.slice(0, 5)} a{" "}
                      {actividad.endTime?.slice(0, 5)}
                    </span>
                  </div>

                  <div className="inicio-dato">
                    <IconoPersonas />
                    <span>{categoriasEdad[actividad.category] ?? "Categoría a confirmar"}</span>
                  </div>

                  <div className="inicio-dato">
                    <span>Lugar: {actividad.location || "A confirmar"}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {cargando ? (
          <p className="inicio-sin-resultados">Cargando actividades...</p>
        ) : error ? (
          <p className="inicio-sin-resultados" role="alert">{error}</p>
        ) : actividadesFiltradas.length === 0 ? (
          <p className="inicio-sin-resultados">
            No se encontraron actividades.
          </p>
        ) : null}
      </main>

      {/* Pie de página */}
      <footer className="inicio-footer">
        Municipalidad de Bouwer · Área de Deportes y Recreación · Todos los derechos reservados © 2026
      </footer>
    </div>
  );
}

export default ActividadesInicio;