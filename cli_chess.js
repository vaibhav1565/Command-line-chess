import { Chess } from 'chess.js';
import readline from 'readline';

// Set up readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt the user with a question
const askQuestion = (question) =>
    new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });

const chess = new Chess();
let playerTurn = chess.turn(); // Track which player's turn it is

console.clear();
// Welcome message
console.log("Welcome to the Chess Game! Let's play!");

function displayBoard() {
    console.log('Board-');
    if (playerTurn === 'b') {
        console.log(chess.ascii().split('\n').reverse().join('\n'));
    } else {
        console.log(chess.ascii());
    }
}

// Main function to handle the game loop
async function playGame() {
    while (!chess.isGameOver()) {
        console.log(`${playerTurn === 'w' ? 'White' : 'Black'}'s turn`);
        console.log("Valid moves: ", chess.moves());
        displayBoard();

        let isMoveValid = false;
        while (!isMoveValid) {
            const move = await askQuestion('What is your move? ');
            // to simulate a random game-
            // const moves = chess.moves();
            // const move = moves[Math.floor(Math.random() * moves.length)];
            try {
                chess.move(move, { strict: true });
                isMoveValid = true;
            } catch (e) {
                console.log(`Invalid move: ${e.message}`);
            }
        }

        playerTurn = chess.turn(); // Update the turn
        console.clear();
    }

    announceGameOver();
}

// Function to announce the game-over result
function announceGameOver() {
    console.log('\n========== Game Over ==========');
    console.log(chess.ascii());

    if (chess.isCheckmate()) {
        console.log("Checkmate!");
        console.log(`${playerTurn === 'w' ? 'Black' : 'White'} won!`);
    } else if (chess.isDraw()) {
        console.log('The game ended in a draw.');
        if (chess.isStalemate()) console.log('Reason: Stalemate');
        if (chess.isThreefoldRepetition()) console.log('Reason: Threefold repetition');
        if (chess.isInsufficientMaterial()) console.log('Reason: Insufficient material');
        if (chess.isDraw() && !chess.isStalemate() && !chess.isThreefoldRepetition() && !chess.isInsufficientMaterial()) {
            console.log('Reason: 50-move rule');
        }
    }
    console.log(`Total moves played: ${chess.history().length}`);

    rl.close(); // Close the readline interface
    process.exit(); // Exit the program
}

// Start the game
playGame().catch((e) => console.error("An error occurred:", e));