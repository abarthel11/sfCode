import { createElement } from "lwc";
import TicTacToeBoard from "c/ticTacToeBoard";

describe("c-tic-tac-toe-board", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders empty board", () => {
    const element = createElement("c-tic-tac-toe-board", {
      is: TicTacToeBoard
    });
    element.board = Array(9).fill("");
    element.winningLine = [];
    element.isGameOver = false;
    
    document.body.appendChild(element);

    const gameBoard = element.shadowRoot.querySelector(".game-board");
    expect(gameBoard).toBeTruthy();
    expect(gameBoard.getAttribute("role")).toBe("grid");

    const cells = element.shadowRoot.querySelectorAll("c-tic-tac-toe-cell");
    expect(cells.length).toBe(9);
  });

  it("renders board with moves", () => {
    const element = createElement("c-tic-tac-toe-board", {
      is: TicTacToeBoard
    });
    element.board = ["X", "O", "", "", "X", "", "", "", ""];
    element.winningLine = [];
    element.isGameOver = false;
    
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll("c-tic-tac-toe-cell");
    expect(cells[0].value).toBe("X");
    expect(cells[1].value).toBe("O");
    expect(cells[2].value).toBe("");
    expect(cells[4].value).toBe("X");
  });

  it("renders winning line", () => {
    const element = createElement("c-tic-tac-toe-board", {
      is: TicTacToeBoard
    });
    element.board = ["X", "X", "X", "O", "O", "", "", "", ""];
    element.winningLine = [0, 1, 2];
    element.isGameOver = true;
    
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll("c-tic-tac-toe-cell");
    expect(cells[0].isWinningCell).toBe(true);
    expect(cells[1].isWinningCell).toBe(true);
    expect(cells[2].isWinningCell).toBe(true);
    expect(cells[3].isWinningCell).toBe(false);
  });

  it("disables all cells when game is over", () => {
    const element = createElement("c-tic-tac-toe-board", {
      is: TicTacToeBoard
    });
    element.board = ["X", "X", "X", "O", "O", "", "", "", ""];
    element.winningLine = [0, 1, 2];
    element.isGameOver = true;
    
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll("c-tic-tac-toe-cell");
    cells.forEach(cell => {
      expect(cell.disabled).toBe(true);
    });
  });

  it("forwards cellclick events", () => {
    const element = createElement("c-tic-tac-toe-board", {
      is: TicTacToeBoard
    });
    element.board = Array(9).fill("");
    element.winningLine = [];
    element.isGameOver = false;
    
    document.body.appendChild(element);

    const handler = jest.fn();
    element.addEventListener("cellclick", handler);

    // Simulate clicking on the first cell
    const cells = element.shadowRoot.querySelectorAll("c-tic-tac-toe-cell");
    const cellClickEvent = new CustomEvent("cellclick", {
      detail: { index: 0 },
      bubbles: true
    });
    
    cells[0].dispatchEvent(cellClickEvent);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.index).toBe(0);
  });

  it("generates correct aria labels", () => {
    const element = createElement("c-tic-tac-toe-board", {
      is: TicTacToeBoard
    });
    element.board = ["X", "", "O", "", "", "", "", "", ""];
    element.winningLine = [];
    element.isGameOver = false;
    
    document.body.appendChild(element);

    const cells = element.shadowRoot.querySelectorAll("c-tic-tac-toe-cell");
    expect(cells[0].ariaLabel).toBe("Row 1, Column 1, marked by player X");
    expect(cells[1].ariaLabel).toBe("Row 1, Column 2, empty");
    expect(cells[2].ariaLabel).toBe("Row 1, Column 3, marked by player O");
    expect(cells[4].ariaLabel).toBe("Row 2, Column 2, empty");
  });
});