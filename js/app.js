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
      whatsappNumero: "50239517765",

      // RSVP límite recomendado
      fechaLimiteRSVP: "10/02/2026"
    };

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };

    setText("novio", CONFIG.novio);
    setText("novia", CONFIG.novia);
    setText("fechaTexto", CONFIG.fechaTexto);
    setText("horaTexto", CONFIG.horaTexto);

    setText("lugarNombre", CONFIG.lugarNombre);
    setText("lugarDireccion", CONFIG.lugarDireccion);

    setHref("linkMapa", CONFIG.mapaLink);
    setHref("btnMapa", CONFIG.mapaLink);

    setText("whatsTexto", "+502 3951-7765");
    setText("fechaLimite", CONFIG.fechaLimiteRSVP);

    // Countdown
    const target = new Date(CONFIG.fechaISO).getTime();
    const dEl = document.getElementById("d");
    const hEl = document.getElementById("h");
    const mEl = document.getElementById("m");
    const sEl = document.getElementById("s");
    const msgEl = document.getElementById("countMsg");

    function tick(){
      const now = Date.now();
      let diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000*60*60*24));
      diff -= days * (1000*60*60*24);
      const hrs = Math.floor(diff / (1000*60*60));
      diff -= hrs * (1000*60*60);
      const mins = Math.floor(diff / (1000*60));
      diff -= mins * (1000*60);
      const secs = Math.floor(diff / 1000);

      if (dEl) dEl.textContent = String(days);
      if (hEl) hEl.textContent = String(hrs).padStart(2, "0");
      if (mEl) mEl.textContent = String(mins).padStart(2, "0");
      if (sEl) sEl.textContent = String(secs).padStart(2, "0");

      if (target - now <= 0 && msgEl){
        msgEl.textContent = "Hoy es el gran día. Nos vemos pronto.";
      }
    }
    tick();
    setInterval(tick, 1000);

    // WhatsApp RSVP
    function buildRSVPMessage(){
      const nombre = (document.getElementById("nombreInv")?.value || "").trim();
      const asistencia = document.getElementById("asistencia")?.value || "";
      const cant = document.getElementById("acompanantes")?.value || "1";
      const notaCorta = (document.getElementById("notaCorta")?.value || "").trim();
      const notaLarga = (document.getElementById("notaLarga")?.value || "").trim();

      const lines = [];
      lines.push("Hola, confirmación de boda:");
      if (nombre) lines.push("Nombre: " + nombre);
      lines.push(asistencia);
      lines.push("Cantidad: " + cant);
      if (notaCorta) lines.push("Nota: " + notaCorta);
      if (notaLarga) lines.push("Mensaje: " + notaLarga);
      lines.push("");
      lines.push("Gracias.");

      return lines.join("\n");
    }

    function waLink(text){
      const encoded = encodeURIComponent(text);
      return "https://wa.me/" + CONFIG.whatsappNumero + "?text=" + encoded;
    }

    const btnWhatsapp = document.getElementById("btnWhatsapp");
    if (btnWhatsapp){
      btnWhatsapp.href = waLink("Hola, confirmo asistencia a la boda de Guillermo y Jenifer.");
      btnWhatsapp.target = "_blank";
    }

    const btnRSVP = document.getElementById("btnRSVP");
    const btnCopiar = document.getElementById("btnCopiar");
    const msgEstado = document.getElementById("msgEstado");

    if (btnRSVP){
      btnRSVP.addEventListener("click", () => {
        const text = buildRSVPMessage();
        window.open(waLink(text), "_blank", "noopener");
      });
    }

    if (btnCopiar){
      btnCopiar.addEventListener("click", async () => {
        const text = buildRSVPMessage();
        try{
          await navigator.clipboard.writeText(text);
          if (msgEstado) msgEstado.textContent = "Mensaje copiado. Pégalo en WhatsApp.";
        }catch(e){
          if (msgEstado) msgEstado.textContent = "No se pudo copiar automáticamente. Copia manualmente el texto.";
        }
      });
    }

    // Calendario (ICS)
    function downloadICS(){
      const start = new Date(CONFIG.fechaISO);
      const end = new Date(start.getTime() + (3 * 60 * 60 * 1000));

      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (dt) => {
        const y = dt.getUTCFullYear();
        const mo = pad(dt.getUTCMonth()+1);
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
        "LOCATION:Ubicación en Waze",
        "DESCRIPTION:Ubicación: " + CONFIG.mapaLink,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "boda.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    const btnAgregar = document.getElementById("btnAgregar");
    if (btnAgregar){
      btnAgregar.addEventListener("click", downloadICS);
    }
