/* =========================================================
   smf | tema claro / oscuro
   - Aplica data-tema="claro|oscuro" en <html> antes de pintar
   - Recuerda la elección en localStorage (compartida por login e index)
   - Si no hay elección guardada, sigue el tema del sistema
   - Cualquier elemento con [data-cambiar-tema] alterna el tema
   ========================================================= */
(function () {
  "use strict";
  const CLAVE = "smf-tema";
  const raiz = document.documentElement;
  const consulta = window.matchMedia("(prefers-color-scheme: dark)");

  const leer = () => { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } };
  const guardar = (v) => { try { localStorage.setItem(CLAVE, v); } catch (e) { /* modo privado */ } };
  const delSistema = () => (consulta.matches ? "oscuro" : "claro");

  function etiquetar() {
    const oscuro = raiz.dataset.tema === "oscuro";
    document.querySelectorAll("[data-cambiar-tema]").forEach((b) => {
      const texto = oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
      b.setAttribute("aria-label", texto);
      b.title = texto;
      b.setAttribute("aria-pressed", String(oscuro));
    });
  }

  function aplicar(tema) {
    raiz.dataset.tema = tema;
    etiquetar();
    document.dispatchEvent(new CustomEvent("tema:cambiado", { detail: { tema } }));
  }

  // 1) antes del primer pintado, para evitar el parpadeo
  raiz.dataset.tema = leer() || delSistema();

  // 2) botones: delegación en document (sirve también para los creados después)
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-cambiar-tema]")) return;
    const nuevo = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
    guardar(nuevo);
    aplicar(nuevo);
  });

  // 3) sincronizar entre pestañas y con el sistema (si no hay elección propia)
  window.addEventListener("storage", (e) => { if (e.key === CLAVE && e.newValue) aplicar(e.newValue); });
  consulta.addEventListener("change", () => { if (!leer()) aplicar(delSistema()); });
  document.addEventListener("DOMContentLoaded", etiquetar);
})();
