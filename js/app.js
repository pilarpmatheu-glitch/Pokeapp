
import {
  leerPokemones,
  guardarPokemones,
  leerUsuarios,
  guardarUsuarios,
  leerFavoritos,
  alternarFavorito
} from "./persistencia.js";

const app = document.querySelector("#app");
const $ = selector => document.querySelector(selector);

let usuario = null;
let busqueda = "";
let tipo = "Todos";
let verShiny = false;

function limpiarTexto(texto = "") {
  return String(texto).replace(/[&<>"']/g, letra => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[letra]);
}

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function irA(funcion) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  funcion();
}

function inicio() {
  const cantidad = leerPokemones().length;

  app.innerHTML = `
    <section class="landing">
      <p class="eyebrow">✦ ENCICLOPEDIA DE ENTRENADORES ✦</p>
      <h1>El universo Pokémon<br>te está esperando</h1>
      <p>Descubrí criaturas extraordinarias, conocé sus habilidades y construí tu propia colección en una Pokédex creada para explorar.</p>

      <div class="hero-actions">
        <button id="ir-pokedex">✧ Explorar Pokédex</button>
        <button class="btn-secundario" id="ir-registro">Crear mi perfil</button>
      </div>

      <div class="hero-resumen">
        <div>
          <strong>${cantidad}</strong>
          <span>Pokémon cargados</span>
        </div>
        <div>
          <strong>${leerFavoritos().length}</strong>
          <span>Favoritos guardados</span>
        </div>
        <div>
          <strong>∞</strong>
          <span>Posibilidades</span>
        </div>
      </div>
    </section>

    <section class="intro-panel">
      <span class="section-kicker">TU AVENTURA COMIENZA ACÁ</span>
      <h2>Una colección, muchas historias</h2>
      <p>Buscá por nombre o número, filtrá por tipo y abrí cada ficha para conocer sus estadísticas, habilidades y detalles especiales.</p>
    </section>
  `;

  $("#ir-pokedex").addEventListener("click", () => irA(pokedex));
  $("#ir-registro").addEventListener("click", () => irA(registro));
}

function tarjeta(pokemon) {
  const guardados = leerFavoritos();
  const esFavorito = guardados.includes(Number(pokemon.id));

  const imagen = verShiny && pokemon.shiny && pokemon.imagenShiny
    ? pokemon.imagenShiny
    : pokemon.imagen;

  return `
    <article class="pokemon-card">

      <button
        class="favorite-btn ${esFavorito ? "is-favorite" : ""}"
        data-favorito="${pokemon.id}"
        aria-label="${esFavorito ? "Quitar de" : "Agregar a"} favoritos"
      >
        ${esFavorito ? "♥" : "♡"}
      </button>

      <div class="pokemon-image">
        <img
          src="${limpiarTexto(imagen || "./assets/avatar/default.svg")}"
          alt="${limpiarTexto(pokemon.nombre)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='./assets/avatar/default.svg'"
        >
      </div>

      <span class="pokemon-id">
        N.º ${String(pokemon.id).padStart(3, "0")}
      </span>

      <h2>${limpiarTexto(pokemon.nombre)}</h2>

      <div class="pokemon-types">
        ${(pokemon.tipo || []).map(t => `
          <span class="type">${limpiarTexto(t)}</span>
        `).join("")}
      </div>

      <p class="pokemon-rareza">
        ✦ ${limpiarTexto(pokemon.rareza || "Sin clasificar")}
      </p>

      <button class="btn-detalle" data-detalle="${pokemon.id}">
        Ver ficha completa
      </button>

    </article>
  `;
}

function conectarTarjetas() {
  document.querySelectorAll("[data-detalle]").forEach(boton => {
    boton.addEventListener("click", () => {
      detalle(Number(boton.dataset.detalle));
    });
  });

  document.querySelectorAll("[data-favorito]").forEach(boton => {
    boton.addEventListener("click", () => {
      alternarFavorito(Number(boton.dataset.favorito));

      if (document.querySelector(".pokedex-section")) {
        pokedex();
      } else {
        favoritos();
      }
    });
  });
}

function pokedex(filtro = busqueda) {
  busqueda = filtro;

  const todos = leerPokemones();

  const tipos = [
    "Todos",
    ...new Set(todos.flatMap(p => p.tipo || []))
  ];

  const textoBusqueda = normalizar(filtro);

  const encontrados = todos.filter(pokemon => {
    const nombre = normalizar(pokemon.nombre);
    const numero = String(pokemon.id);
    const tiposPokemon = (pokemon.tipo || []).map(normalizar);

    const coincideTexto =
      nombre.includes(textoBusqueda) ||
      numero.includes(textoBusqueda) ||
      tiposPokemon.some(t => t.includes(textoBusqueda));

    const coincideTipo =
      tipo === "Todos" ||
      (pokemon.tipo || []).includes(tipo);

    return coincideTexto && coincideTipo;
  });

  app.innerHTML = `
    <section class="pokedex-section">

      <span class="section-kicker">
        ARCHIVO CENTRAL · ${todos.length} REGISTROS
      </span>

      <h1>La Pokédex</h1>

      <p>Explorá los registros disponibles y descubrí cada criatura.</p>

      <div class="filter-bar">

        <label for="filtro-tipo">Filtrar por tipo</label>

        <select id="filtro-tipo">
          ${tipos.map(t => `
            <option
              value="${limpiarTexto(t)}"
              ${t === tipo ? "selected" : ""}
            >
              ${limpiarTexto(t)}
            </option>
          `).join("")}
        </select>

        <button id="alternar-shiny" class="btn-secundario">
          ${verShiny ? "Mostrar normales" : "Ver versiones shiny"}
        </button>

      </div>

      <p class="result-count">
        ${encontrados.length} resultado(s) encontrado(s)
      </p>

      <div class="pokedex-gallery">
        ${
          encontrados.length
            ? encontrados.map(tarjeta).join("")
            : `<p class="empty-state">No encontramos Pokémon con esos filtros.</p>`
        }
      </div>

    </section>
  `;

  $("#filtro-tipo").addEventListener("change", e => {
    tipo = e.target.value;
    pokedex();
  });

  $("#alternar-shiny").addEventListener("click", () => {
    verShiny = !verShiny;
    pokedex();
  });

  conectarTarjetas();
}

function detalle(id) {
  const pokemon = leerPokemones().find(
    p => Number(p.id) === id
  );

  if (!pokemon) return;

  const imagenNormal = pokemon.imagen || "./assets/avatar/default.svg";

  app.innerHTML = `
    <section class="detail-section">

      <button id="volver-pokedex" class="btn-secundario">
        ← Volver a la Pokédex
      </button>

      <div class="detail-heading">

        <span class="section-kicker">
          REGISTRO N.º ${String(pokemon.id).padStart(3, "0")}
        </span>

        <h1>${limpiarTexto(pokemon.nombre)}</h1>

        <div class="pokemon-types">
          ${(pokemon.tipo || []).map(t => `
            <span class="type">${limpiarTexto(t)}</span>
          `).join("")}
        </div>

      </div>

      <div class="detail-layout">

        <div class="detail-art">
          <img
            id="detalle-imagen"
            src="${limpiarTexto(imagenNormal)}"
            alt="${limpiarTexto(pokemon.nombre)}"
            onerror="this.onerror=null;this.src='./assets/avatar/default.svg'"
          >
        </div>

        <div class="detail-data">

          <h2>Descripción</h2>

          <p>
            ${limpiarTexto(pokemon.descripcion || "No hay descripción disponible.")}
          </p>

          <div class="data-grid">

            <div>
              <span>Altura</span>
              <strong>${pokemon.altura ?? "—"} m</strong>
            </div>

            <div>
              <span>Peso</span>
              <strong>${pokemon.peso ?? "—"} kg</strong>
            </div>

            <div>
              <span>Generación</span>
              <strong>${pokemon.generacion ?? "—"}</strong>
            </div>

            <div>
              <span>Rareza</span>
              <strong>${limpiarTexto(pokemon.rareza || "—")}</strong>
            </div>

            <div>
              <span>Habilidad</span>
              <strong>${limpiarTexto(pokemon.habilidad || "—")}</strong>
            </div>

            <div>
              <span>Evolución</span>
              <strong>
                ${
                  pokemon.tieneEvolucion
                    ? `${limpiarTexto(pokemon.evolucion || "Sí")} ${
                        pokemon.nivelEvolucion
                          ? `(nivel ${pokemon.nivelEvolucion})`
                          : ""
                      }`
                    : "No tiene"
                }
              </strong>
            </div>

          </div>

          <div class="detail-actions">

            ${
              pokemon.shiny && pokemon.imagenShiny
                ? `<button id="ver-shiny">✨ Ver versión shiny</button>`
                : ""
            }

            ${
              pokemon.sonido
                ? `<button id="reproducir-sonido" class="btn-secundario">♫ Escuchar sonido</button>`
                : ""
            }

            <button id="detalle-favorito" class="btn-secundario">
              ${
                leerFavoritos().includes(id)
                  ? "♥ Quitar favorito"
                  : "♡ Agregar favorito"
              }
            </button>

          </div>

          <audio
            id="audio-pokemon"
            preload="none"
            src="${limpiarTexto(pokemon.sonido || "")}"
          ></audio>

        </div>
      </div>

      <h2>Estadísticas base</h2>

      <div class="stats">

        ${[
          ["HP", pokemon.hp],
          ["Ataque", pokemon.ataque],
          ["Defensa", pokemon.defensa],
          ["Velocidad", pokemon.velocidad]
        ].map(([nombre, valor]) => `
          <div class="stat">

            <b>${nombre}</b>

            <strong>${valor ?? "—"}</strong>

            <div class="stat-track">
              <span style="width:${Math.min(
                100,
                Math.max(0, Number(valor) || 0) / 160 * 100
              )}%"></span>
            </div>

          </div>
        `).join("")}

      </div>

    </section>
  `;

  $("#volver-pokedex").addEventListener("click", () => {
    irA(pokedex);
  });

  if ($("#ver-shiny")) {
    $("#ver-shiny").addEventListener("click", () => {
      const imagen = $("#detalle-imagen");
      const esShiny = imagen.dataset.shiny === "true";

      imagen.src = esShiny ? imagenNormal : pokemon.imagenShiny;
      imagen.dataset.shiny = String(!esShiny);

      $("#ver-shiny").textContent = esShiny
        ? "✨ Ver versión shiny"
        : "Volver a imagen normal";
    });
  }

  if ($("#reproducir-sonido")) {
    $("#reproducir-sonido").addEventListener("click", async () => {
      try {
        await $("#audio-pokemon").play();
      } catch {
        alert("No se pudo reproducir el sonido. Revisá que el archivo exista en assets/sound.");
      }
    });
  }

  $("#detalle-favorito").addEventListener("click", () => {
    alternarFavorito(id);

    $("#detalle-favorito").textContent =
      leerFavoritos().includes(id)
        ? "♥ Quitar favorito"
        : "♡ Agregar favorito";
  });
}

