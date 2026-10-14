import { Link } from 'react-router-dom'

import '../styles/dashboard.css'

function DashboardPage() {
  return (
    <main className="dashboard">

      <header className="dashboard-topbar">
        <div className="dashboard-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Buscar"
          />
        </div>

        <div className="dashboard-profile">
          <div className="dashboard-profile-icon">
            👤
          </div>
        </div>
      </header>

      <section className="dashboard-header">
        <h1>
          Hola, Coordinador
        </h1>

        <p>
          ¿Qué querés hacer hoy?
        </p>
      </section>

      <section className="dashboard-main-cards">

        <Link
          to="/docentes"
          className="dashboard-action-card"
        >
          <div className="dashboard-card-icon">
            👤
          </div>

          <div>
            <h2>
              Docentes
            </h2>

            <p>
              Gestionar docentes
              <br />
              del centro
            </p>
          </div>

          <span className="dashboard-arrow">
            →
          </span>
        </Link>

        <Link
          to="/actividades"
          className="dashboard-action-card"
        >
          <div className="dashboard-card-icon">
            ⚽
          </div>

          <div>
            <h2>
              Actividades
            </h2>

            <p>
              Gestionar actividades
              <br />
              del centro
            </p>
          </div>

          <span className="dashboard-arrow">
            →
          </span>
        </Link>

        <Link
          to="/asignaciones"
          className="dashboard-action-card"
        >
          <div className="dashboard-card-icon">
            ↔
          </div>

          <div>
            <h2>
              Asignaciones
            </h2>

            <p>
              Asignar docentes
              <br />
              a actividades
            </p>
          </div>

          <span className="dashboard-arrow">
            →
          </span>
        </Link>

        <div className="dashboard-total-card">
          <div>
            <h2>
              Total de actividades
            </h2>

            <strong>
              12
            </strong>
          </div>

          <div className="dashboard-total-icon">
            ▣
          </div>
        </div>

      </section>

      <section className="dashboard-recent">

        <div className="dashboard-section-header">
          <div>
            <h2>
              Actividades Recientes
            </h2>

            <p>
              Últimas actividades registradas
            </p>
          </div>

          <Link to="/actividades">
            Ver todas
          </Link>
        </div>

        <div className="dashboard-recent-card">

          <div className="dashboard-recent-head">
            <span>
              Actividad
            </span>

            <span>
              Docente
            </span>

            <span>
              Horario
            </span>

            <span>
              Acción
            </span>
          </div>

          <div className="dashboard-recent-row">
            <span>
              Fútbol Infantil
            </span>

            <span>
              Santiago Pérez
            </span>

            <span>
              Lun 16:00
            </span>

            <Link to="/actividades">
              →
            </Link>
          </div>

          <div className="dashboard-recent-row">
            <span>
              Natación Adultos
            </span>

            <span>
              María Gómez
            </span>

            <span>
              Mar 09:00
            </span>

            <Link to="/actividades">
              →
            </Link>
          </div>

          <div className="dashboard-recent-row">
            <span>
              Yoga
            </span>

            <span>
              Lucía Torres
            </span>

            <span>
              Mié 18:00
            </span>

            <Link to="/actividades">
              →
            </Link>
          </div>

          <div className="dashboard-recent-row">
            <span>
              Básquet Juvenil
            </span>

            <span>
              Diego Castro
            </span>

            <span>
              Vie 17:00
            </span>

            <Link to="/actividades">
              →
            </Link>
          </div>

        </div>

      </section>

    </main>
  )
}

export default DashboardPage