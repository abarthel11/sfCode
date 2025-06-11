import { LightningElement, api } from 'lwc';

export default class TicTacToeGameStatus extends LightningElement {
    @api winner = null;
    @api isDraw = false;
    @api currentPlayer = 'X';

    get gameStatus() {
        if (this.winner) {
            return `Player ${this.winner} wins!`;
        }
        if (this.isDraw) {
            return 'Game is a draw!';
        }
        return `Player ${this.currentPlayer}'s turn`;
    }
}