function favoritos() {
  const ids = leerFavoritos();

  const lista = leerPokemones().filter(
    pokemon => ids.includes(Number(pokemon.id))
  );

  app.innerHTML = `
    <section>

      <span class="section-kicker">TU COLECCIÓN PERSONAL</span>

      <h1>Pokémon favoritos</h1>

      <p>Acá aparecen las criaturas que marcaste con un corazón.</p>

      <div class="pokedex-gallery">

        ${
          lista.length
            ? lista.map(tarjeta).join("")
            : `<p class="empty-state">Todavía no guardaste favoritos. Explorá la Pokédex y tocá ♡ en una tarjeta.</p>`
        }

      </div>

    </section>
  `;

  conectarTarjetas();
}

function login() {
  app.innerHTML = `
    <section>

      <span class="section-kicker">PORTAL DE ENTRENADORES</span>

      <h1>Iniciar sesión</h1>

      <form class="formulario" id="form-login">

        <label for="username">Nombre de usuario</label>
        <input id="username" autocomplete="username" required>

        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autocomplete="current-password"
          required
        >

        <button type="submit">Ingresar a mi cuenta</button>

        <p id="mensaje" role="status"></p>

      </form>

      <p class="demo-access">
        Cuenta de prueba administrador:
        <b>admin</b> / <b>admin123</b>
      </p>

    </section>
  `;

  $("#form-login").addEventListener("submit", e => {
    e.preventDefault();

    const nombreUsuario = $("#username").value.trim();
    const clave = $("#password").value;

    const usuarios = leerUsuarios();

    const encontrado = usuarios.find(u =>
      u.username === nombreUsuario &&
      u.password === clave
    );

    if (!encontrado) {
      $("#mensaje").textContent = "Usuario o contraseña incorrectos.";
      $("#mensaje").className = "error-message";
      return;
    }

    usuario = encontrado;
    perfil();
  });
}

