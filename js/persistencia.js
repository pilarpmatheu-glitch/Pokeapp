import { pokemonesDefecto } from "./db/pokemones.js";
import { usuariosDefecto } from "./db/usuarios.js";

// Version de los datos
const VERSION = "2";
const CLAVE_VERSION = "pokeapp_version";

// Cargar Pokémon iniciales
if (localStorage.getItem(CLAVE_VERSION) !== VERSION) {
  localStorage.setItem("pokemones", JSON.stringify(pokemonesDefecto));
  localStorage.setItem(CLAVE_VERSION, VERSION);
}

// Cargar usuarios iniciales
if (localStorage.getItem("usuarios") === null) {
  localStorage.setItem("usuarios", JSON.stringify(usuariosDefecto));
}

// Crear lista de favoritos si no existe
if (localStorage.getItem("favoritos") === null) {
  localStorage.setItem("favoritos", JSON.stringify([]));
}

// Leer una lista del LocalStorage
function leerDatos(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

// Leer Pokémon
export function leerPokemones() {
  return leerDatos("pokemones");
}

// Leer usuarios
export function leerUsuarios() {
  return leerDatos("usuarios");
}

// Leer favoritos
export function leerFavoritos() {
  return leerDatos("favoritos");
}

// Guardar un Pokémon nuevo
export function guardarPokemones(pokemon) {
  const lista = leerPokemones();

  if (lista.some(p => Number(p.id) === Number(pokemon.id))) {
    throw new Error("Ya existe un Pokémon con ese número.");
  }

  lista.push(pokemon);
  localStorage.setItem("pokemones", JSON.stringify(lista));
}

// Guardar un usuario nuevo
export function guardarUsuarios(usuario) {
  const lista = leerUsuarios();

  if (lista.some(u => u.username.toLowerCase() === usuario.username.toLowerCase())) {
    throw new Error("Ese nombre de usuario ya está registrado.");
  }

  lista.push(usuario);
  localStorage.setItem("usuarios", JSON.stringify(lista));
}

// Agregar o quitar un favorito
export function alternarFavorito(id) {
  let favoritos = leerFavoritos();
  const numero = Number(id);

  if (favoritos.includes(numero)) {
    favoritos = favoritos.filter(f => f !== numero);
  } else {
    favoritos.push(numero);
  }

  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  return favoritos;
}
