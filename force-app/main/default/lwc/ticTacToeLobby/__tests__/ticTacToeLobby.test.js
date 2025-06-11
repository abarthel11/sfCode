import { createElement } from "lwc";
import TicTacToeLobby from "c/ticTacToeLobby";

describe("c-tic-tac-toe-lobby", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders correctly", () => {
    const element = createElement("c-tic-tac-toe-lobby", {
      is: TicTacToeLobby
    });
    document.body.appendChild(element);
    
    expect(element).toBeTruthy();
  });
});