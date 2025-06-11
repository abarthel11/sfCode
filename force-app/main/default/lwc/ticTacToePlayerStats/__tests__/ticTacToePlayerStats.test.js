import { createElement } from "lwc";
import TicTacToePlayerStats from "c/ticTacToePlayerStats";

describe("c-tic-tac-toe-player-stats", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders correctly", () => {
    const element = createElement("c-tic-tac-toe-player-stats", {
      is: TicTacToePlayerStats
    });
    document.body.appendChild(element);
    
    expect(element).toBeTruthy();
  });

});