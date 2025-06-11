import { LightningElement, api } from "lwc";

export default class TicTacToeScoreboard extends LightningElement {
  @api playerXWins = 0;
  @api playerOWins = 0;
  @api draws = 0;
}
