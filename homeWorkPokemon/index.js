const https = require("node:https");      // Built-in module pour les appels ou requests HTTP
const inquirer = require("inquirer");      // Third party module pour l'interactivité CLI

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";

            // L'événement "data" est émis à chaque chunk de données reçu
            res.on("data", (chunk) => {
                data += chunk;
            });

            // L'événement "end" est émis quand toute la réponse a été reçue
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(new Error("Erreur de parsing JSON"));
                }
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

async function fetchPokemon(name) {
    const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;
    return await fetchJSON(url);
}

async function fetchMove(url) {
    const moveData = await fetchJSON(url);
    return {
        name: moveData.name,
        power: moveData.power,
        accuracy: moveData.accuracy,
        pp: moveData.pp,
    };
}

async function preparePokemon(name) {
    console.log(`\nChargement de ${name}...`);
    
    const pokemonData = await fetchPokemon(name);
    
    // Récupérer les URLs de tous les moves du Pokémon
    const allMoveUrls = pokemonData.moves.map((m) => m.move.url);

    // On récupère les détails de TOUS les moves d'abord
    // puis on filtre ceux qui ont une puissance (power)
    // On prend au max 20 pour ne pas surcharger l'API
    const sampleUrls = allMoveUrls.sort(() => Math.random() - 0.5).slice(0, 20);

    console.log(`Chargement des attaques de ${pokemonData.name}...`);
    
    const moveDetails = [];
    for (const url of sampleUrls) {
        const move = await fetchMove(url);
        if (move.power !== null && move.power > 0) {
            moveDetails.push(move);
        }
        // Dès qu'on a 5 moves offensifs, on arrête
        if (moveDetails.length >= 5) break;
    }

    // Si on n'a pas trouvé 5 moves offensifs, on garde ce qu'on a
    if (moveDetails.length === 0) {
        throw new Error(`${pokemonData.name} n'a aucun move offensif disponible !`);
    }

    // Ajouter les PP actuels (currentPp) qui diminuent pendant le combat
    const moves = moveDetails.map((m) => ({
        ...m,
        currentPp: m.pp, // Au début, currentPp = pp max
    }));

    return {
        name: pokemonData.name.toUpperCase(),
        hp: 300,           // Chaque joueur commence avec 300 HP (règle du TP)
        moves: moves,
    };
}

function hpBar(currentHp, maxHp) {
    const total = 20;
    const filled = Math.max(0, Math.round((currentHp / maxHp) * total));
    const empty = total - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    return `[${bar}] ${Math.max(0, currentHp)}/${maxHp} HP`;
}

function displayStatus(player, bot) {
    console.log("\n╔══════════════════════════════════════════╗");
    console.log(`║  JOUEUR  ${player.name.padEnd(15)} ${hpBar(player.hp, 300)} ║`);
    console.log(`║  BOT     ${bot.name.padEnd(15)} ${hpBar(bot.hp, 300)} ║`);
    console.log("╚══════════════════════════════════════════╝");
}


async function playerChooseMove(moves) {
    // Filtrer les moves qui ont encore des PP
    const available = moves.filter((m) => m.currentPp > 0);

    if (available.length === 0) {
        console.log("Tu n'as plus de PP ! Tu passes ton tour.");
        return null;
    }

    const { chosenMove } = await inquirer.prompt([
        {
            type: "list",
            name: "chosenMove",
            message: "Choisis ton attaque :",
            choices: available.map((m) => ({
                name: `${m.name.padEnd(20)} | Power: ${String(m.power).padEnd(4)} | Accuracy: ${String(m.accuracy).padEnd(4)} | PP: ${m.currentPp}/${m.pp}`,
                value: m,
            })),
        },
    ]);

    return chosenMove;
}

