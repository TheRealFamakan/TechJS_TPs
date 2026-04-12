const BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Récupère les données brutes d'un Pokémon par nom ou id.
 * On extrait uniquement ce dont on a besoin (pas tout l'objet API).
 *
 * @param {string|number} nameOrId
 * @returns {{ name, id, sprites, moves }} — objet simplifié
 */
export async function fetchPokemon(nameOrId) {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);

  // fetch() ne lève PAS d'erreur sur 404 : on doit vérifier .ok manuellement
  if (!res.ok) throw new Error(`Pokémon "${nameOrId}" introuvable.`);

  const data = await res.json();

  return {
    name: data.name,
    id: data.id,
    sprite: data.sprites.front_default,
    // moves est un tableau d'objets { move: { name, url }, ... }
    // On garde juste les 20 premiers pour ne pas surcharger
    moveUrls: data.moves.slice(0, 20).map((m) => m.move.url),
  };
}

/**
 * Récupère les détails d'un move à partir de son URL directe.
 * On extrait : name, power, accuracy, pp, damage_class.
 *
 * @param {string} url — URL complète fournie par l'API
 * @returns {{ name, power, accuracy, pp, type }}
 */
export async function fetchMove(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Move introuvable : ${url}`);

  const data = await res.json();

  return {
    name: data.name,
    // power peut être null pour les moves de statut → on met 0
    power: data.power ?? 0,
    // accuracy peut être null (moves qui ne ratent jamais) → on met 100
    accuracy: data.accuracy ?? 100,
    pp: data.pp ?? 5,
    type: data.damage_class?.name ?? "unknown", // physical / special / status
  };
}

/**
 * Charge un Pokémon + ses moves en parallèle.
 * Promise.all() lance tous les fetch en même temps → bien plus rapide que séquentiel.
 *
 * On filtre pour ne garder que les moves avec power > 0 (on ignore les moves de statut)
 * et on en prend 5 au maximum (règle du TP).
 *
 * @param {string|number} nameOrId
 * @returns {{ name, id, moves: Move[] }}
 */
export async function loadPokemonWithMoves(nameOrId) {
  const pokemon = await fetchPokemon(nameOrId);

  // Récupère tous les moves en parallèle
  const allMoves = await Promise.all(pokemon.moveUrls.map(fetchMove));

  // On filtre les moves utiles (ont une puissance) et on en prend 5
  const moves = allMoves
    .filter((m) => m.power > 0)
    .slice(0, 5);

  if (moves.length === 0) {
    throw new Error(`Ce Pokémon n'a aucun move offensif disponible.`);
  }

  return { name: pokemon.name, id: pokemon.id, moves };
}