function registro() {
  app.innerHTML = `
    <section>

      <span class="section-kicker">NUEVO ENTRENADOR</span>

      <h1>Crear cuenta</h1>

      <form class="formulario" id="form-registro">

        <label for="nombre">Nombre completo</label>
        <input id="nombre" maxlength="50" required>

        <label for="email">Correo electrónico</label>
        <input id="email" type="email" required>

        <label for="nuevo-username">Nombre de usuario</label>
        <input id="nuevo-username" minlength="3" required>

        <label for="nueva-password">Contraseña</label>
        <input
          id="nueva-password"
          type="password"
          minlength="4"
          required
        >

        <button type="submit">Crear mi cuenta</button>

        <p id="mensaje" role="status"></p>

      </form>

    </section>
  `;

  $("#form-registro").addEventListener("submit", e => {
    e.preventDefault();

    const nuevoUsuario = {
      nombre: $("#nombre").value.trim(),
      email: $("#email").value.trim(),
      username: $("#nuevo-username").value.trim(),
      password: $("#nueva-password").value,
      admin: false,
      avatar: "./assets/avatar/default.svg"
    };

    try {
      guardarUsuarios(nuevoUsuario);
      usuario = nuevoUsuario;
      perfil();
    } catch (error) {
      $("#mensaje").textContent = error.message;
      $("#mensaje").className = "error-message";
    }
  });
}

