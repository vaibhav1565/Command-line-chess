import { Chess } from 'chess.js';

class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;

        this.chess = new Chess();
        this.playerTurn = 'w';

        this.gameOutcome;
    }

    endGame(reason) {
        this.gameOutcome = reason;

        if (this.player1 && this.player1.readyState === this.player1.OPEN) this.player1.send('END');
        if (this.player2 && this.player2.readyState === this.player2.OPEN) this.player2.send('END');

        gameManager.removeGame(this);
    }

    checkGameOutcome() {
        if (this.chess.isGameOver()) {
            if (this.chess.isCheckmate()) {
                const winner = this.chess.turn() === 'w' ? 'b' : 'w';
                this.endGame(`checkmate-${winner}`);
            } else if (this.chess.isDraw()) {
                if (this.chess.isStalemate()) this.endGame('stalemate');
                else if (this.chess.isThreefoldRepetition()) this.endGame('threefoldRepetition');
                else if (this.chess.isInsufficientMaterial()) this.endGame('insufficientMaterial');
                else this.endGame('fiftyMoveRule');
            }
        }
    }

    getOtherPlayer(ws) {
        return ws === this.player1 ? this.player2 : this.player1;
    }

    hasPlayer(ws) {
        return ws === this.player1 || ws === this.player2;
    }
}

export default Game;