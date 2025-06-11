import { createElement } from "lwc";
import MultiplayerTicTacToe from "c/multiplayerTicTacToe";

describe("c-multiplayer-tic-tac-toe", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders correctly", () => {
    const element = createElement("c-multiplayer-tic-tac-toe", {
      is: MultiplayerTicTacToe
    });
    element.sessionId = 'test-session-123';
    document.body.appendChild(element);
    
    expect(element).toBeTruthy();
    expect(element.sessionId).toBe('test-session-123');
  });

});