import { createElement } from "lwc";
import TicTacToeLeaderboard from "c/ticTacToeLeaderboard";

describe("c-tic-tac-toe-leaderboard", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders correctly", () => {
    const element = createElement("c-tic-tac-toe-leaderboard", {
      is: TicTacToeLeaderboard
    });
    document.body.appendChild(element);
    
    expect(element).toBeTruthy();
  });

});