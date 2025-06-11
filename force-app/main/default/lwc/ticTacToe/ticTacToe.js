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

  winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6] // Diagonals
  ];

  get gameStatus() {
    if (this.winner) {
      return `Player ${this.winner} wins!`;
    }
    if (this.isDraw) {
      return "Game is a draw!";
    }
    return `Player ${this.currentPlayer}'s turn`;
  }

  get isGameOver() {
    return this.winner || this.isDraw;
  }

  get cells() {
    // console.log(JSON.parse(JSON.stringify(this.board)));
    const cellsConst = this.board.map((value, index) => {
      const isWinningCell = this.winningLine.includes(index);
      return {
        id: `cell-${index}`,
        value: value,
        index: index,
        disabled: value !== "" || this.isGameOver,
        isWinningCell: isWinningCell,
        classNames: isWinningCell ? "cell winning-cell" : "cell",
        ariaLabel: this.getCellAriaLabel(index, value)
      };
    });
    // console.log(cellsConst);
    return cellsConst;
  }

  getCellAriaLabel(index, value) {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const position = `Row ${row}, Column ${col}`;

    if (value) {
      return `${position}, marked by player ${value}`;
    }
    return `${position}, empty`;
  }

  handleCellClick(event) {
    // Get the button element (could be the button itself or a child element)
    const button = event.target.closest('button');
    if (!button) return;
    
    const index = parseInt(button.dataset.index, 10);
    if (!isNaN(index)) {
      this.makeMove(index);
    }
  }

  makeMove(index) {
    if (this.board[index] || this.isGameOver) {
      // console.log("Cell already taken or game over");
      return;
    }
    // console.log("Making move for index: ", index);

    const newBoard = [...this.board];
    newBoard[index] = this.currentPlayer;
    this.board = newBoard;

    if (this.checkWinner()) {
      this.winner = this.currentPlayer;
      this.updateScore();
    } else if (this.checkDraw()) {
      this.isDraw = true;
      this.draws++;
    } else {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
  }

  checkWinner() {
    for (const pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        this.winningLine = pattern;
        return true;
      }
    }
    return false;
  }

  checkDraw() {
    return this.board.every((cell) => cell !== "");
  }

  updateScore() {
    if (this.winner === "X") {
      this.playerXWins++;
    } else if (this.winner === "O") {
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
