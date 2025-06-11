import { createElement } from "lwc";
import TicTacToeApp from "c/ticTacToeApp";

describe("c-tic-tac-toe-app", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders correctly", () => {
    const element = createElement("c-tic-tac-toe-app", {
      is: TicTacToeApp
    });
    document.body.appendChild(element);
    
    expect(element).toBeTruthy();
  });
});