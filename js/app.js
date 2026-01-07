(() => {
  "use strict";

  const CONFIG = {
      novio: "Guillermo",
      novia: "Michel",

      // Fecha exacta (Guatemala -06:00)
      fechaISO: "2026-02-20T12:00:00-06:00",
      fechaTexto: "Viernes, 20 de febrero de 2026",
      horaTexto: "12:00 p.m.",

      // Ubicación (Waze)
      lugarNombre: "Eventos La Arboleda",
      lugarDireccion: "Presiona el botón para abrir la ubicación.",
      mapaLink: "https://waze.com/ul/h9fxdtmyzr",

      // WhatsApp (sin +, sin espacios)
      whatsappNumero: "50246116969",

      // RSVP límite recomendado
      fechaLimiteRSVP: "10/02/2026"
    };

  const $ = (id) => document.getElementById(id);

  const setText = (id, val) => {
    const el = $(id);
    if (el) el.textContent = val;
  };

  const formatGTPhone = (digits) => {
    const d = String(digits || "").replace(/\D/g, "");
    if (d.length === 11 && d.startsWith("502")) {
      return "+502 " + d.slice(3, 7) + "-" + d.slice(7);
    }
    if (d.length === 12 && d.startsWith("502")) {
      return "+502 " + d.slice(3, 7) + "-" + d.slice(7);
    }
    return d ? ("+" + d) : "";
  };

  // Textos principales
  setText("novio", CONFIG.novio);
  setText("novia", CONFIG.novia);
  setText("fechaTexto", CONFIG.fechaTexto);
  setText("horaTexto", CONFIG.horaTexto);
  setText("lugarNombre", CONFIG.lugarNombre);
  setText("whatsTexto", formatGTPhone(CONFIG.whatsappNumero));
  setText("fechaLimite", CONFIG.fechaLimiteRSVP);

  // Countdown
  const target = new Date(CONFIG.fechaISO).getTime();
  const dEl = $("d");
  const hEl = $("h");
  const mEl = $("m");
  const sEl = $("s");
  const msgEl = $("countMsg");

  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    diff -= hrs * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);

    if (dEl) dEl.textContent = String(days);
    if (hEl) hEl.textContent = String(hrs).padStart(2, "0");
    if (mEl) mEl.textContent = String(mins).padStart(2, "0");
    if (sEl) sEl.textContent = String(secs).padStart(2, "0");

    if (target - now <= 0 && msgEl) {
      msgEl.textContent = "Hoy es el gran día. Nos vemos pronto.";
    }
  };

  tick();
  window.setInterval(tick, 1000);

  // WhatsApp RSVP
  const waLink = (text) => {
    const encoded = encodeURIComponent(text);
    return "https://wa.me/" + CONFIG.whatsappNumero + "?text=" + encoded;
  };

  const buildRSVPMessage = () => {
    const nombre = (($("nombreInv")?.value) || "").trim();
    const asistencia = ($("asistencia")?.value) || "";
    const cant = ($("acompanantes")?.value) || "1";
    const notaCorta = (($("notaCorta")?.value) || "").trim();
    const notaLarga = (($("notaLarga")?.value) || "").trim();

    const lines = [];
    lines.push("Hola, confirmación de boda:");
    lines.push("Boda: " + CONFIG.novio + " y " + CONFIG.novia);
    if (nombre) lines.push("Nombre: " + nombre);
    lines.push("Asistencia: " + asistencia);
    lines.push("Cantidad: " + cant);
    if (notaCorta) lines.push("Nota: " + notaCorta);
    if (notaLarga) lines.push("Mensaje: " + notaLarga);
    lines.push("");
    lines.push("Gracias.");

    return lines.join("\n");
  };

  const btnRSVP = $("btnRSVP");
  const msgEstado = $("msgEstado");

  if (btnRSVP) {
    btnRSVP.addEventListener("click", () => {
      const nombre = (($("nombreInv")?.value) || "").trim();
      if (!nombre) {
        if (msgEstado) msgEstado.textContent = "Por favor escribe tu nombre y apellido.";
        $("nombreInv")?.focus();
        return;
      }
      if (msgEstado) msgEstado.textContent = "";
      window.open(waLink(buildRSVPMessage()), "_blank", "noopener");
    });
  }

  // Calendario (ICS)
  const downloadICS = () => {
    const start = new Date(CONFIG.fechaISO);
    const end = new Date(start.getTime() + (3 * 60 * 60 * 1000));

    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (dt) => {
      const y = dt.getUTCFullYear();
      const mo = pad(dt.getUTCMonth() + 1);
      const d = pad(dt.getUTCDate());
      const h = pad(dt.getUTCHours());
      const mi = pad(dt.getUTCMinutes());
      const s = pad(dt.getUTCSeconds());
      return `${y}${mo}${d}T${h}${mi}${s}Z`;
    };

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Invitacion Boda//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@invitacion",
      "DTSTAMP:" + fmt(new Date()),
      "DTSTART:" + fmt(start),
      "DTEND:" + fmt(end),
      "SUMMARY:Boda de " + CONFIG.novio + " y " + CONFIG.novia,
      "LOCATION:" + (CONFIG.lugarNombre || "Ubicación"),
      "DESCRIPTION:Ubicación (Waze): " + (CONFIG.mapaLink || ""),
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "boda.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const btnAgregar = $("btnAgregar");
  if (btnAgregar) btnAgregar.addEventListener("click", downloadICS);

  // Animaciones (GSAP)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const hero = document.querySelector("header.hero");
    if (hero) {
      const heroLeft = hero.querySelector(".hero-inner > div:first-child");
      const heroRight = hero.querySelector(".countcard");
      gsap.from(hero, { opacity: 0, y: 28, duration: 0.9, ease: "power3.out" });
      if (heroLeft) {
        gsap.from(heroLeft.children, {
          opacity: 0,
          y: 34,
          filter: "blur(10px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.1
        });
      }
      if (heroRight) {
        gsap.from(heroRight, {
          opacity: 0,
          y: 34,
          filter: "blur(10px)",
          duration: 1.0,
          ease: "power3.out",
          delay: 0.2
        });
      }
    }

    // Sections reveal on scroll
    const sections = gsap.utils.toArray("section");
    sections.forEach((sec) => {
      const items = sec.querySelectorAll(".card, .item, .notice, iframe, .gallery");
      gsap.from(sec, {
        opacity: 0,
        y: 34,
        duration: 0.955,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sec,
          start: "top 86%"
        }
      });
      if (items.length) {
        gsap.from(items, {
          opacity: 0,
          y: 22,
          filter: "blur(10px)",
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: sec,
            start: "top 86%"
          }
        });
      }
    });

    
    // Glow pulse (contador)
    const nums = document.querySelectorAll(".unit .n");
    if (nums && nums.length) {
      gsap.to(nums, {
        textShadow: "0 14px 34px rgba(184,138,43,.35)",
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }

    // Buttons micro-interaction
    const buttons = gsap.utils.toArray(".btn");
    buttons.forEach((b) => {
      b.addEventListener("mouseenter", () => {
        gsap.to(b, { scale: 1.02, duration: 0.18, ease: "power2.out" });
      });
      b.addEventListener("mouseleave", () => {
        gsap.to(b, { scale: 1.0, duration: 0.18, ease: "power2.out" });
      });
    });
  }
})();
