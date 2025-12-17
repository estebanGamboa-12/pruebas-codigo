// ====== Datos (edita a tu gusto) ======
const OASIS = {
  // Pon aquí el número real (formato internacional sin +)
  // Ejemplo España: 34600111222
  whatsappNumber: "34665274194",
  venueName: "Oasis",
  city: "El Tiemblo",
};

const EVENTS = [
  {
    title: "Tardebuena",
    date: "24/12",
    tag: "Especial",
    desc: "Edición navideña con ambiente premium y sorpresas.",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Noche Halloween",
    date: "31/10",
    tag: "Temática",
    desc: "Disfraces, decorado y música para una noche intensa.",
    img: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Carnaval",
    date: "08/02",
    tag: "Fiesta",
    desc: "Máscaras, color y un line-up que no falla.",
    img: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1600&q=80",
  },
];

// ====== Helpers ======
function $(sel, parent = document) {
  return parent.querySelector(sel);
}
function $all(sel, parent = document) {
  return [...parent.querySelectorAll(sel)];
}

function buildWhatsAppLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${OASIS.whatsappNumber}?text=${text}`;
}

function formatReservaMsg({ nombre, personas, fecha, hora, notas }) {
  const lines = [
    `Hola, soy ${nombre}. Quiero hacer una reserva en ${OASIS.venueName}.`,
    `• Personas: ${personas}`,
    `• Fecha: ${fecha}`,
    `• Hora: ${hora}`,
  ];
  if (notas && notas.trim().length) lines.push(`• Notas: ${notas.trim()}`);
  lines.push("Gracias.");
  return lines.join("\n");
}

// ====== Render eventos ======
function renderEvents() {
  const grid = $("#eventsGrid");
  if (!grid) return;

  grid.innerHTML = EVENTS.map((ev, idx) => {
    return `
      <article class="event-card" data-idx="${idx}">
        <div class="event-media" style="background-image:url('${ev.img}')"></div>
        <div class="event-body">
          <div class="event-top">
            <span class="chip">${ev.tag}</span>
            <span class="event-date">${ev.date}</span>
          </div>
          <h3 class="event-title">${ev.title}</h3>
          <p class="event-desc">${ev.desc}</p>
          <div class="event-actions">
            <a class="btn btn-ghost" href="#contacto">Info</a>
            <button class="btn btn-primary js-reserva" type="button">Reservar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Botones reservar dentro de tarjetas
  $all(".js-reserva", grid).forEach(btn => {
    btn.addEventListener("click", () => openModal());
  });
}

// ====== Mobile menu ======
function setupMobileMenu() {
  const hamburger = $("#hamburger");
  const mobileMenu = $("#mobileMenu");
  if (!hamburger || !mobileMenu) return;

  const toggle = () => {
    const isOpen = mobileMenu.classList.toggle("show");
    hamburger.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  };

  hamburger.addEventListener("click", toggle);

  // Cerrar al clicar un link
  $all(".m-link", mobileMenu).forEach(a => {
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      mobileMenu.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    }
  });
}

// ====== Modal reserva ======
function openModal() {
  const modal = $("#modal");
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  // focus en primer input
  const firstInput = modal.querySelector("input[name='nombre']");
  if (firstInput) setTimeout(() => firstInput.focus(), 0);
}

function closeModal() {
  const modal = $("#modal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function setupModal() {
  const openBtns = ["#openReserva", "#openReservaMobile", "#openReservaHero", "#openReservaEvents", "#openReservaAbout", "#openReservaContact"]
    .map(id => $(id))
    .filter(Boolean);

  openBtns.forEach(b => b.addEventListener("click", openModal));

  $("#closeModal")?.addEventListener("click", closeModal);
  $("#cancelModal")?.addEventListener("click", closeModal);
  $("#modalBackdrop")?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Form -> WhatsApp
  $("#reservaForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = {
      nombre: form.nombre.value.trim(),
      personas: form.personas.value,
      fecha: form.fecha.value,
      hora: form.hora.value,
      notas: form.notas.value,
    };

    const msg = formatReservaMsg(data);
    const link = buildWhatsAppLink(msg);
    window.open(link, "_blank", "noopener,noreferrer");
    closeModal();
    form.reset();
  });
}

// ====== Link WhatsApp contacto ======
function setupContactLinks() {
  const wa = $("#waLink");
  if (!wa) return;

  const msg = `Hola, quiero info para reservar en ${OASIS.venueName} (${OASIS.city}).`;
  wa.href = buildWhatsAppLink(msg);
}

// ====== Smooth scroll ======
function setupSmoothScroll() {
  $all('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ====== Init ======
(function init(){
  renderEvents();
  setupMobileMenu();
  setupModal();
  setupContactLinks();
  setupSmoothScroll();
  const y = new Date().getFullYear();
  const year = $("#year");
  if (year) year.textContent = y;
})();
