// Función llamada desde el atributo onclick del botón (requisito obligatorio)
function saludar() {
  var mensaje = document.getElementById("mensaje");
  mensaje.textContent = "¡Hola! Has encontrado el botón sorpresa. Hoy es " +
    new Date().toLocaleDateString("es-ES") + ".";
}

// BONUS: XP, rangos e insignias mediante addEventListener().
var totalClicksBonus = 0;
var botonBonus = document.getElementById("btn-bonus");
if (botonBonus) {
  var nivelesBonus = [
    { xp: 0, nombre: "Novata pixel" },
    { xp: 5, nombre: "Exploradora" },
    { xp: 10, nombre: "Pro del clic" },
    { xp: 20, nombre: "Leyenda arcade" }
  ];
  var contadorClicksBonus = document.getElementById("contador-clics");
  var nivelBonus = document.getElementById("nivel-bonus");
  var barraNivel = document.getElementById("barra-nivel");
  var rellenoNivel = document.getElementById("relleno-nivel");
  var progresoBonus = document.getElementById("progreso-bonus");
  var mensajeBonus = document.getElementById("mensaje-bonus");
  var insigniasBonus = document.querySelectorAll(".insignia[data-hito]");

  function obtenerNivelBonus(xp) {
    var indice = 0;
    for (var i = 1; i < nivelesBonus.length; i++) {
      if (xp >= nivelesBonus[i].xp) {
        indice = i;
      }
    }
    return indice;
  }

  function actualizarProgresoBonus(indiceNivel) {
    var nivelActual = nivelesBonus[indiceNivel];
    var siguienteNivel = nivelesBonus[indiceNivel + 1];
    nivelBonus.textContent = "Nivel " + (indiceNivel + 1) + " · " + nivelActual.nombre;

    if (!siguienteNivel) {
      barraNivel.setAttribute("aria-valuemax", "1");
      barraNivel.setAttribute("aria-valuenow", "1");
      barraNivel.setAttribute("aria-valuetext", "Nivel máximo");
      rellenoNivel.style.width = "100%";
      progresoBonus.textContent = "¡Nivel máximo! Sigue sumando XP.";
      return;
    }

    var xpNecesaria = siguienteNivel.xp - nivelActual.xp;
    var xpProgreso = totalClicksBonus - nivelActual.xp;
    var porcentaje = (xpProgreso / xpNecesaria) * 100;
    barraNivel.setAttribute("aria-valuemax", String(xpNecesaria));
    barraNivel.setAttribute("aria-valuenow", String(xpProgreso));
    barraNivel.setAttribute("aria-valuetext", xpProgreso + " de " + xpNecesaria + " XP");
    rellenoNivel.style.width = porcentaje + "%";
    progresoBonus.textContent = xpProgreso + " / " + xpNecesaria + " XP para " + siguienteNivel.nombre;
  }

  actualizarProgresoBonus(0);

  botonBonus.addEventListener("click", function () {
    var nivelAnterior = obtenerNivelBonus(totalClicksBonus);
    totalClicksBonus++;
    contadorClicksBonus.textContent = totalClicksBonus;

    var nivelActual = obtenerNivelBonus(totalClicksBonus);
    actualizarProgresoBonus(nivelActual);

    var nuevaInsignia = null;
    for (var i = 0; i < insigniasBonus.length; i++) {
      var insignia = insigniasBonus[i];
      var hito = Number(insignia.getAttribute("data-hito"));
      if (hito <= totalClicksBonus && insignia.classList.contains("bloqueada")) {
        insignia.classList.remove("bloqueada");
        insignia.classList.add("desbloqueada");
        insignia.setAttribute("aria-label", "Desbloqueada: " + insignia.textContent.replace("★ ", ""));
        if (hito === totalClicksBonus) {
          nuevaInsignia = insignia.textContent.replace("★ ", "");
        }
      }
    }

    var mensajeNivel = nivelActual > nivelAnterior
      ? " ¡Nuevo rango: " + nivelesBonus[nivelActual].nombre + "!"
      : "";
    if (nuevaInsignia) {
      mensajeBonus.textContent = "¡Insignia desbloqueada: " + nuevaInsignia + "!" + mensajeNivel;
    } else {
      mensajeBonus.textContent = "+1 XP. Llevas " + totalClicksBonus + " clics." + mensajeNivel;
    }
  });
}

