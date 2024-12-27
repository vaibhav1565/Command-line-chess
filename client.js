import WebSocket from 'ws';
import { Chess } from 'chess.js';
import readline from 'readline';

// Setup readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}

const chess = new Chess();
let playerTurn;
let playerColor;

const ws = new WebSocket('ws://localhost:8080');

// WebSocket event handlers
ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
});

ws.on('open', () => {
    console.clear();
    console.log('\nConnected to the server.');
});

ws.on('message', async (data) => {
    const command = data.toString('utf-8');
    switch (command) {
        case 'WAIT':
            console.log('Waiting for another player to join...');
            playerColor = 'w';
            break;

        case 'START':
            if (!playerColor) playerColor = 'b';
            startChess();
            break;

        case 'END':
            console.log('Game ended by the server.');
            rl.close();
            process.exit();

        default:
            handleMove(command);
            break;
    }
});

ws.on('close', () => {
    console.log('Connection to the server was closed. Exiting...');
    rl.close();
    process.exit();
});

// Sends a move to the WebSocket server
async function sendChessMove(move) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(move);
    } else {
        console.error('Connection is not open. Exiting...');
        rl.close();
        process.exit();
    }
}

// Starts the chess game
function startChess() {
    playerTurn = 'w';
    console.clear();
    console.log('Welcome to the Chess Game!');
    console.log(`You are playing as ${playerColor === 'w' ? 'White' : 'Black'}.`);
    if (playerColor === 'b') displayBoard();

    if (playerColor === playerTurn) {
        chessTurn();
    } else {
        console.log('\nWaiting for your opponent to make the first move...');
    }
}

// Handles the player's turn
async function chessTurn() {
    console.log('Your turn!');
    displayBoard();
    console.log('Valid moves:', chess.moves());

    let isMoveValid = false;
    while (!isMoveValid) {
        move = await askQuestion('Enter your move: ');
        // to simulate a random game-
        // const moves = chess.moves();
        // const move = moves[Math.floor(Math.random() * moves.length)];
        try {
            chess.move(move, { strict: true });
            isMoveValid = true;
            sendChessMove(move);
        } catch (error) {
            console.error('Invalid move. Please try again.');
        }
    }

    playerTurn = chess.turn();
    if (chess.isGameOver()) {
        announceGameOver();
    } else {
        console.log("Waiting for opponent to move...")
    }
}

// Handles the opponent's move
function handleMove(command) {
    console.log('\n--------------------------');
    console.log(`Opponent played: ${command}`);
    console.log('---------------------------');
    try {
        chess.move(command, { strict: true });
    } catch (error) {
        console.error('Error processing opponent move:', error.message);
    }

    playerTurn = chess.turn();
    if (chess.isGameOver()) {
        announceGameOver();
    } else if (playerColor === playerTurn) {
        chessTurn();
    }
}

// Displays the chess board
function displayBoard() {
    console.log('\n========== Chess Board ==========');
    if (playerColor === 'b') {
        console.log(chess.ascii().split('\n').reverse().join('\n'));
    } else {
        console.log(chess.ascii());
    }
    console.log('=================================');
}

// Announces the game outcome
function announceGameOver() {
    console.log('\n========== Game Over ==========');
    displayBoard();

    if (chess.isCheckmate()) {
        console.log('Checkmate!');
        console.log(`You ${playerTurn === playerColor ? 'lost' : 'won'} the game!`);
    } else if (chess.isDraw()) {
        console.log('The game ended in a draw.');
        if (chess.isStalemate()) console.log('Reason: Stalemate');
        else if (chess.isThreefoldRepetition()) console.log('Reason: Threefold repetition');
        else if (chess.isInsufficientMaterial()) console.log('Reason: Insufficient material');
        else {
            console.log('Reason: 50-move rule');
        }
    }
    console.log(`Total moves played: ${chess.history().length}`);
    console.log('===============================');
}
