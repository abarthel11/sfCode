import { LightningElement, track } from "lwc";

export default class TicTacToe extends LightningElement {
  @track board = Array(9).fill("");
  @track currentPlayer = "X";
  @track winner = null;
  @track isDraw = false;
  @track winningLine = [];
  @track playerXWins = 0;
  @track playerOWins = 0;
  @track draws = 0;

  // Win patterns could be moved to a constants file for better maintainability
  winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  get isGameOver() {
    return this.winner || this.isDraw;
  }

  handleCellClick(event) {
    this.makeMove(event.detail.index);
  }

  makeMove(index) {
    if (this.board[index] || this.isGameOver) {
      return;
    }

    // Update board
    this.board = [...this.board];
    this.board[index] = this.currentPlayer;

    // Check game state
    if (this.checkWinner()) {
      this.winner = this.currentPlayer;
      this.updateScore(this.currentPlayer);
    } else if (this.checkDraw()) {
      this.isDraw = true;
      this.draws++;
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
  }

  checkWinner() {
    return this.winPatterns.some(pattern => {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winningLine = pattern;
        return true;
      }
      return false;
    });
  }

  checkDraw() {
    return this.board.every(cell => cell !== "");
  }

  updateScore(winner) {
    if (winner === "X") {
      this.playerXWins++;
    } else if (winner === "O") {
      this.playerOWins++;
    }
  }

  handleNewGame() {
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.winner = null;
    this.isDraw = false;
    this.winningLine = [];
  }

  handleResetScore() {
    this.playerXWins = 0;
    this.playerOWins = 0;
    this.draws = 0;
    this.handleNewGame();
  }
}
