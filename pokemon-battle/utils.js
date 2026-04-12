import readline from "readline";

// ── Couleurs ANSI ────────────────────────────────────────────────────────────
// Ces codes sont interprétés par le terminal pour coloriser le texte.
export const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  white:  "\x1b[37m",
  gray:   "\x1b[90m",
};

/** Affiche un texte coloré */
export const print = (text) => console.log(text);

/** Ligne de séparation */
export const hr = () => console.log(`${c.gray}${"─".repeat(50)}${c.reset}`);

/**
 * Demande une saisie utilisateur.
 * readline est l'API Node.js pour lire depuis stdin.
 * On l'enveloppe dans une Promise pour pouvoir utiliser await.
 *
 * @param {string} question
 * @returns {Promise<string>}
 */
export function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${c.cyan}${question}${c.reset}`, (answer) => {
      rl.close(); // IMPORTANT : ferme le flux sinon le programme ne s'arrête pas
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Affiche le menu des moves et demande au joueur d'en choisir un.
 * Boucle jusqu'à ce que le choix soit valide.
 *
 * @param {Array} moves
 * @returns {Promise<object>} — le move choisi
 */
export async function chooseMoveMenu(moves) {
  while (true) {
    print(`\n${c.bold}Tes moves :${c.reset}`);
    moves.forEach((m, i) => {
      const ppColor = m.currentPp > 2 ? c.green : m.currentPp > 0 ? c.yellow : c.red;
      print(
        `  ${c.bold}${i + 1}.${c.reset} ${c.white}${m.name.padEnd(20)}${c.reset}` +
        ` ⚡ Power: ${c.yellow}${String(m.power).padStart(3)}${c.reset}` +
        ` 🎯 Acc: ${c.cyan}${String(m.accuracy).padStart(3)}%${c.reset}` +
        ` 💧 PP: ${ppColor}${m.currentPp}/${m.pp}${c.reset}`
      );
    });

    const input = await ask("\nChoix (1-" + moves.length + ") : ");
    const index = parseInt(input) - 1;

    if (index >= 0 && index < moves.length) {
      const chosen = moves[index];
      if (chosen.currentPp === 0) {
        print(`${c.red}Ce move n'a plus de PP !${c.reset}`);
        continue;
      }
      return chosen;
    }
    print(`${c.red}Choix invalide.${c.reset}`);
  }
}

/**
 * Affiche le résultat d'un tour (tableau de logs produit par Battle.playTurn)
 */
export function displayTurnLog(logs) {
  for (const entry of logs) {
    if (entry.nopp) {
      print(`${c.gray}${entry.attacker} n'a plus de PP et ne peut pas attaquer !${c.reset}`);
      continue;
    }
    if (!entry.success) {
      print(`${c.red}✗ ${entry.attacker} utilise ${entry.move} — ANNULÉ (${entry.reason})${c.reset}`);
      continue;
    }
    if (entry.missed) {
      print(`${c.yellow}✗ ${entry.attacker} utilise ${entry.move} — RATÉ !${c.reset}`);
      continue;
    }
    print(`${c.green}✓ ${entry.attacker} utilise ${entry.move} → ${entry.damage} dégâts${c.reset}`);
  }
}

/** Affiche l'état des HP des deux combattants */
export function displayStatus(player, bot) {
  hr();
  print(`${c.bold}${player.name.toUpperCase().padEnd(15)}${c.reset} ${player.hpBar()}`);
  print(`${c.bold}${bot.name.toUpperCase().padEnd(15)}${c.reset} ${bot.hpBar()}`);
  hr();
}