// Minijuego: atrapa al capibara antes de que termine el cronómetro.
var botonIniciar = document.getElementById("btn-iniciar");
var objetivoJuego = document.getElementById("objetivo-juego");
var tableroJuego = document.getElementById("tablero-juego");
if (botonIniciar && objetivoJuego && tableroJuego) {
  var puntuacion = 0;
  var tiempoRestante = 15;
  var temporizador = null;
  var mejorPuntuacion = 0;
  var puntuacionElemento = document.getElementById("puntuacion");
  var tiempoElemento = document.getElementById("tiempo");
  var recordElemento = document.getElementById("record");
  var mensajeJuego = document.getElementById("mensaje-juego");
  var pistaTablero = tableroJuego.querySelector(".tablero-pista");

  function moverObjetivo() {
    var margen = 14;
    objetivoJuego.style.left = (margen + Math.random() * (100 - margen * 2)) + "%";
    objetivoJuego.style.top = (margen + Math.random() * (100 - margen * 2)) + "%";
  }

  function terminarJuego() {
    window.clearInterval(temporizador);
    temporizador = null;
    objetivoJuego.hidden = true;
    pistaTablero.hidden = false;
    botonIniciar.disabled = false;
    botonIniciar.textContent = "Jugar otra vez";
    mensajeJuego.textContent = "¡Tiempo! Has conseguido " + puntuacion +
      (puntuacion === 1 ? " punto." : " puntos.") +
      (puntuacion > mejorPuntuacion ? " ¡Nuevo récord!" : " ¿Puedes superarlo?");
    if (puntuacion > mejorPuntuacion) {
      mejorPuntuacion = puntuacion;
      recordElemento.textContent = mejorPuntuacion;
    }
  }

  botonIniciar.addEventListener("click", function () {
    if (temporizador) {
      return;
    }
    puntuacion = 0;
    tiempoRestante = 15;
    puntuacionElemento.textContent = puntuacion;
    tiempoElemento.textContent = tiempoRestante;
    mensajeJuego.textContent = "¡Ya! Pulsa el capibara cada vez que aparezca.";
    pistaTablero.hidden = true;
    objetivoJuego.hidden = false;
    botonIniciar.disabled = true;
    botonIniciar.textContent = "¡A jugar!";
    moverObjetivo();

    temporizador = window.setInterval(function () {
      tiempoRestante--;
      tiempoElemento.textContent = tiempoRestante;
      if (tiempoRestante <= 0) {
        terminarJuego();
      }
    }, 1000);
  });

  objetivoJuego.addEventListener("click", function () {
    if (!temporizador) {
      return;
    }
    puntuacion++;
    puntuacionElemento.textContent = puntuacion;
    moverObjetivo();
  });
}

// Evento + acción: un clic alterna entre la portada y su reverso.
var botonImagen = document.getElementById("boton-imagen");
if (botonImagen) {
  var imagenCapibara = botonImagen.querySelector("img");
  var fuenteWebpCapibara = botonImagen.querySelector("source");
  var imagenOriginal = imagenCapibara.getAttribute("src");
  var fuenteWebpOriginal = fuenteWebpCapibara.getAttribute("srcset");
  var imagenReverso = "img/portada-reverso.jpg";
  var capibaraVolteado = false;

  botonImagen.addEventListener("click", function () {
    capibaraVolteado = !capibaraVolteado;
    imagenCapibara.src = capibaraVolteado ? imagenReverso : imagenOriginal;
    imagenCapibara.alt = capibaraVolteado
      ? "Esqueleto de capibara con un gorro andino de colores, un lazo rosa y una flor."
      : "Capibara con un gorro andino de colores, un lazo rosa y una flor en la pata";
    fuenteWebpCapibara.srcset = capibaraVolteado ? imagenReverso : fuenteWebpOriginal;
    fuenteWebpCapibara.type = capibaraVolteado ? "image/jpeg" : "image/webp";
    botonImagen.setAttribute("aria-pressed", String(capibaraVolteado));
    botonImagen.setAttribute("aria-label", capibaraVolteado
      ? "Volver a la imagen original del capibara"
      : "Ver el reverso de la imagen del capibara");
    document.getElementById("estado-imagen").textContent = capibaraVolteado
      ? "¡Has descubierto el reverso! Pulsa otra vez para volver a la imagen original."
      : "De vuelta a la imagen original. Pulsa para ver el reverso.";
  });
}

