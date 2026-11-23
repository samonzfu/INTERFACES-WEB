(function () {
  'use strict';

  var menosMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  var txtPlay = document.getElementById('txtPlay');
  var rangoFotograma = document.getElementById('fotogramaRango');

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
    rangoFotograma.value = String(fotograma + 1);
  }

  function actualizarDuracion() {
    salidaDuracion.textContent = (TOTAL / fps).toFixed(1).replace('.', ',');
  }

  function pintarPlay() {
    btnPlay.setAttribute('data-reproduciendo', reproduciendo ? 'true' : 'false');
    txtPlay.textContent = reproduciendo ? 'Pausa' : 'Reproducir';
  }

  function bucle(ahora) {
    if (reproduciendo && ahora - ultimo >= 1000 / fps) {
      ultimo = ahora;
      fotograma = (fotograma + 1) % TOTAL;
      dibujar();
    }
    window.requestAnimationFrame(bucle);
  }

  function pausar() {
    reproduciendo = false;
    pintarPlay();
  }

  document.getElementById('fps').addEventListener('input', function (e) {
    fps = Number(e.target.value);
    salidaFps.textContent = String(fps);
    actualizarDuracion();
  });

  btnPlay.addEventListener('click', function () {
    reproduciendo = !reproduciendo;
    pintarPlay();
  });

  document.getElementById('btnPaso').addEventListener('click', function () {
    pausar();
    fotograma = (fotograma + 1) % TOTAL;
    dibujar();
  });

  document.getElementById('btnAnterior').addEventListener('click', function () {
    pausar();
    fotograma = (fotograma - 1 + TOTAL) % TOTAL;
    dibujar();
  });

  rangoFotograma.addEventListener('input', function (e) {
    pausar();
    fotograma = Number(e.target.value) - 1;
    dibujar();
  });

  Object.keys(capas).forEach(function (k) {
    capas[k].addEventListener('change', dibujar);
  });

  // Si el usuario prefiere menos movimiento, arranca en pausa.
  if (menosMovimiento) { reproduciendo = false; }

  pintarPlay();
  actualizarDuracion();
  dibujar();
  window.requestAnimationFrame(bucle);

  /* ---------- EFECTOS: BRILLO, TINTE, TRANSPARENCIA ---------- */
  var img = document.getElementById('imgEfecto');
  var brillo = document.getElementById('brillo');
  var tinte = document.getElementById('tinte');
  var opacidad = document.getElementById('opacidad');
  var codigo = document.getElementById('codigoCss');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-preset]'));

  function marcarPreset() {
    var actual = [brillo.value, tinte.value, opacidad.value].join(',');
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-preset') === actual ? 'true' : 'false');
    });
  }

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
    marcarPreset();
  }

  function fijarEfectos(b, h, o) {
    brillo.value = b;
    tinte.value = h;
    opacidad.value = o;
    aplicarEfectos();
  }

  [brillo, tinte, opacidad].forEach(function (el) {
    el.addEventListener('input', aplicarEfectos);
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var v = chip.getAttribute('data-preset').split(',');
      fijarEfectos(v[0], v[1], v[2]);
    });
  });

  document.getElementById('reiniciar').addEventListener('click', function () {
    fijarEfectos(100, 0, 100);
  });

  var aviso = document.getElementById('avisoCopia');
  var temporizadorAviso = null;

  function mostrarAviso(texto) {
    aviso.textContent = texto;
    window.clearTimeout(temporizadorAviso);
    temporizadorAviso = window.setTimeout(function () { aviso.textContent = ''; }, 2000);
  }

  function copiarRespaldo(texto) {
    var area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  document.getElementById('copiar').addEventListener('click', function () {
    var texto = codigo.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(
        function () { mostrarAviso('Copiado'); },
        function () { mostrarAviso(copiarRespaldo(texto) ? 'Copiado' : 'No se pudo copiar'); }
      );
    } else {
      mostrarAviso(copiarRespaldo(texto) ? 'Copiado' : 'No se pudo copiar');
    }
  });

  aplicarEfectos();

  /* ---------- ZOOM: MAPA DE BITS FRENTE A VECTORIAL ---------- */
  var zoom = document.getElementById('zoom');
  var zoomValor = document.getElementById('zoomValor');
  var zoomEstado = document.getElementById('zoomEstado');
  var lenteBits = document.getElementById('lenteBits');
  var lenteSvg = document.getElementById('lenteSvg');

  function aplicarZoom() {
    var z = Number(zoom.value);
    var t = 'scale(' + z + ')';
    lenteBits.style.transform = t;
    lenteSvg.style.transform = t;
    lenteBits.classList.toggle('pix', z > 1);
    zoomValor.textContent = String(z).replace('.', ',');
    if (z <= 2) {
      zoomEstado.textContent = 'Con poco zoom los dos se ven igual.';
    } else if (z <= 5) {
      zoomEstado.textContent = 'El mapa de bits empieza a perder definición en los bordes.';
    } else {
      zoomEstado.textContent = 'Cada píxel del mapa de bits ya es un cuadrado visible; el vectorial sigue nítido.';
    }
  }

  zoom.addEventListener('input', aplicarZoom);
  aplicarZoom();

  /* ---------- AUDIO Y VÍDEO: CAMBIO DE FORMATO ---------- */
  function iniciarFormatos(medio, grupo, ficha) {
    var radios = Array.prototype.slice.call(grupo.querySelectorAll('input[type="radio"]'));

    function pintarFicha(radio) {
      ['contenedor', 'codec', 'peso'].forEach(function (campo) {
        ficha.querySelector('[data-campo="' + campo + '"]').textContent = radio.getAttribute('data-' + campo);
      });
    }

    // Desactiva los formatos que el navegador no puede reproducir y marca el primero válido.
    var primero = null;
    radios.forEach(function (r) {
      var soporta = medio.canPlayType(r.getAttribute('data-tipo')) !== '';
      r.disabled = !soporta;
      if (soporta && !primero) { primero = r; }
    });
    if (primero) { primero.checked = true; pintarFicha(primero); }

    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        var tiempo = medio.currentTime;
        var sonaba = !medio.paused;
        medio.pause();
        medio.src = r.value;
        medio.load();
        medio.addEventListener('loadedmetadata', function alCargar() {
          medio.removeEventListener('loadedmetadata', alCargar);
          try { medio.currentTime = Math.min(tiempo, medio.duration || tiempo); } catch (e) { /* sin posición */ }
          if (sonaba) { var p = medio.play(); if (p && p.catch) { p.catch(function () {}); } }
        });
        pintarFicha(r);
      });
    });
  }

  var audioEl = document.getElementById('audio-el');
  var videoEl = document.getElementById('video-el');
  iniciarFormatos(audioEl, document.getElementById('formatoAudio'), document.getElementById('fichaAudio'));
  iniciarFormatos(videoEl, document.getElementById('formatoVideo'), document.getElementById('fichaVideo'));

  // El ecualizador del audio se mueve mientras suena.
  var bancoAudio = document.getElementById('bancoAudio');
  audioEl.addEventListener('play', function () { bancoAudio.classList.add('reproduciendo'); });
  ['pause', 'ended'].forEach(function (ev) {
    audioEl.addEventListener(ev, function () { bancoAudio.classList.remove('reproduciendo'); });
  });

  /* ---------- MODO CLARO / OSCURO ---------- */
  var raiz = document.documentElement;
  var btnTema = document.getElementById('btnTema');

  function pintarBoton() {
    var oscuro = raiz.getAttribute('data-tema') === 'oscuro';
    btnTema.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
  }

  btnTema.addEventListener('click', function () {
    var nuevo = raiz.getAttribute('data-tema') === 'oscuro' ? 'claro' : 'oscuro';
    raiz.setAttribute('data-tema', nuevo);
    try { localStorage.setItem('tema', nuevo); } catch (e) { /* sin almacenamiento */ }
    pintarBoton();
  });

  pintarBoton();

  /* ---------- LICENCIAS DESPLEGABLE ---------- */
  var detLicencias = document.getElementById('detLicencias');
  var seccionLicencias = document.getElementById('licencias');

  // Abre el desplegable y, cuando termina de abrirse, deja la sección a la vista.
  function abrirLicencias(comportamiento) {
    var estabaCerrado = !detLicencias.open;
    detLicencias.open = true;
    window.setTimeout(function () {
      seccionLicencias.scrollIntoView({ behavior: menosMovimiento ? 'auto' : comportamiento, block: 'start' });
    }, estabaCerrado && !menosMovimiento ? 340 : 0);
  }

  // Cualquier enlace interno a #licencias abre el desplegable.
  Array.prototype.forEach.call(document.querySelectorAll('a[href="#licencias"]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      try { window.history.replaceState(null, '', '#licencias'); } catch (err) { /* sin historial */ }
      abrirLicencias('smooth');
    });
  });
  window.addEventListener('hashchange', function () {
    if (window.location.hash === '#licencias') { abrirLicencias('smooth'); }
  });
  if (window.location.hash === '#licencias') { abrirLicencias('auto'); }

  /* ---------- MENÚ: SECCIÓN ACTIVA, PROGRESO Y VOLVER ARRIBA ---------- */
  var menu = document.getElementById('menu');
  var enlaces = Array.prototype.slice.call(menu.querySelectorAll('a'));
  var progreso = document.getElementById('progreso');
  var subir = document.getElementById('subir');

  function marcarActivo(id) {
    enlaces.forEach(function (a) {
      var activo = a.getAttribute('href') === '#' + id;
      if (activo) {
        a.setAttribute('aria-current', 'true');
        var destino = a.offsetLeft - (menu.clientWidth - a.offsetWidth) / 2;
        if (menu.scrollWidth > menu.clientWidth) {
          menu.scrollTo({ left: destino, behavior: menosMovimiento ? 'auto' : 'smooth' });
        }
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  var secciones = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  var activoId = null;

  function actualizarActivo(pos, total) {
    var id = null;
    if (pos < 200) {
      id = null;
    } else if (total > 0 && pos >= total - 4) {
      id = secciones[secciones.length - 1].id;
    } else {
      var linea = window.innerHeight * 0.35;
      secciones.forEach(function (s) {
        if (s.getBoundingClientRect().top <= linea) { id = s.id; }
      });
    }
    if (id === activoId) return;
    activoId = id;
    if (id) { marcarActivo(id); } else { enlaces.forEach(function (a) { a.removeAttribute('aria-current'); }); }
  }

  var pendiente = false;
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(function () {
      pendiente = false;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var pos = window.scrollY || window.pageYOffset;
      progreso.style.transform = 'scaleX(' + (total > 0 ? Math.min(pos / total, 1) : 0) + ')';
      subir.classList.toggle('visible', pos > 700);
      actualizarActivo(pos, total);
    });
  }

  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('resize', alDesplazar);
  alDesplazar();
})();
