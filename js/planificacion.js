(() => {
  "use strict";

  // ===== Datos base del plan de ahorro =====
  const APORTE_MENSUAL = 5000;
  const ANIO_INICIO = 2027;
  const TOTAL_MESES = 36;
  const META_TOTAL = 180000;

  const MESES_LABEL = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const MESES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Orden de prioridad: cada mes se financia por completo la primera meta pendiente.
  const CATEGORIAS = [
    { id: "reserva", label: "Fondo de Reserva", icon: "🛡️", monto: 30000 },
    { id: "carro", label: "Enganche de Carro", icon: "🚗", monto: 10000 },
    { id: "casa", label: "Enganche de Casa / Terreno", icon: "🏡", monto: 70000 },
    { id: "electro", label: "Electrodomésticos & Equipamiento", icon: "🛋️", monto: 20000 },
    { id: "boda", label: "Boda & Luna de Miel", icon: "💍", monto: 50000 }
  ];
  const CAT_BY_ID = {};
  CATEGORIAS.forEach((c) => { CAT_BY_ID[c.id] = c; });

  const formatQ = (n) => "Q " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ===== Construcción del cronograma mes a mes =====
  const restante = {};
  const acumuladoCat = {};
  CATEGORIAS.forEach((c) => { restante[c.id] = c.monto; acumuladoCat[c.id] = 0; });

  let catIndex = 0;
  let acumuladoTotal = 0;
  const schedule = [];

  for (let i = 0; i < TOTAL_MESES; i++) {
    while (catIndex < CATEGORIAS.length - 1 && restante[CATEGORIAS[catIndex].id] <= 0) catIndex++;
    const cat = CATEGORIAS[catIndex];
    const aporte = Math.min(APORTE_MENSUAL, Math.max(restante[cat.id], 0)) || APORTE_MENSUAL;

    restante[cat.id] -= aporte;
    acumuladoCat[cat.id] += aporte;
    acumuladoTotal += aporte;

    const anio = ANIO_INICIO + Math.floor(i / 12);
    const mesNum = (i % 12) + 1;

    schedule.push({
      anio,
      mesNum,
      mesLabel: MESES_LABEL[mesNum - 1],
      mesLargo: MESES_LARGO[mesNum - 1],
      categoriaId: cat.id,
      aporte,
      acumuladoCategoria: acumuladoCat[cat.id],
      metaCategoria: cat.monto,
      acumuladoTotal
    });
  }

  // Mes en que cada categoría se completa (para el resumen financiero)
  const finCategoria = {};
  schedule.forEach((m) => {
    if (m.acumuladoCategoria >= m.metaCategoria && !finCategoria[m.categoriaId]) {
      finCategoria[m.categoriaId] = m;
    }
  });

  const byYear = (anio) => schedule.filter((m) => m.anio === anio);

  const buildSegments = (months) => {
    const segments = [];
    months.forEach((m) => {
      const last = segments[segments.length - 1];
      if (last && last.categoriaId === m.categoriaId) {
        last.mesFinNum = m.mesNum;
        last.mesFinLabel = m.mesLabel;
        last.numMeses += 1;
        last.aportePeriodo += m.aporte;
        last.acumuladoCategoriaFin = m.acumuladoCategoria;
      } else {
        segments.push({
          categoriaId: m.categoriaId,
          mesInicioNum: m.mesNum,
          mesInicioLabel: m.mesLabel,
          mesFinNum: m.mesNum,
          mesFinLabel: m.mesLabel,
          numMeses: 1,
          aportePeriodo: m.aporte,
          acumuladoCategoriaFin: m.acumuladoCategoria,
          metaCategoria: m.metaCategoria
        });
      }
    });
    return segments;
  };

  // ===== Render =====
  const $ = (sel) => document.querySelector(sel);
  const $all = (sel) => document.querySelectorAll(sel);

  // Grid mensual + total del año + progreso del plan, por cada año declarado en el DOM
  $all("[data-month-grid]").forEach((grid) => {
    const anio = Number(grid.getAttribute("data-month-grid"));
    const months = byYear(anio);
    if (!months.length) return;

    grid.innerHTML = months.map((m) => `
      <div class="month-cell cat-${m.categoriaId}" title="${m.mesLargo} ${m.anio} · ${CAT_BY_ID[m.categoriaId].label} · Acumulado: ${formatQ(m.acumuladoTotal)}">
        <span class="mc-month">${m.mesLabel}</span>
        <span class="mc-total">${formatQ(m.acumuladoTotal)}</span>
      </div>
    `).join("");

    const totalEl = document.querySelector(`[data-year-total="${anio}"]`);
    if (totalEl) totalEl.textContent = formatQ(months[months.length - 1].acumuladoTotal);

    const pctEl = document.querySelector(`[data-year-pct="${anio}"]`);
    const fillEl = document.querySelector(`[data-year-fill="${anio}"]`);
    const pct = (months[months.length - 1].acumuladoTotal / META_TOTAL) * 100;
    if (pctEl) pctEl.textContent = Math.round(pct) + "%";
    if (fillEl) fillEl.style.width = Math.min(100, pct) + "%";

    const segList = document.querySelector(`[data-segment-list="${anio}"]`);
    if (segList) {
      const segments = buildSegments(months);
      segList.innerHTML = segments.map((s) => {
        const cat = CAT_BY_ID[s.categoriaId];
        const rango = s.mesInicioLabel === s.mesFinLabel ? s.mesInicioLabel : `${s.mesInicioLabel} – ${s.mesFinLabel}`;
        const completado = s.acumuladoCategoriaFin >= s.metaCategoria;
        const pctMeta = Math.min(100, (s.acumuladoCategoriaFin / s.metaCategoria) * 100);
        const statusTxt = completado
          ? `✅ Completado en ${s.mesFinLabel} ${anio}`
          : `🔄 En curso · continúa en ${anio + 1}`;
        const statusClass = completado ? "completado" : "encurso";
        return `
          <div class="segment-item cat-${s.categoriaId}" data-cat="${s.categoriaId}">
            <div class="seg-top">
              <span class="seg-motivo">${cat.icon} ${cat.label}</span>
              <span class="seg-aporte">${s.numMeses} mes${s.numMeses > 1 ? "es" : ""} · ${formatQ(s.aportePeriodo)}</span>
            </div>
            <div class="seg-rango">${rango} ${anio}</div>
            <div class="mini-track"><div class="mini-fill" style="width:${pctMeta}%"></div></div>
            <div class="seg-meta-row">
              <span>${formatQ(s.acumuladoCategoriaFin)} de ${formatQ(s.metaCategoria)}</span>
              <span class="seg-status ${statusClass}">${statusTxt}</span>
            </div>
          </div>
        `;
      }).join("");
    }
  });

  // Fecha de cumplimiento por categoría en el resumen financiero
  $all("[data-cat-complete]").forEach((el) => {
    const id = el.getAttribute("data-cat-complete");
    const fin = finCategoria[id];
    el.textContent = fin ? `Se completa: ${fin.mesLargo} ${fin.anio}` : "—";
  });

  // ===== Animaciones (GSAP) =====
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const hero = document.querySelector("header.hero");
    if (hero) {
      const heroLeft = hero.querySelector(".hero-inner > div:first-child");
      const heroRight = hero.querySelector(".goalcard");
      gsap.from(hero, { opacity: 0, y: 28, duration: 0.9, ease: "power3.out" });
      if (heroLeft) {
        gsap.from(heroLeft.children, {
          opacity: 0, y: 34, filter: "blur(10px)", duration: 0.9,
          ease: "power3.out", stagger: 0.08, delay: 0.1
        });
      }
      if (heroRight) {
        gsap.from(heroRight, {
          opacity: 0, y: 34, filter: "blur(10px)", duration: 1.0, ease: "power3.out", delay: 0.2
        });
      }
    }

    const sections = gsap.utils.toArray("section");
    sections.forEach((sec) => {
      const items = sec.querySelectorAll(".card, .item, .notice, .timeline-item, .segment-item, .month-cell");
      gsap.from(sec, {
        opacity: 0, y: 34, duration: 0.955, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 86%" }
      });
      if (items.length) {
        gsap.from(items, {
          opacity: 0, y: 22, filter: "blur(10px)", duration: 0.95, ease: "power3.out",
          stagger: 0.03, scrollTrigger: { trigger: sec, start: "top 86%" }
        });
      }
    });

    // Barras de progreso: animar el ancho al entrar en viewport
    $all(".progress-fill, .mini-fill").forEach((bar) => {
      const width = bar.style.width;
      gsap.fromTo(bar, { width: "0%" }, {
        width,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: { trigger: bar, start: "top 90%" }
      });
    });

    const goal = document.querySelector(".goal-amount");
    if (goal) {
      gsap.to(goal, {
        textShadow: "0 14px 34px rgba(184,138,43,.35)",
        duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1
      });
    }

    const buttons = gsap.utils.toArray(".btn");
    buttons.forEach((b) => {
      b.addEventListener("mouseenter", () => gsap.to(b, { scale: 1.02, duration: 0.18, ease: "power2.out" }));
      b.addEventListener("mouseleave", () => gsap.to(b, { scale: 1.0, duration: 0.18, ease: "power2.out" }));
    });
  }
})();
