import { createElement } from "lwc";
import TicTacToeScoreboard from "c/ticTacToeScoreboard";

describe("c-tic-tac-toe-scoreboard", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders initial scores", () => {
    const element = createElement("c-tic-tac-toe-scoreboard", {
      is: TicTacToeScoreboard
    });
    element.playerXWins = 0;
    element.playerOWins = 0;
    element.draws = 0;

    document.body.appendChild(element);

    const scoreElements = element.shadowRoot.querySelectorAll(
      ".slds-text-heading_large"
    );
    expect(scoreElements[0].textContent).toBe("0"); // Player X
    expect(scoreElements[1].textContent).toBe("0"); // Draws
    expect(scoreElements[2].textContent).toBe("0"); // Player O
  });

  it("renders updated scores", () => {
    const element = createElement("c-tic-tac-toe-scoreboard", {
      is: TicTacToeScoreboard
    });
    element.playerXWins = 3;
    element.playerOWins = 1;
    element.draws = 2;

    document.body.appendChild(element);

    const scoreElements = element.shadowRoot.querySelectorAll(
      ".slds-text-heading_large"
    );
    expect(scoreElements[0].textContent).toBe("3"); // Player X
    expect(scoreElements[1].textContent).toBe("2"); // Draws
    expect(scoreElements[2].textContent).toBe("1"); // Player O
  });

  it("has proper structure and styling", () => {
    const element = createElement("c-tic-tac-toe-scoreboard", {
      is: TicTacToeScoreboard
    });

    document.body.appendChild(element);

    const scoreBoard = element.shadowRoot.querySelector(".score-board");
    expect(scoreBoard).toBeTruthy();

    const grid = element.shadowRoot.querySelector(".slds-grid");
    expect(grid).toBeTruthy();

    const columns = element.shadowRoot.querySelectorAll(".slds-col");
    expect(columns.length).toBe(3);

    const labels = element.shadowRoot.querySelectorAll(
      ".slds-text-heading_small"
    );
    expect(labels[0].textContent).toBe("Player X");
    expect(labels[1].textContent).toBe("Draws");
    expect(labels[2].textContent).toBe("Player O");
  });
});
