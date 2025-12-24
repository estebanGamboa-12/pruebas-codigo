import Link from 'next/link';

export default function HomePage() {
  const quickLinks = [
    {
      href: '/login',
      title: 'Acceso seguro',
      description: 'Inicia sesión para generar eventos, tipos de ticket y QR ilimitados.',
      pill: 'Login',
    },
    {
      href: '/admin',
      title: 'Dashboard de emisión',
      description: 'Crea eventos, configura tickets y lanza códigos listos para escanear.',
      pill: 'Admin',
    },
    {
      href: '/scan',
      title: 'Escáner en vivo',
      description: 'Valida entradas con cámara y obtén feedback inmediato para tu staff.',
      pill: 'Scan',
    },
  ];

  const flowSteps = [
    'Inicia sesión con tu cuenta de staff o admin.',
    'Crea un evento y define los tipos de ticket que necesitas.',
    'Emite códigos QR y pruébalos en la galería dentro del dashboard.',
    'Usa el escáner en vivo para validar accesos en el venue.',
  ];

  return (
    <section className="home">
      <div className="hero">
        <div className="pill">Panel interno · Oasis</div>
        <h2>Haz que emitir y validar entradas se sienta premium.</h2>
        <p className="hero__lead">
          Consolida todo el flujo de tickets en un solo lugar: crea eventos, genera QR y valida
          accesos en segundos con una interfaz lista para tu equipo.
        </p>
        <div className="hero__actions">
          <Link className="btn" href="/admin">
            Ir al dashboard
          </Link>
          <Link className="btn btn--ghost" href="/scan">
            Abrir escáner
          </Link>
        </div>

        <div className="hero__stats">
          <div className="stat-card">
            <span className="stat-card__label">Flujo</span>
            <strong className="stat-card__value">Crear · Emitir · Escanear</strong>
            <p className="stat-card__hint">Un recorrido guiado para pruebas rápidas.</p>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">QR instantáneos</span>
            <strong className="stat-card__value">Galería incluida</strong>
            <p className="stat-card__hint">Visualiza los códigos recién emitidos sin salir.</p>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Pensado para staff</span>
            <strong className="stat-card__value">Feedback en vivo</strong>
            <p className="stat-card__hint">Alertas claras para accesos válidos o rechazados.</p>
          </div>
        </div>
      </div>

      <section className="card-grid" aria-label="Acciones rápidas">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="card">
            <div className="pill pill--muted">{link.pill}</div>
            <h3>{link.title}</h3>
            <p>{link.description}</p>
            <span className="card__cta">Entrar →</span>
          </Link>
        ))}
      </section>

      <section className="flow">
        <div>
          <h3>Flujo sugerido</h3>
          <p>Un pequeño checklist para que puedas probar todo el circuito en minutos.</p>
        </div>
        <ol className="flow__list">
          {flowSteps.map((step, index) => (
            <li key={step}>
              <span className="flow__bullet">{index + 1}</span>
              <div>
                <strong>Paso {index + 1}</strong>
                <p>{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
