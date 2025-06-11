import { LightningElement, api } from "lwc";

export default class TicTacToeBoard extends LightningElement {
  @api board = [];
  @api winningLine = [];
  @api isGameOver = false;

  get cells() {
    return this.board.map((value, index) => {
      const isWinningCell = this.winningLine.includes(index);
      return {
        key: `cell-${index}`,
        value: value,
        index: index,
        disabled: value !== "" || this.isGameOver,
        isWinningCell: isWinningCell,
        ariaLabel: this.getCellAriaLabel(index, value)
      };
    });
  }

  getCellAriaLabel(index, value) {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const position = `Row ${row}, Column ${col}`;

    if (value) {
      return `${position}, marked by player ${value}`;
    }
    return `${position}, empty`;
  }

  handleCellClick(event) {
    const cellClickEvent = new CustomEvent("cellclick", {
      detail: { index: event.detail.index },
      bubbles: true
    });
    this.dispatchEvent(cellClickEvent);
  }
}