// Los controles nativos de audio y vídeo disparan eventos que también podemos escuchar.
var audioPrincipal = document.getElementById("audio-principal");
if (audioPrincipal) {
  var estadoAudio = document.getElementById("estado-audio");
  var ecualizador = document.getElementById("ecualizador");
  audioPrincipal.addEventListener("play", function () {
    estadoAudio.textContent = "¡Sonando! Disfruta de la melodía.";
    ecualizador.classList.add("reproduciendo");
  });
  audioPrincipal.addEventListener("pause", function () {
    estadoAudio.textContent = "Melodía en pausa.";
    ecualizador.classList.remove("reproduciendo");
  });
  audioPrincipal.addEventListener("ended", function () {
    estadoAudio.textContent = "Fin de la melodía. ¿La escuchamos otra vez?";
    ecualizador.classList.remove("reproduciendo");
  });
}

var videoPrincipal = document.getElementById("video-principal");
if (videoPrincipal) {
  var estadoVideo = document.getElementById("estado-video");
  videoPrincipal.addEventListener("play", function () {
    estadoVideo.textContent = "Reproduciendo vídeo.";
  });
  videoPrincipal.addEventListener("pause", function () {
    estadoVideo.textContent = "Vídeo en pausa.";
  });
  videoPrincipal.addEventListener("ended", function () {
    estadoVideo.textContent = "Fin del vídeo. Puedes volver a reproducirlo.";
  });
}

