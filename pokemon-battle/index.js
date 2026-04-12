import { loadPokemonWithMoves } from "./api.js";
import { Pokemon }              from "./pokemon.js";
import { Battle }               from "./battle.js";
import { ask, print, hr, c, chooseMoveMenu, displayTurnLog, displayStatus } from "./utils.js";

// ── Liste de Pokémon que le bot peut choisir ─────────────────────────────────
const BOT_POOL = ["mewtwo", "gengar", "machamp", "alakazam", "gyarados"];

// ── Fonction principale ──────────────────────────────────────────────────────
// En ES modules, on peut utiliser await directement au top-level.
async function main() {
  print(`\n${c.bold}${c.yellow}╔══════════════════════════════╗`);
  print(`║   ⚡  POKEMON BATTLE  ⚡     ║`);
  print(`╚══════════════════════════════╝${c.reset}\n`);

  // ── 1. Choix du Pokémon joueur ───────────────────────────────────────────
  let playerData;
  while (true) {
    const name = await ask("Entrez le nom de votre Pokémon (ex: carapuce) : ");
    try {
      print(`${c.gray}Chargement...${c.reset}`);
      playerData = await loadPokemonWithMoves(name);
      break; // succès → on sort de la boucle
    } catch (err) {
      // err.message contient le message qu'on a mis dans api.js
      print(`${c.red}Erreur : ${err.message}${c.reset}`);
    }
  }

  // ── 2. Choix aléatoire du bot ────────────────────────────────────────────
  const botName = BOT_POOL[Math.floor(Math.random() * BOT_POOL.length)];
  print(`${c.gray}Le bot charge son Pokémon...${c.reset}`);
  const botData = await loadPokemonWithMoves(botName);

  // ── 3. Création des instances Pokemon ───────────────────────────────────
  // On instancie les classes avec les données récupérées
  const player = new Pokemon(playerData.name, playerData.moves);
  const bot    = new Pokemon(botData.name,    botData.moves);

  print(`\n${c.bold}${c.green}Votre Pokémon : ${player.name}${c.reset}`);
  print(`Moves disponibles : ${player.moves.map(m => m.name).join(", ")}`);

  print(`\n${c.bold}${c.red}Pokémon du bot : ${bot.name}${c.reset}`);
  print(`Moves disponibles : ${bot.moves.map(m => m.name).join(", ")}`);

  await ask("\nPrêt ? Appuyez sur Entrée pour commencer...");

  // ── 4. Boucle de combat ──────────────────────────────────────────────────
  const battle = new Battle(player, bot);

  while (!battle.isOver) {
    print(`\n${c.bold}${c.cyan}═══ Tour ${battle.turn} ═══${c.reset}`);
    displayStatus(player, bot);

    // Le joueur choisit son move
    const playerMove = await chooseMoveMenu(player.moves);

    // On joue le tour et on récupère le journal
    const turnLog = battle.playTurn(playerMove);

    print(""); // ligne vide pour aérer
    displayTurnLog(turnLog);
  }

  // ── 5. Résultat final ────────────────────────────────────────────────────
  hr();
  displayStatus(player, bot);

  const winner = battle.winner;
  if (winner === player) {
    print(`\n${c.bold}${c.green}🏆 VICTOIRE ! ${player.name} a gagné !${c.reset}\n`);
  } else {
    print(`\n${c.bold}${c.red}💀 DÉFAITE... ${bot.name} a gagné.${c.reset}\n`);
  }
}

// ── Lancement avec gestion d'erreur globale ──────────────────────────────────
main().catch((err) => {
  console.error(`${c.red}Erreur fatale : ${err.message}${c.reset}`);
  process.exit(1);
});