function formularioPokemon() {
  return `
    <section>

      <span class="section-kicker">PANEL DE CONTROL</span>

      <h2>Agregar un Pokémon</h2>

      <form class="formulario admin-form" id="form-nuevo-pokemon">

        <label for="pokemon-number">Número de Pokédex</label>
        <input type="number" id="pokemon-number" min="1" required>

        <label for="pokemon-name">Nombre</label>
        <input id="pokemon-name" required>

        <label for="pokemon-type">Tipos (separados por coma)</label>
        <input id="pokemon-type" placeholder="Agua, Hielo" required>

        <label for="pokemon-description">Descripción</label>
        <textarea id="pokemon-description" rows="3"></textarea>

        <label for="pokemon-height">Altura (m)</label>
        <input type="number" id="pokemon-height" min="0" step="0.1" value="1">

        <label for="pokemon-weight">Peso (kg)</label>
        <input type="number" id="pokemon-weight" min="0" step="0.1" value="1">

        <label for="pokemon-generation">Generación</label>
        <input type="number" id="pokemon-generation" min="1" value="1">

        <label for="pokemon-hp">HP</label>
        <input type="number" id="pokemon-hp" min="0" value="50">

        <label for="pokemon-attack">Ataque</label>
        <input type="number" id="pokemon-attack" min="0" value="50">

        <label for="pokemon-defense">Defensa</label>
        <input type="number" id="pokemon-defense" min="0" value="50">

        <label for="pokemon-speed">Velocidad</label>
        <input type="number" id="pokemon-speed" min="0" value="50">

        <label for="pokemon-ability">Habilidad</label>
        <input id="pokemon-ability" placeholder="Habilidad principal">

        <label for="pokemon-has-evolution">¿Tiene evolución?</label>
        <select id="pokemon-has-evolution">
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>

        <label for="pokemon-evolution">Nombre de la evolución</label>
        <input id="pokemon-evolution">

        <label for="pokemon-evolution-level">Nivel de evolución</label>
        <input type="number" id="pokemon-evolution-level" min="1">

        <label for="pokemon-rarity">Rareza</label>
        <select id="pokemon-rarity">
          <option>Común</option>
          <option>Raro</option>
          <option>Legendario</option>
          <option>Mítico</option>
          <option>Singular</option>
        </select>

        <label for="pokemon-image">Ruta de imagen</label>
        <input id="pokemon-image" placeholder="./assets/img/nombre.png" required>

        <label for="pokemon-sound">Ruta de sonido (opcional)</label>
        <input id="pokemon-sound" placeholder="./assets/sound/nombre.mp3">

        <label for="pokemon-shiny-image">Ruta de imagen shiny (opcional)</label>
        <input id="pokemon-shiny-image" placeholder="./assets/img/nombre-shiny.png">

        <button type="submit">Guardar Pokémon</button>

        <p id="mensaje-pokemon" role="status"></p>

      </form>

    </section>
  `;
}

