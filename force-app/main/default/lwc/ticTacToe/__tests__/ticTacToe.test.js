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

    const gameStatus = element.shadowRoot.querySelector(".game-status h2");
    expect(gameStatus.textContent).toBe("Player X's turn");

    const cells = element.shadowRoot.querySelectorAll(".cell");
    expect(cells.length).toBe(9);
    cells.forEach((cell) => {
      expect(cell.textContent).toBe("");
      expect(cell.disabled).toBe(false);
    });

    const scoreElements = element.shadowRoot.querySelectorAll(
      ".slds-text-heading_large"
    );
    expect(scoreElements[0].textContent).toBe("0"); // Player X wins
    expect(scoreElements[1].textContent).toBe("0"); // Draws
    expect(scoreElements[2].textContent).toBe("0"); // Player O wins
  });

  it("handles cell clicks and alternates players", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll(".cell");

    // Player X clicks cell 0
    cells[0].click();
    return Promise.resolve()
      .then(() => {
        expect(cells[0].textContent).toBe("X");
        expect(cells[0].disabled).toBe(true);

        const gameStatus = element.shadowRoot.querySelector(".game-status h2");
        expect(gameStatus.textContent).toBe("Player O's turn");

        // Player O clicks cell 1
        cells[1].click();
        return Promise.resolve();
      })
      .then(() => {
        expect(cells[1].textContent).toBe("O");
        expect(cells[1].disabled).toBe(true);

        const gameStatus = element.shadowRoot.querySelector(".game-status h2");
        expect(gameStatus.textContent).toBe("Player X's turn");
      });
  });

  it("detects winning condition", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll(".cell");

    // Create winning condition for X (top row)
    cells[0].click(); // X
    return Promise.resolve()
      .then(() => {
        cells[3].click(); // O
        return Promise.resolve();
      })
      .then(() => {
        cells[1].click(); // X
        return Promise.resolve();
      })
      .then(() => {
        cells[4].click(); // O
        return Promise.resolve();
      })
      .then(() => {
        cells[2].click(); // X wins
        return Promise.resolve();
      })
      .then(() => {
        const gameStatus = element.shadowRoot.querySelector(".game-status h2");
        expect(gameStatus.textContent).toBe("Player X wins!");

        // Check if winning cells are highlighted
        const winningCells =
          element.shadowRoot.querySelectorAll(".winning-cell");
        expect(winningCells.length).toBe(3);

        // Check score update
        const scoreElements = element.shadowRoot.querySelectorAll(
          ".slds-text-heading_large"
        );
        expect(scoreElements[0].textContent).toBe("1"); // Player X wins

        // Check that cells are disabled after game ends
        cells.forEach((cell) => {
          expect(cell.disabled).toBe(true);
        });
      });
  });

  it("detects draw condition", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll(".cell");

    // Create draw scenario
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // Results in draw
    let promise = Promise.resolve();

    moves.forEach((index) => {
      promise = promise.then(() => {
        cells[index].click();
        return Promise.resolve();
      });
    });

    return promise.then(() => {
      const gameStatus = element.shadowRoot.querySelector(".game-status h2");
      expect(gameStatus.textContent).toBe("Game is a draw!");

      const scoreElements = element.shadowRoot.querySelectorAll(
        ".slds-text-heading_large"
      );
      expect(scoreElements[1].textContent).toBe("1"); // Draws
    });
  });

  it("starts new game when New Game button is clicked", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll(".cell");

    // Make some moves
    cells[0].click();
    return Promise.resolve()
      .then(() => {
        cells[1].click();
        return Promise.resolve();
      })
      .then(() => {
        // Click New Game button
        const buttons = element.shadowRoot.querySelectorAll("lightning-button");
        const newGameButton = Array.from(buttons).find(
          (btn) => btn.label === "New Game"
        );
        newGameButton.click();
        return Promise.resolve();
      })
      .then(() => {
        // Check board is reset
        const updatedCells = element.shadowRoot.querySelectorAll(".cell");
        updatedCells.forEach((cell) => {
          expect(cell.textContent).toBe("");
          expect(cell.disabled).toBe(false);
        });

        const gameStatus = element.shadowRoot.querySelector(".game-status h2");
        expect(gameStatus.textContent).toBe("Player X's turn");
      });
  });

  it("resets score when Reset Score button is clicked", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    // Play a quick game where X wins
    const cells = element.shadowRoot.querySelectorAll(".cell");
    cells[0].click(); // X
    return Promise.resolve()
      .then(() => {
        cells[3].click(); // O
        return Promise.resolve();
      })
      .then(() => {
        cells[1].click(); // X
        return Promise.resolve();
      })
      .then(() => {
        cells[4].click(); // O
        return Promise.resolve();
      })
      .then(() => {
        cells[2].click(); // X wins
        return Promise.resolve();
      })
      .then(() => {
        // Verify score is updated
        const scoreElements = element.shadowRoot.querySelectorAll(
          ".slds-text-heading_large"
        );
        expect(scoreElements[0].textContent).toBe("1"); // Player X wins

        // Click Reset Score button
        const buttons = element.shadowRoot.querySelectorAll("lightning-button");
        const resetButton = Array.from(buttons).find(
          (btn) => btn.label === "Reset Score"
        );
        resetButton.click();
        return Promise.resolve();
      })
      .then(() => {
        const scoreElements = element.shadowRoot.querySelectorAll(
          ".slds-text-heading_large"
        );
        expect(scoreElements[0].textContent).toBe("0"); // Player X wins
        expect(scoreElements[1].textContent).toBe("0"); // Draws
        expect(scoreElements[2].textContent).toBe("0"); // Player O wins
      });
  });

  it("provides proper accessibility attributes", () => {
    const element = createElement("c-tic-tac-toe", {
      is: TicTacToe
    });
    document.body.appendChild(element);

    const gameBoard = element.shadowRoot.querySelector(".game-board");
    expect(gameBoard.getAttribute("role")).toBe("grid");
    expect(gameBoard.getAttribute("aria-label")).toBe("Tic Tac Toe game board");

    const cells = element.shadowRoot.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
      expect(cell.getAttribute("role")).toBe("gridcell");
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      expect(cell.getAttribute("aria-label")).toBe(
        `Row ${row}, Column ${col}, empty`
      );
    });

    // Test aria-label after a move
    cells[0].click();
    return Promise.resolve().then(() => {
      expect(cells[0].getAttribute("aria-label")).toBe(
        "Row 1, Column 1, marked by player X"
      );
    });
  });
});
