import { LightningElement, api } from "lwc";

export default class TicTacToeCell extends LightningElement {
  @api value = "";
  @api index;
  @api disabled = false;
  @api isWinningCell = false;
  @api ariaLabel = "";

  get cellClass() {
    return this.isWinningCell ? "cell winning-cell" : "cell";
  }

  handleClick() {
    if (!this.disabled) {
      const cellClickEvent = new CustomEvent("cellclick", {
        detail: { index: this.index }
      });
      this.dispatchEvent(cellClickEvent);
    }
  }
}
