import { Pokemon } from "./pokemon.js";

export class Battle {
  /**
   * @param {Pokemon} player
   * @param {Pokemon} bot
   */
  constructor(player, bot) {
    this.player = player;
    this.bot = bot;
    this.turn = 1;
  }

  /** Retourne true si le combat est terminé */
  get isOver() {
    return !this.player.isAlive || !this.bot.isAlive;
  }

  /** Le bot choisit un move aléatoirement parmi ceux qui ont des PP > 0 */
  botChooseMove() {
    const available = this.bot.moves.filter((m) => m.currentPp > 0);
    if (available.length === 0) return null; // plus aucun PP
    return available[Math.floor(Math.random() * available.length)];
  }

  /**
   * Joue un tour complet :
   *  1. Le joueur attaque le bot
   *  2. Si le bot est encore vivant, il contre-attaque
   *
   * @param {object} playerMove — move choisi par le joueur
   * @returns {TurnResult}      — objet décrivant ce qui s'est passé
   */
  playTurn(playerMove) {
    const log = []; // journal du tour, affiché ensuite dans index.js

    // ── Attaque du joueur ────────────────────────────────────────────────────
    const playerResult = this.player.useMove(playerMove, this.bot);
    log.push({ attacker: this.player.name, move: playerMove.name, ...playerResult });

    // ── Contre-attaque du bot (seulement s'il est vivant) ───────────────────
    if (this.bot.isAlive) {
      const botMove = this.botChooseMove();

      if (botMove) {
        const botResult = this.bot.useMove(botMove, this.player);
        log.push({ attacker: this.bot.name, move: botMove.name, ...botResult });
      } else {
        log.push({ attacker: this.bot.name, move: null, nopp: true });
      }
    }

    this.turn++;
    return log;
  }

  /** Retourne le vainqueur (Pokemon) ou null si combat en cours */
  get winner() {
    if (!this.isOver) return null;
    return this.player.isAlive ? this.player : this.bot;
  }
}