import logoBouwer from '../assets/images/logo-bouwer.png'

export default function MunicipalBrand() {
  return (
    <section
      className="municipal-brand"
      aria-label="Municipalidad de Bouwer, Área de Deportes"
    >
      <div className="brand-lockup">
        <img
          className="brand-logo"
          src={logoBouwer}
          alt="Municipalidad de Bouwer"
          width="883"
          height="294"
        />
      </div>
      <p className="brand-area">Área de Deportes</p>
      <p className="brand-description">
        Gestión de actividades, encuentros
        <br />
        y asistencias de alumnos.
      </p>
    </section>
  )
}

