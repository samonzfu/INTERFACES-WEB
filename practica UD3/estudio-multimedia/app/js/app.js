(function () {
  'use strict';

  /* ---------- ANIMACIÓN POR FOTOGRAMAS Y CAPAS ---------- */
  var lienzo = document.getElementById('lienzo');
  var ctx = lienzo.getContext('2d');
  var TOTAL = 60;
  var fotograma = 0;
  var fps = 12;
  var reproduciendo = true;
  var ultimo = 0;

  var capas = {
    fondo: document.getElementById('capaFondo'),
    sol: document.getElementById('capaSol'),
    montes: document.getElementById('capaMontes')
  };
  var salidaFps = document.getElementById('fpsValor');
  var salidaFotograma = document.getElementById('fotograma');
  var salidaDuracion = document.getElementById('duracion');
  var btnPlay = document.getElementById('btnPlay');

  function dibujarFondo(w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3a1630');
    g.addColorStop(1, '#aa597a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function dibujarSol(w, h, t) {
    var x = w * (0.2 + 0.6 * t);
    var y = h * 0.62 - h * 0.35 * Math.sin(Math.PI * t);
    var r = h * 0.14;
    var halo = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.4);
    halo.addColorStop(0, 'rgba(246, 211, 225, .8)');
    halo.addColorStop(1, 'rgba(246, 211, 225, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbe6ef';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function dibujarMontes(w, h) {
    var def = [
      { base: 0.72, color: '#6e2850', amp: 0.12, fase: 0 },
      { base: 0.82, color: '#461a38', amp: 0.10, fase: 2 },
      { base: 0.92, color: '#240d1e', amp: 0.07, fase: 4 }
    ];
    def.forEach(function (c) {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 4) {
        var y = h * c.base - h * c.amp * (0.5 + 0.5 * Math.sin(x / w * 7 + c.fase) * Math.cos(x / w * 3 + c.fase));
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    });
  }

  function dibujar() {
    var w = lienzo.width, h = lienzo.height;
    var t = fotograma / (TOTAL - 1);
    ctx.clearRect(0, 0, w, h);
    if (capas.fondo.checked) dibujarFondo(w, h);
    if (capas.sol.checked) dibujarSol(w, h, t);
    if (capas.montes.checked) dibujarMontes(w, h);
    salidaFotograma.textContent = String(fotograma + 1);
  }

  function actualizarDuracion() {
    salidaDuracion.textContent = (TOTAL / fps).toFixed(1).replace('.', ',');
  }

  function bucle(ahora) {
    if (reproduciendo && ahora - ultimo >= 1000 / fps) {
      ultimo = ahora;
      fotograma = (fotograma + 1) % TOTAL;
      dibujar();
    }
    window.requestAnimationFrame(bucle);
  }

  document.getElementById('fps').addEventListener('input', function (e) {
    fps = Number(e.target.value);
    salidaFps.textContent = String(fps);
    actualizarDuracion();
  });

  btnPlay.addEventListener('click', function () {
    reproduciendo = !reproduciendo;
    btnPlay.textContent = reproduciendo ? 'Pausa' : 'Reproducir';
  });

  document.getElementById('btnPaso').addEventListener('click', function () {
    reproduciendo = false;
    btnPlay.textContent = 'Reproducir';
    fotograma = (fotograma + 1) % TOTAL;
    dibujar();
  });

  Object.keys(capas).forEach(function (k) {
    capas[k].addEventListener('change', dibujar);
  });

  // Si el usuario prefiere menos movimiento, arranca en pausa.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reproduciendo = false;
    btnPlay.textContent = 'Reproducir';
  }

  actualizarDuracion();
  dibujar();
  window.requestAnimationFrame(bucle);

  /* ---------- EFECTOS: BRILLO, TINTE, TRANSPARENCIA ---------- */
  var img = document.getElementById('imgEfecto');
  var brillo = document.getElementById('brillo');
  var tinte = document.getElementById('tinte');
  var opacidad = document.getElementById('opacidad');
  var codigo = document.getElementById('codigoCss');

  function aplicarEfectos() {
    var b = Number(brillo.value) / 100;
    var h = Number(tinte.value);
    var o = Number(opacidad.value) / 100;
    img.style.filter = 'brightness(' + b + ') hue-rotate(' + h + 'deg)';
    img.style.opacity = String(o);
    document.getElementById('brilloValor').textContent = brillo.value;
    document.getElementById('tinteValor').textContent = tinte.value;
    document.getElementById('opacidadValor').textContent = opacidad.value;
    codigo.textContent = 'filter: brightness(' + b + ') hue-rotate(' + h + 'deg); opacity: ' + o + ';';
  }

  [brillo, tinte, opacidad].forEach(function (el) {
    el.addEventListener('input', aplicarEfectos);
  });

  document.getElementById('reiniciar').addEventListener('click', function () {
    brillo.value = 100;
    tinte.value = 0;
    opacidad.value = 100;
    aplicarEfectos();
  });

  aplicarEfectos();

  /* ---------- MODO CLARO / OSCURO ---------- */
  var raiz = document.documentElement;
  var btnTema = document.getElementById('btnTema');

  function pintarBoton() {
    var oscuro = raiz.getAttribute('data-tema') === 'oscuro';
    btnTema.textContent = oscuro ? 'Modo claro' : 'Modo oscuro';
    btnTema.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
  }

  btnTema.addEventListener('click', function () {
    var nuevo = raiz.getAttribute('data-tema') === 'oscuro' ? 'claro' : 'oscuro';
    raiz.setAttribute('data-tema', nuevo);
    try { localStorage.setItem('tema', nuevo); } catch (e) { /* sin almacenamiento */ }
    pintarBoton();
  });

  pintarBoton();
})();
