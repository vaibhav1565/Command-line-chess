class GameManager {
    constructor() {
        this.games = [];
    }

    addGame(game) {
        this.games.push(game);
    }

    removeGame(game) {
        const index = this.games.indexOf(game);
        if (index > -1) this.games.splice(index, 1);
    }

    findGameByPlayer(ws) {
        return this.games.find(game => game.hasPlayer(ws));
    }
}

export default GameManager;