(() => {
  "use strict";

  const claveTema = "smf-tema";
  const botones = () => document.querySelectorAll("[data-tema-toggle]");

  function aplicarTema(tema) {
    document.documentElement.dataset.tema = tema;
    botones().forEach((boton) => {
      const temaDestino = tema === "oscuro" ? "claro" : "oscuro";
      boton.textContent = temaDestino === "oscuro" ? "☾ Modo oscuro" : "☀ Modo claro";
      boton.setAttribute("aria-label", `Cambiar a modo ${temaDestino}`);
      boton.setAttribute("aria-pressed", String(tema === "oscuro"));
    });
  }

  let temaGuardado = "claro";
  try {
    temaGuardado = localStorage.getItem(claveTema) === "oscuro" ? "oscuro" : "claro";
  } catch (error) {
    console.error("No se pudo leer el tema guardado.", error);
  }
  aplicarTema(temaGuardado);

  document.addEventListener("DOMContentLoaded", () => {
    aplicarTema(document.documentElement.dataset.tema);
    botones().forEach((boton) => {
      boton.addEventListener("click", () => {
        const tema = document.documentElement.dataset.tema === "oscuro" ? "claro" : "oscuro";
        aplicarTema(tema);
        try {
          localStorage.setItem(claveTema, tema);
        } catch (error) {
          console.error("No se pudo guardar la preferencia de tema.", error);
        }
      });
    });
  });
})();