function botChooseMove(moves) {
    const available = moves.filter((m) => m.currentPp > 0);
    if (available.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}


function executeAttack(attacker, attackerMove, defender, enemyMove, label) {
    console.log(`\n${label} utilise ${attackerMove.name.toUpperCase()} !`);

    // Diminuer les PP
    attackerMove.currentPp--;

    // Règle du PP : si l'attaque du joueur a moins de PP que l'attaque de l'ennemi,
    // l'attaque n'a pas lieu
    if (enemyMove && attackerMove.pp < enemyMove.pp) {
        console.log(`   BLOQUE ! Les PP de ${attackerMove.name} (${attackerMove.pp}) sont inferieurs aux PP de ${enemyMove.name} (${enemyMove.pp}).`);
        return;
    }

    // Vérifier l'accuracy
    const roll = Math.random() * 100;
    if (roll > attackerMove.accuracy) {
        console.log(`   Rate ! (accuracy: ${attackerMove.accuracy}%, roll: ${Math.round(roll)}%)`);
        return;
    }

    // Appliquer les dégâts
    defender.hp -= attackerMove.power;
    if (defender.hp < 0) defender.hp = 0;

    console.log(`   Touche ! ${attackerMove.power} degats infliges a ${defender.name} !`);
}


async function main() {
    console.log("╔══════════════════════════════════════════╗");
    console.log("║        POKEMON BATTLE SIMULATOR          ║");
    console.log("║           Mini Jeu CLI - Node.js         ║");
    console.log("╚══════════════════════════════════════════╝");

    // --- Étape 1 : Le joueur choisit son Pokémon ---
    const { playerName } = await inquirer.prompt([
        {
            type: "input",
            name: "playerName",
            message: "Choisis ton Pokemon (ex: pikachu, charizard, mewtwo) :",
            validate: (input) => input.trim().length > 0 || "Tu dois entrer un nom !",
        },
    ]);

    // --- Étape 2 : Le bot choisit un Pokémon aléatoire ---
    const botPokemonList = ["charizard", "blastoise", "venusaur", "gengar", "machamp", "alakazam", "dragonite", "snorlax", "gyarados", "arcanine"];
    const botName = botPokemonList[Math.floor(Math.random() * botPokemonList.length)];

    // --- Étape 3 : Charger les deux Pokémon depuis l'API ---
    let player, bot;
    try {
        player = await preparePokemon(playerName.trim());
        bot = await preparePokemon(botName);
    } catch (err) {
        console.log(`\nErreur : ${err.message}`);
        console.log("Vérifie que le nom du Pokémon est correct et réessaie.");
        return;
    }

    console.log(`\nTu joues avec : ${player.name}`);
    console.log(`Le bot joue avec : ${bot.name}`);
    console.log(`\nTes attaques :`);
    player.moves.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.name.padEnd(20)} Power: ${m.power}  Accuracy: ${m.accuracy}%  PP: ${m.pp}`);
    });

    console.log(`\nAttaques du bot :`);
    bot.moves.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.name.padEnd(20)} Power: ${m.power}  Accuracy: ${m.accuracy}%  PP: ${m.pp}`);
    });

    // --- Étape 4 : Boucle de combat ---
    let round = 1;

    while (player.hp > 0 && bot.hp > 0) {
        console.log(`\n━━━━━━━━━━━ ROUND ${round} ━━━━━━━━━━━`);
        displayStatus(player, bot);

        // Le joueur choisit son attaque
        const playerMove = await playerChooseMove(player.moves);

        // Le bot choisit aléatoirement
        const botMove = botChooseMove(bot.moves);

        // Si aucun des deux ne peut attaquer, match nul
        if (!playerMove && !botMove) {
            console.log("\nPlus personne ne peut attaquer ! Match nul !");
            break;
        }

        // Attaque du joueur
        if (playerMove) {
            executeAttack(player, playerMove, bot, botMove, "JOUEUR");
        }

        // Vérifier si le bot est KO
        if (bot.hp <= 0) break;

        // Attaque du bot
        if (botMove) {
            executeAttack(bot, botMove, player, playerMove, "BOT");
        }

        // Vérifier si le joueur est KO
        if (player.hp <= 0) break;

        round++;
    }

    // --- Étape 5 : Résultat final ---
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║             FIN DU COMBAT                ║");
    console.log("╚══════════════════════════════════════════╝");
    displayStatus(player, bot);

    if (player.hp <= 0 && bot.hp <= 0) {
        console.log("\nMatch nul ! Les deux Pokemon sont KO !");
    } else if (bot.hp <= 0) {
        console.log(`\nVICTOIRE ! ${player.name} a gagne le combat !`);
    } else if (player.hp <= 0) {
        console.log(`\nDEFAITE ! ${bot.name} a gagne le combat...`);
    } else {
        console.log("\nMatch nul par manque de PP !");
    }

    console.log("\nMerci d'avoir joue !\n");
}

// Lancer le jeu
main();