var tableroSnake = document.getElementById("snake-tablero");
if (tableroSnake) {
  var contextoSnake = tableroSnake.getContext("2d");
  var botonSnake = document.getElementById("snake-iniciar");
  var puntosSnake = document.getElementById("snake-puntos");
  var recordSnake = document.getElementById("snake-record");
  var estadoSnake = document.getElementById("snake-estado");
  var controlesSnake = document.querySelectorAll(".snake-controles [data-direccion]");
  var celdasSnake = 20;
  var tamanoCeldaSnake = tableroSnake.width / celdasSnake;

  if (!contextoSnake) {
    estadoSnake.textContent = "Snake no está disponible en este navegador.";
    botonSnake.disabled = true;
  } else {
    var serpiente = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    var direccionSnake = { x: 1, y: 0 };
    var siguienteDireccionSnake = { x: 1, y: 0 };
    var comidaSnake = null;
    var puntosActualesSnake = 0;
    var mejorPuntuacionSnake = 0;
    var partidaSnakeActiva = false;
    var puedeGirarSnake = true;
    var temporizadorSnake = null;
    var direccionesSnake = {
      arriba: { x: 0, y: -1 },
      abajo: { x: 0, y: 1 },
      izquierda: { x: -1, y: 0 },
      derecha: { x: 1, y: 0 }
    };

    function crearComidaSnake() {
      var celdasLibres = [];
      for (var y = 0; y < celdasSnake; y++) {
        for (var x = 0; x < celdasSnake; x++) {
          var ocupada = serpiente.some(function (segmento) {
            return segmento.x === x && segmento.y === y;
          });
          if (!ocupada) {
            celdasLibres.push({ x: x, y: y });
          }
        }
      }
      return celdasLibres.length
        ? celdasLibres[Math.floor(Math.random() * celdasLibres.length)]
        : null;
    }

    function dibujarSnake() {
      contextoSnake.fillStyle = "#171329";
      contextoSnake.fillRect(0, 0, tableroSnake.width, tableroSnake.height);
      contextoSnake.strokeStyle = "#292441";
      contextoSnake.lineWidth = 1;
      for (var linea = 0; linea <= celdasSnake; linea++) {
        var posicion = linea * tamanoCeldaSnake;
        contextoSnake.beginPath();
        contextoSnake.moveTo(posicion, 0);
        contextoSnake.lineTo(posicion, tableroSnake.height);
        contextoSnake.moveTo(0, posicion);
        contextoSnake.lineTo(tableroSnake.width, posicion);
        contextoSnake.stroke();
      }

      if (comidaSnake) {
        contextoSnake.fillStyle = "#ff3d9a";
        contextoSnake.fillRect(
          comidaSnake.x * tamanoCeldaSnake + 3,
          comidaSnake.y * tamanoCeldaSnake + 3,
          tamanoCeldaSnake - 6,
          tamanoCeldaSnake - 6
        );
      }

      serpiente.forEach(function (segmento, indice) {
        contextoSnake.fillStyle = indice === 0 ? "#ffe14d" : "#2ecc40";
        contextoSnake.fillRect(
          segmento.x * tamanoCeldaSnake + 2,
          segmento.y * tamanoCeldaSnake + 2,
          tamanoCeldaSnake - 4,
          tamanoCeldaSnake - 4
        );
      });
    }

    function terminarSnake(mensaje) {
      window.clearInterval(temporizadorSnake);
      temporizadorSnake = null;
      partidaSnakeActiva = false;
      botonSnake.textContent = "Jugar de nuevo";
      estadoSnake.textContent = mensaje + " Puntuación: " + puntosActualesSnake + ".";
    }

    function avanzarSnake() {
      direccionSnake = siguienteDireccionSnake;
      puedeGirarSnake = true;
      var cabeza = {
        x: serpiente[0].x + direccionSnake.x,
        y: serpiente[0].y + direccionSnake.y
      };
      var comera = comidaSnake && cabeza.x === comidaSnake.x && cabeza.y === comidaSnake.y;
      var cuerpoEnColision = comera ? serpiente : serpiente.slice(0, -1);
      var chocaConCuerpo = cuerpoEnColision.some(function (segmento) {
        return segmento.x === cabeza.x && segmento.y === cabeza.y;
      });

      if (
        cabeza.x < 0 || cabeza.x >= celdasSnake ||
        cabeza.y < 0 || cabeza.y >= celdasSnake ||
        chocaConCuerpo
      ) {
        terminarSnake("¡Fin de partida!");
        return;
      }

      serpiente.unshift(cabeza);
      if (comera) {
        puntosActualesSnake += 10;
        puntosSnake.textContent = puntosActualesSnake;
        if (puntosActualesSnake > mejorPuntuacionSnake) {
          mejorPuntuacionSnake = puntosActualesSnake;
          recordSnake.textContent = mejorPuntuacionSnake;
        }
        comidaSnake = crearComidaSnake();
        if (!comidaSnake) {
          dibujarSnake();
          terminarSnake("¡Has llenado el tablero!");
          return;
        }
        estadoSnake.textContent = "¡Ñam! " + puntosActualesSnake + " puntos.";
      } else {
        serpiente.pop();
      }

      dibujarSnake();
    }

    function cambiarDireccionSnake(direccion) {
      if (!partidaSnakeActiva || !puedeGirarSnake) {
        return;
      }
      if (direccion.x === -direccionSnake.x && direccion.y === -direccionSnake.y) {
        return;
      }
      siguienteDireccionSnake = direccion;
      puedeGirarSnake = false;
    }

    function iniciarSnake() {
      window.clearInterval(temporizadorSnake);
      serpiente = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
      direccionSnake = { x: 1, y: 0 };
      siguienteDireccionSnake = { x: 1, y: 0 };
      puedeGirarSnake = true;
      puntosActualesSnake = 0;
      puntosSnake.textContent = puntosActualesSnake;
      comidaSnake = crearComidaSnake();
      partidaSnakeActiva = true;
      botonSnake.textContent = "Reiniciar";
      estadoSnake.textContent = "¡En marcha! Come la fruta y evita los bordes.";
      dibujarSnake();
      tableroSnake.focus();
      temporizadorSnake = window.setInterval(avanzarSnake, 140);
    }

    tableroSnake.addEventListener("keydown", function (evento) {
      var tecla = evento.key.toLowerCase();
      var direccion = {
        arrowup: direccionesSnake.arriba,
        w: direccionesSnake.arriba,
        arrowdown: direccionesSnake.abajo,
        s: direccionesSnake.abajo,
        arrowleft: direccionesSnake.izquierda,
        a: direccionesSnake.izquierda,
        arrowright: direccionesSnake.derecha,
        d: direccionesSnake.derecha
      }[tecla];
      if (direccion) {
        evento.preventDefault();
        cambiarDireccionSnake(direccion);
      }
    });

    botonSnake.addEventListener("click", iniciarSnake);
    controlesSnake.forEach(function (control) {
      control.addEventListener("click", function () {
        cambiarDireccionSnake(direccionesSnake[control.getAttribute("data-direccion")]);
        tableroSnake.focus();
      });
    });

    comidaSnake = crearComidaSnake();
    dibujarSnake();
  }
}