function activarFormulario() {
  const formulario = $("#form-nuevo-pokemon");

  if (!formulario) return;

  formulario.addEventListener("submit", e => {
    e.preventDefault();

    const valor = id => $("#" + id).value.trim();

    const nuevoPokemon = {
      id: Number(valor("pokemon-number")),
      nombre: valor("pokemon-name"),
      tipo: valor("pokemon-type")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
      descripcion: valor("pokemon-description"),
      altura: Number(valor("pokemon-height")),
      peso: Number(valor("pokemon-weight")),
      generacion: Number(valor("pokemon-generation")),
      hp: Number(valor("pokemon-hp")),
      ataque: Number(valor("pokemon-attack")),
      defensa: Number(valor("pokemon-defense")),
      velocidad: Number(valor("pokemon-speed")),
      habilidad: valor("pokemon-ability"),
      tieneEvolucion: valor("pokemon-has-evolution") === "true",
      evolucion: valor("pokemon-evolution"),
      nivelEvolucion: Number(valor("pokemon-evolution-level")) || 0,
      rareza: valor("pokemon-rarity"),
      imagen: valor("pokemon-image"),
      sonido: valor("pokemon-sound"),
      shiny: Boolean(valor("pokemon-shiny-image")),
      imagenShiny: valor("pokemon-shiny-image")
    };

    try {
      if (!nuevoPokemon.tipo.length) {
        throw new Error("Ingresá al menos un tipo.");
      }

      guardarPokemones(nuevoPokemon);

      $("#mensaje-pokemon").textContent =
        "¡Pokémon agregado correctamente! Ya aparece en la Pokédex.";

      $("#mensaje-pokemon").className = "success-message";

      e.target.reset();

    } catch (error) {
      $("#mensaje-pokemon").textContent = error.message;
      $("#mensaje-pokemon").className = "error-message";
    }
  });
}

function perfil() {
  if (!usuario) {
    return login();
  }

  app.innerHTML = `
    <section class="user-profile">

      <span class="section-kicker">CENTRO DE ENTRENADORES</span>

      <h1>Mi perfil</h1>

      <div class="user-profile-info">

        <img
          class="user-profile-avatar"
          src="${limpiarTexto(usuario.avatar || "./assets/avatar/default.svg")}"
          alt="Avatar del entrenador"
        >

        <div>

          <p><b>Usuario:</b> ${limpiarTexto(usuario.username)}</p>

          <p><b>Nombre:</b> ${limpiarTexto(usuario.nombre)}</p>

          <p><b>Email:</b> ${limpiarTexto(usuario.email)}</p>

          <p>
            <b>Rol:</b>
            ${usuario.admin ? "Administrador" : "Entrenador"}
          </p>

          <p><b>Favoritos:</b> ${leerFavoritos().length}</p>

        </div>

      </div>

      <div class="profile-actions">

        <button id="ver-mis-favoritos">
          Ver mis favoritos
        </button>

        <button id="cerrar-sesion" class="btn-secundario">
          Cerrar sesión
        </button>

      </div>

    </section>

    ${usuario.admin ? formularioPokemon() : ""}
  `;

  $("#cerrar-sesion").addEventListener("click", () => {
    usuario = null;
    inicio();
  });

  $("#ver-mis-favoritos").addEventListener("click", favoritos);

  if (usuario.admin) {
    activarFormulario();
  }
}

