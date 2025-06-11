import { LightningElement, track } from "lwc";

export default class TicTacToeApp extends LightningElement {
  @track currentView = "lobby"; // 'lobby' or 'game'
  @track currentGameSession;

  // Computed properties
  get showLobby() {
    return this.currentView === "lobby";
  }

  get showGame() {
    return this.currentView === "game" && this.currentGameSession;
  }

  // Navigation handlers
  handlePlayGame(event) {
    const sessionId = event.detail.sessionId;
    this.currentGameSession = sessionId;
    this.currentView = "game";
  }

  handleNewGame(event) {
    // Handle new game creation from lobby
    const opponentId = event.detail?.opponentId;
    if (opponentId) {
      // The lobby component will handle game creation
      // and then fire the playgame event
    }
  }

  handleNewGameFromGame(event) {
    // Handle new game request from game component
    const opponentId = event.detail?.opponentId;

    // Navigate back to lobby for now
    // In the future, could directly create a new game
    this.handleBackToLobby();
  }

  handleBackToLobby() {
    this.currentView = "lobby";
    this.currentGameSession = null;
  }

  handleNavigateToLobby() {
    this.handleBackToLobby();
  }
}
