import { createElement } from "lwc";
import TicTacToe from "c/ticTacToe";

describe("c-tic-tac-toe", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders with initial game state", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    // Check child components are rendered
    const scoreboard = element.shadowRoot.querySelector("c-tic-tac-toe-scoreboard");
    expect(scoreboard).toBeTruthy();

    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");
    expect(gameStatus).toBeTruthy();

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    expect(board).toBeTruthy();

    // Check game controls
    const buttons = element.shadowRoot.querySelectorAll("lightning-button");
    expect(buttons.length).toBe(2);
  });

  it("integrates with child components", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    // Test that child components receive proper initial data
    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const scoreboard = element.shadowRoot.querySelector("c-tic-tac-toe-scoreboard");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");

    expect(board.board).toEqual(Array(9).fill(""));
    expect(board.isGameOver).toBeFalsy();
    expect(scoreboard.playerXWins).toBe(0);
    expect(gameStatus.currentPlayer).toBe("X");
  });

  it("has proper control buttons", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const buttons = element.shadowRoot.querySelectorAll("lightning-button");
    const buttonLabels = Array.from(buttons).map(btn => btn.label);
    
    expect(buttonLabels).toContain("New Game");
    expect(buttonLabels).toContain("Reset Score");
  });

  it("handles cell click events", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    
    // Simulate cell click event
    const cellClickEvent = new CustomEvent("cellclick", {
      detail: { index: 0 }
    });
    
    board.dispatchEvent(cellClickEvent);

    // Wait for DOM updates
    await Promise.resolve();

    // Check that move was made
    expect(board.board[0]).toBe("X");
    expect(board.board.filter(cell => cell === "").length).toBe(8);
  });

  it("alternates players correctly", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");

    // First move - X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    await Promise.resolve();
    expect(board.board[0]).toBe("X");
    expect(gameStatus.currentPlayer).toBe("O");

    // Second move - O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 1 } }));
    await Promise.resolve();
    expect(board.board[1]).toBe("O");
    expect(gameStatus.currentPlayer).toBe("X");
  });

  it("prevents moves on occupied cells", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");

    // Make first move
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    await Promise.resolve();
    expect(board.board[0]).toBe("X");
    expect(gameStatus.currentPlayer).toBe("O");

    // Try to click same cell again
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    await Promise.resolve();
    expect(board.board[0]).toBe("X");
    expect(gameStatus.currentPlayer).toBe("O"); // Should not change
  });

  it("detects horizontal win", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");
    const scoreboard = element.shadowRoot.querySelector("c-tic-tac-toe-scoreboard");

    // Create winning scenario: X X X in top row
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 3 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 1 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 4 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 2 } })); // X wins

    await Promise.resolve();

    expect(gameStatus.winner).toBe("X");
    expect(board.isGameOver).toBeTruthy();
    expect(scoreboard.playerXWins).toBe(1);
    expect(board.winningLine).toEqual([0, 1, 2]);
  });

  it("detects vertical win", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");

    // Create winning scenario: O O O in first column
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 1 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 2 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 3 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 4 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 6 } })); // O wins

    await Promise.resolve();

    expect(gameStatus.winner).toBe("O");
    expect(board.winningLine).toEqual([0, 3, 6]);
  });

  it("detects diagonal win", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");

    // Create winning scenario: X X X diagonally
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 1 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 4 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 2 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 8 } })); // X wins

    await Promise.resolve();

    expect(gameStatus.winner).toBe("X");
    expect(board.winningLine).toEqual([0, 4, 8]);
  });

  it("detects draw game", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");
    const scoreboard = element.shadowRoot.querySelector("c-tic-tac-toe-scoreboard");

    // Create draw scenario
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // Results in draw
    // eslint-disable-next-line no-await-in-loop
    for (const index of moves) {
      board.dispatchEvent(new CustomEvent("cellclick", { detail: { index } }));
      await Promise.resolve();
    }

    expect(gameStatus.isDraw).toBe(true);
    expect(gameStatus.winner).toBe(null);
    expect(board.isGameOver).toBeTruthy();
    expect(scoreboard.draws).toBe(1);
  });

  it("prevents moves after game is over", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");

    // Create winning scenario
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 3 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 1 } })); // X
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 4 } })); // O
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 2 } })); // X wins

    await Promise.resolve();
    const boardStateAfterWin = [...board.board];

    // Try to make another move
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 5 } }));
    await Promise.resolve();

    // Board should not change
    expect(board.board).toEqual(boardStateAfterWin);
  });

  it("resets game with new game button", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");
    const scoreboard = element.shadowRoot.querySelector("c-tic-tac-toe-scoreboard");

    // Make some moves and create a win
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 3 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 1 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 4 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 2 } }));

    await Promise.resolve();
    const initialXWins = scoreboard.playerXWins;

    // Click new game button
    const newGameButton = Array.from(element.shadowRoot.querySelectorAll("lightning-button"))
      .find(btn => btn.label === "New Game");
    newGameButton.click();

    await Promise.resolve();

    // Game should reset but scores should remain
    expect(board.board).toEqual(Array(9).fill(""));
    expect(gameStatus.currentPlayer).toBe("X");
    expect(gameStatus.winner).toBe(null);
    expect(gameStatus.isDraw).toBe(false);
    expect(board.isGameOver).toBeFalsy();
    expect(board.winningLine).toEqual([]);
    expect(scoreboard.playerXWins).toBe(initialXWins); // Score preserved
  });

  it("resets scores with reset score button", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const scoreboard = element.shadowRoot.querySelector("c-tic-tac-toe-scoreboard");

    // Create a win to increment score
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 3 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 1 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 4 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 2 } }));

    await Promise.resolve();
    expect(scoreboard.playerXWins).toBe(1);

    // Click reset score button
    const resetScoreButton = Array.from(element.shadowRoot.querySelectorAll("lightning-button"))
      .find(btn => btn.label === "Reset Score");
    resetScoreButton.click();

    await Promise.resolve();

    // All scores should be reset and game should be reset
    expect(scoreboard.playerXWins).toBe(0);
    expect(scoreboard.playerOWins).toBe(0);
    expect(scoreboard.draws).toBe(0);
    expect(board.board).toEqual(Array(9).fill(""));
  });

  it("tracks multiple wins correctly", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const scoreboard = element.shadowRoot.querySelector("c-tic-tac-toe-scoreboard");
    const newGameButton = Array.from(element.shadowRoot.querySelectorAll("lightning-button"))
      .find(btn => btn.label === "New Game");

    // Game 1: X wins
    // eslint-disable-next-line no-await-in-loop
    for (const index of [0, 3, 1, 4, 2]) {
      board.dispatchEvent(new CustomEvent("cellclick", { detail: { index } }));
      await Promise.resolve();
    }
    expect(scoreboard.playerXWins).toBe(1);

    // Start new game
    newGameButton.click();
    await Promise.resolve();

    // Game 2: O wins
    // eslint-disable-next-line no-await-in-loop
    for (const index of [0, 3, 1, 4, 8, 5]) {
      board.dispatchEvent(new CustomEvent("cellclick", { detail: { index } }));
      await Promise.resolve();
    }
    expect(scoreboard.playerOWins).toBe(1);
    expect(scoreboard.playerXWins).toBe(1);

    // Start new game
    newGameButton.click();
    await Promise.resolve();

    // Game 3: Draw
    // eslint-disable-next-line no-await-in-loop
    for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) {
      board.dispatchEvent(new CustomEvent("cellclick", { detail: { index } }));
      await Promise.resolve();
    }
    expect(scoreboard.draws).toBe(1);
    expect(scoreboard.playerXWins).toBe(1);
    expect(scoreboard.playerOWins).toBe(1);
  });

  it("handles edge case scenarios", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");

    // Test rapid consecutive clicks on same cell
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: 0 } }));
    await Promise.resolve();

    expect(board.board[0]).toBe("X");
    expect(gameStatus.currentPlayer).toBe("O");
  });

  it("validates game state consistency", async () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const board = element.shadowRoot.querySelector("c-tic-tac-toe-board");
    const gameStatus = element.shadowRoot.querySelector("c-tic-tac-toe-game-status");

    // Make several moves and validate state consistency
    const moves = [0, 4, 1, 5, 2]; // X wins horizontally
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < moves.length; i++) {
      board.dispatchEvent(new CustomEvent("cellclick", { detail: { index: moves[i] } }));
      await Promise.resolve();
      
      // Validate turn alternation before game ends
      if (i < moves.length - 1) {
        const expectedPlayer = i % 2 === 0 ? "O" : "X";
        expect(gameStatus.currentPlayer).toBe(expectedPlayer);
      }
    }

    // Game should be over with X as winner
    expect(gameStatus.winner).toBe("X");
    expect(board.isGameOver).toBeTruthy();
  });
});