import { createElement } from "lwc";
import TicTacToeCell from "c/ticTacToeCell";

describe("c-tic-tac-toe-cell", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders empty cell", () => {
    const element = createElement("c-tic-tac-toe-cell", {
      is: TicTacToeCell
    });
    element.value = "";
    element.index = 0;
    element.disabled = false;
    element.isWinningCell = false;
    element.ariaLabel = "Row 1, Column 1, empty";

    document.body.appendChild(element);

    const button = element.shadowRoot.querySelector("button");
    expect(button).toBeTruthy();
    expect(button.textContent).toBe("");
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-label")).toBe("Row 1, Column 1, empty");
    expect(button.classList.contains("cell")).toBe(true);
    expect(button.classList.contains("winning-cell")).toBe(false);
  });

  it("renders cell with value", () => {
    const element = createElement("c-tic-tac-toe-cell", {
      is: TicTacToeCell
    });
    element.value = "X";
    element.index = 4;
    element.disabled = true;
    element.isWinningCell = false;
    element.ariaLabel = "Row 2, Column 2, marked by player X";

    document.body.appendChild(element);

    const button = element.shadowRoot.querySelector("button");
    expect(button.textContent).toBe("X");
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-label")).toBe(
      "Row 2, Column 2, marked by player X"
    );
  });

  it("renders winning cell", () => {
    const element = createElement("c-tic-tac-toe-cell", {
      is: TicTacToeCell
    });
    element.value = "O";
    element.index = 8;
    element.disabled = true;
    element.isWinningCell = true;
    element.ariaLabel = "Row 3, Column 3, marked by player O";

    document.body.appendChild(element);

    const button = element.shadowRoot.querySelector("button");
    expect(button.classList.contains("winning-cell")).toBe(true);
  });

  it("dispatches cellclick event when clicked", () => {
    const element = createElement("c-tic-tac-toe-cell", {
      is: TicTacToeCell
    });
    element.value = "";
    element.index = 3;
    element.disabled = false;

    document.body.appendChild(element);

    const handler = jest.fn();
    element.addEventListener("cellclick", handler);

    const button = element.shadowRoot.querySelector("button");
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.index).toBe(3);
  });

  it("does not dispatch event when disabled", () => {
    const element = createElement("c-tic-tac-toe-cell", {
      is: TicTacToeCell
    });
    element.value = "X";
    element.index = 1;
    element.disabled = true;

    document.body.appendChild(element);

    const handler = jest.fn();
    element.addEventListener("cellclick", handler);

    const button = element.shadowRoot.querySelector("button");
    button.click();

    expect(handler).not.toHaveBeenCalled();
  });
});
