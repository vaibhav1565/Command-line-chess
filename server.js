import { WebSocketServer } from 'ws';

import Game from './Game.js';
import GameManager from './GameManager.js';

const wss = new WebSocketServer({ port: 8080 });
let waitingPlayer = null;
const gameManager = new GameManager();

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (data) => {
        try {
            const move = data.toString();
            const game = gameManager.findGameByPlayer(ws);

            if (game && ((game.playerTurn === 'w' && ws === game.player1) || (game.playerTurn === 'b' && ws === game.player2))) {
                const result = game.chess.move(move);
                if (result) {
                    const other = game.getOtherPlayer(ws);
                    if (other && other.readyState === ws.OPEN) {
                        other.send(move);
                    }
                    game.checkGameOutcome();
                    game.playerTurn = game.playerTurn === 'b' ? 'w' : 'b';
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    ws.on('close', () => {
        const game = gameManager.findGameByPlayer(ws);
        if (game) {
            const other = game.getOtherPlayer(ws);
            if (other && other.readyState === ws.OPEN) {
                other.close();
            }
            gameManager.removeGame(game);
        }

        if (waitingPlayer === ws) {
            waitingPlayer = null;
        }
    });

    if (!waitingPlayer) {
        waitingPlayer = ws;
        ws.send('WAIT');
    } else {
        const newGame = new Game(waitingPlayer, ws);
        gameManager.addGame(newGame);
        waitingPlayer.send('START');
        ws.send('START');
        waitingPlayer = null;
    }
});