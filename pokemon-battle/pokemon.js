export class Pokemon {
  /**
   * @param {string} name
   * @param {Array}  moves — tableau de move objects venant de l'API
   */
  constructor(name, moves) {
    this.name = name;
    this.hp = 300; // HP fixe défini par le TP
    this.maxHp = 300;

    // On crée une copie des moves avec un champ `currentPp`
    // pour suivre les PP restants EN JEU sans modifier les données originales.
    this.moves = moves.map((m) => ({
      ...m,           // spread : copie toutes les propriétés du move
      currentPp: m.pp // PP actuels (diminueront au fil des tours)
    }));
  }

  /** Retourne true si le Pokémon est encore en vie */
  get isAlive() {
    return this.hp > 0;
  }

  /**
   * Applique des dégâts. Math.max évite de passer sous 0.
   * @param {number} amount
   */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  /**
   * Tente d'utiliser un move.
   * Retourne un objet résultat décrivant ce qui s'est passé.
   *
   * Règles du TP :
   *  1. Si pp du move < pp de l'adversaire → attaque annulée
   *  2. Précision (accuracy) détermine si l'attaque touche
   *  3. Dégâts = power (simplifié, pas de stats Attack/Defense)
   *
   * @param {object} move       — le move choisi (doit appartenir à this.moves)
   * @param {Pokemon} opponent  — le Pokémon adverse
   * @returns {{ success: bool, reason?: string, damage?: number, missed?: bool }}
   */
  useMove(move, opponent) {
    // ── Règle 1 : PP du move < PP de l'adversaire → annulation ──────────────
    // On cherche le move correspondant chez l'adversaire (même nom)
    const opponentEquivalent = opponent.moves.find((m) => m.name === move.name);

    if (opponentEquivalent && move.currentPp < opponentEquivalent.currentPp) {
      return {
        success: false,
        reason: `PP insuffisants (${move.currentPp} < ${opponentEquivalent.currentPp} de l'adversaire)`,
      };
    }

    // ── Consomme 1 PP ────────────────────────────────────────────────────────
    move.currentPp -= 1;

    // ── Règle 2 : Précision ──────────────────────────────────────────────────
    // Math.random() retourne [0, 1). On compare à accuracy/100.
    const hit = Math.random() * 100 < move.accuracy;
    if (!hit) {
      return { success: true, missed: true, damage: 0 };
    }

    // ── Règle 3 : Dégâts ─────────────────────────────────────────────────────
    const damage = move.power;
    opponent.takeDamage(damage);

    return { success: true, missed: false, damage };
  }

  /** Affichage de la barre de vie en console */
  hpBar() {
    const ratio = this.hp / this.maxHp;
    const filled = Math.round(ratio * 20);
    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
    const color = ratio > 0.5 ? "\x1b[32m" : ratio > 0.25 ? "\x1b[33m" : "\x1b[31m";
    return `${color}[${bar}]\x1b[0m ${this.hp}/${this.maxHp}`;
  }
}