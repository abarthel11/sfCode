import { createElement } from "lwc";
import TicTacToeGameStatus from "c/ticTacToeGameStatus";

describe("c-tic-tac-toe-game-status", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("shows current player turn", () => {
    const element = createElement("c-tic-tac-toe-game-status", {
      is: TicTacToeGameStatus
    });
    element.winner = null;
    element.isDraw = false;
    element.currentPlayer = "X";
    
    document.body.appendChild(element);

    const statusText = element.shadowRoot.querySelector("h2");
    expect(statusText.textContent).toBe("Player X's turn");
  });

  it("shows other player turn", () => {
    const element = createElement("c-tic-tac-toe-game-status", {
      is: TicTacToeGameStatus
    });
    element.winner = null;
    element.isDraw = false;
    element.currentPlayer = "O";
    
    document.body.appendChild(element);

    const statusText = element.shadowRoot.querySelector("h2");
    expect(statusText.textContent).toBe("Player O's turn");
  });

  it("shows winner message", () => {
    const element = createElement("c-tic-tac-toe-game-status", {
      is: TicTacToeGameStatus
    });
    element.winner = "X";
    element.isDraw = false;
    element.currentPlayer = "O";
    
    document.body.appendChild(element);

    const statusText = element.shadowRoot.querySelector("h2");
    expect(statusText.textContent).toBe("Player X wins!");
  });

  it("shows draw message", () => {
    const element = createElement("c-tic-tac-toe-game-status", {
      is: TicTacToeGameStatus
    });
    element.winner = null;
    element.isDraw = true;
    element.currentPlayer = "X";
    
    document.body.appendChild(element);

    const statusText = element.shadowRoot.querySelector("h2");
    expect(statusText.textContent).toBe("Game is a draw!");
  });

  it("prioritizes winner over draw", () => {
    const element = createElement("c-tic-tac-toe-game-status", {
      is: TicTacToeGameStatus
    });
    element.winner = "O";
    element.isDraw = true;
    element.currentPlayer = "X";
    
    document.body.appendChild(element);

    const statusText = element.shadowRoot.querySelector("h2");
    expect(statusText.textContent).toBe("Player O wins!");
  });

  it("has proper structure and styling", () => {
    const element = createElement("c-tic-tac-toe-game-status", {
      is: TicTacToeGameStatus
    });
    
    document.body.appendChild(element);

    const gameStatus = element.shadowRoot.querySelector(".game-status");
    expect(gameStatus).toBeTruthy();
    
    const heading = element.shadowRoot.querySelector("h2");
    expect(heading).toBeTruthy();
    expect(heading.classList.contains("slds-text-heading_medium")).toBe(true);
  });
});