function batalla() {
  const pokemones = leerPokemones() || [];

  if (pokemones.length < 2) {
    app.innerHTML = `
      <section class="batalla">
        <h1>Combate Pokémon</h1>
        <p>Necesitás al menos dos Pokémon para comenzar una batalla.</p>
      </section>
    `;
    return;
  }

  let combate = null;

  const ataques = [
    { nombre: "Placaje", poder: 35 },
    { nombre: "Ataque rápido", poder: 45 },
    { nombre: "Golpe fuerte", poder: 60 },
    { nombre: "Ataque especial", poder: 75 }
  ];

  function vidaMaxima(pokemon) {
    return Number(pokemon.hp) || 100;
  }

  function fuerza(pokemon) {
    return Number(pokemon.ataque) || 50;
  }

  function defensa(pokemon) {
    return Number(pokemon.defensa) || 30;
  }

  function elegirPokemon() {
    app.innerHTML = `
      <section class="batalla">

        <h1>COMBATE POKÉMON</h1>

        <p>Elegí tu Pokémon para comenzar.</p>

        <div class="seleccion-combate">

          <label for="pokemon-jugador">Tu Pokémon</label>

          <select id="pokemon-jugador">
            ${pokemones.map(pokemon => `
              <option value="${pokemon.id}">
                ${limpiarTexto(pokemon.nombre)}
              </option>
            `).join("")}
          </select>

          <button id="comenzar-combate">
            COMENZAR BATALLA
          </button>

        </div>

      </section>
    `;

    $("#comenzar-combate").addEventListener("click", empezarCombate);
  }

  function empezarCombate() {
    const idElegido = $("#pokemon-jugador").value;

    const jugador = pokemones.find(
      p => String(p.id) === String(idElegido)
    );

    const rivales = pokemones.filter(
      p => String(p.id) !== String(idElegido)
    );

    if (!jugador || !rivales.length) return;

    const rival = rivales[
      Math.floor(Math.random() * rivales.length)
    ];

    combate = {
      jugador: {
        datos: jugador,
        vida: vidaMaxima(jugador)
      },

      rival: {
        datos: rival,
        vida: vidaMaxima(rival)
      },

      terminado: false,
      resultado: ""
    };

    mostrarCombate();
  }

  function mostrarCombate(mensaje = "¡Elegí tu movimiento!") {
    const jugador = combate.jugador;
    const rival = combate.rival;

    app.innerHTML = `
      <section class="batalla">

        <h1>COMBATE POKÉMON</h1>

        <div class="arena-combate">

          <div class="pokemon-combate">

            <h2>${limpiarTexto(rival.datos.nombre)}</h2>

            <img
              src="${limpiarTexto(rival.datos.imagen || "./assets/avatar/default.svg")}"
              alt="${limpiarTexto(rival.datos.nombre)}"
            >

            <p>RIVAL</p>

            <div class="barra-vida">
              <div
                class="vida"
                style="width:${Math.max(0, rival.vida / vidaMaxima(rival.datos) * 100)}%"
              ></div>
            </div>

            <p>
              HP: ${Math.max(0, rival.vida)} / ${vidaMaxima(rival.datos)}
            </p>

          </div>

          <div class="pokemon-combate">

            <h2>${limpiarTexto(jugador.datos.nombre)}</h2>

            <img
              src="${limpiarTexto(jugador.datos.imagen || "./assets/avatar/default.svg")}"
              alt="${limpiarTexto(jugador.datos.nombre)}"
            >

            <p>TU POKÉMON</p>

            <div class="barra-vida">
              <div
                class="vida"
                style="width:${Math.max(0, jugador.vida / vidaMaxima(jugador.datos) * 100)}%"
              ></div>
            </div>

            <p>
              HP: ${Math.max(0, jugador.vida)} / ${vidaMaxima(jugador.datos)}
            </p>

          </div>

        </div>

        <div class="panel-movimientos">

          <h2>¿Qué movimiento querés utilizar?</h2>

          <div class="lista-movimientos">

            ${ataques.map((ataque, i) => `
              <button
                class="btn-movimiento"
                data-movimiento="${i}"
                ${combate.terminado ? "disabled" : ""}
              >
                ${ataque.nombre}
                <small>Poder: ${ataque.poder}</small>
              </button>
            `).join("")}

          </div>

          <div class="mensaje-combate">
            ${mensaje}
          </div>

          ${
            combate.terminado
              ? `<h2>${combate.resultado}</h2>
                 <button id="nuevo-combate">NUEVO COMBATE</button>`
              : ""
          }

        </div>

      </section>
    `;

    document.querySelectorAll(".btn-movimiento").forEach(boton => {
      boton.addEventListener("click", () => {
        atacar(Number(boton.dataset.movimiento));
      });
    });

    if ($("#nuevo-combate")) {
      $("#nuevo-combate").addEventListener("click", elegirPokemon);
    }
  }

  function atacar(indice) {
    if (combate.terminado) return;

    const jugador = combate.jugador;
    const rival = combate.rival;
    const ataqueElegido = ataques[indice];

    if (!ataqueElegido) return;

    const danioJugador = Math.max(
      5,
      Math.round(
        fuerza(jugador.datos) * ataqueElegido.poder / 100 -
        defensa(rival.datos) * 0.25 +
        Math.random() * 10
      )
    );

    rival.vida = Math.max(0, rival.vida - danioJugador);

    let mensaje = `
      ${limpiarTexto(jugador.datos.nombre)} utilizó
      ${limpiarTexto(ataqueElegido.nombre)}.
      ¡Causó ${danioJugador} puntos de daño!
    `;

    if (rival.vida <= 0) {
      combate.terminado = true;
      combate.resultado = "¡GANASTE LA BATALLA!";
      mostrarCombate(mensaje);
      return;
    }

    const ataqueRival = ataques[
      Math.floor(Math.random() * ataques.length)
    ];

    const danioRival = Math.max(
      5,
      Math.round(
        fuerza(rival.datos) * ataqueRival.poder / 100 -
        defensa(jugador.datos) * 0.25 +
        Math.random() * 10
      )
    );

    jugador.vida = Math.max(0, jugador.vida - danioRival);

    mensaje += `
      <br>
      ${limpiarTexto(rival.datos.nombre)} respondió con
      ${limpiarTexto(ataqueRival.nombre)}.
      ¡Causó ${danioRival} puntos de daño!
    `;

    if (jugador.vida <= 0) {
      combate.terminado = true;
      combate.resultado = "¡EL RIVAL GANÓ!";
    }

    mostrarCombate(mensaje);
  }

  elegirPokemon();
}

function conectarNavegacion(selector, funcion) {
  const elemento = $(selector);

  if (elemento) {
    elemento.addEventListener("click", e => {
      e.preventDefault();
      irA(funcion);
    });
  }
}

conectarNavegacion("#link-inicio", inicio);
conectarNavegacion("#link-inicio-nav", inicio);
conectarNavegacion("#link-pokedex", pokedex);
conectarNavegacion("#link-favoritos", favoritos);
conectarNavegacion("#link-login", login);
conectarNavegacion("#link-registro", registro);
conectarNavegacion("#link-perfil", perfil);
conectarNavegacion("#link-batalla", batalla);

const formularioBusqueda = $("#form-busqueda");
const campoBusqueda = $("#busqueda");

if (formularioBusqueda && campoBusqueda) {
  formularioBusqueda.addEventListener("submit", e => {
    e.preventDefault();

    tipo = "Todos";

    irA(() => {
      pokedex(campoBusqueda.value.trim());
    });
  });
}

inicio();
