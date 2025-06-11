import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { subscribe, unsubscribe, onError } from "lightning/empApi";
import getMyActiveGames from "@salesforce/apex/TicTacToeGameService.getMyActiveGames";
import createGameSession from "@salesforce/apex/TicTacToeGameService.createGameSession";
import searchUsers from "@salesforce/apex/TicTacToeUserSearchService.searchUsers";
import USER_ID from "@salesforce/user/Id";

export default class TicTacToeLobby extends LightningElement {
  @track activeGames = [];
  @track searchResults = [];
  @track selectedOpponent;
  @track searchTerm = "";
  @track isLoading = false;
  @track isCreatingGame = false;
  @track error;

  currentUserId = USER_ID;
  subscription = {};
  channelName = "/event/Game_Move_Event__e";
  searchTimeout;

  // Wired methods
  @wire(getMyActiveGames)
  wiredActiveGames(result) {
    this.wiredActiveGamesResult = result;
    if (result.data) {
      this.activeGames = this.transformGameData(result.data);
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error.body?.message || "Failed to load active games";
      this.activeGames = [];
    }
  }

  connectedCallback() {
    this.subscribeToEvents();
    this.handleErrors();
  }

  disconnectedCallback() {
    this.unsubscribeFromEvents();
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // Event subscription methods
  subscribeToEvents() {
    const messageCallback = (response) => {
      this.handleGameEvent(response.data.payload);
    };

    subscribe(this.channelName, -1, messageCallback).then((response) => {
      this.subscription = response;
    });
  }

  unsubscribeFromEvents() {
    if (this.subscription) {
      unsubscribe(this.subscription, () => {
        this.subscription = {};
      });
    }
  }

  handleErrors() {
    onError((error) => {
      console.error("EMP API error: ", error);
    });
  }

  handleGameEvent(payload) {
    // Refresh active games when events occur
    const eventType = payload.Event_Type__c;
    if (
      [
        "INVITATION_SENT",
        "GAME_STARTED",
        "GAME_COMPLETED",
        "MOVE_MADE"
      ].includes(eventType)
    ) {
      refreshApex(this.wiredActiveGamesResult);

      // Show toast notification for invitations received
      if (
        eventType === "INVITATION_SENT" &&
        payload.Player_Id__c !== this.currentUserId
      ) {
        this.showToast("Info", "You received a new game invitation!", "info");
      }
    }
  }

  // Computed properties
  get hasActiveGames() {
    return this.activeGames && this.activeGames.length > 0;
  }

  get showSearchResults() {
    return this.searchResults.length > 0 || this.noSearchResults;
  }

  get noSearchResults() {
    return this.searchTerm.length > 2 && this.searchResults.length === 0;
  }

  // Data transformation methods
  transformGameData(games) {
    return games.map((game) => {
      const opponentName =
        game.mySymbol === "X" ? game.playerOName : game.playerXName;

      return {
        ...game,
        opponentName,
        statusVariant: this.getStatusVariant(game.gameStatus),
        isPendingInvitation:
          game.gameStatus === "Pending" && game.playerOId === this.currentUserId
      };
    });
  }

  getStatusVariant(status) {
    switch (status) {
      case "Pending":
        return "warning";
      case "In Progress":
        return "success";
      case "Completed":
        return "inverse";
      default:
        return "neutral";
    }
  }

  // Search methods
  handleSearchChange(event) {
    this.searchTerm = event.target.value;

    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce search
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  async performSearch() {
    if (this.searchTerm.length < 3) {
      this.searchResults = [];
      return;
    }

    try {
      const results = await searchUsers({ searchTerm: this.searchTerm });
      // Filter out current user
      this.searchResults = results.filter(
        (user) => user.Id !== this.currentUserId
      );
    } catch (error) {
      console.error("Search error:", error);
      this.searchResults = [];
    }
  }

  handleSelectOpponent(event) {
    const userId = event.currentTarget.dataset.userId;
    const user = this.searchResults.find((u) => u.Id === userId);

    if (user) {
      this.selectedOpponent = user;
      this.searchTerm = "";
      this.searchResults = [];
    }
  }

  handleRemoveOpponent() {
    this.selectedOpponent = null;
  }

  // Game creation methods
  async handleCreateGame() {
    if (!this.selectedOpponent) {
      this.showToast("Warning", "Please select an opponent first", "warning");
      return;
    }

    this.isCreatingGame = true;

    try {
      const gameSession = await createGameSession({
        opponentId: this.selectedOpponent.Id
      });

      this.showToast(
        "Success",
        `Game invitation sent to ${this.selectedOpponent.Name}!`,
        "success"
      );

      // Clear selection
      this.selectedOpponent = null;

      // Refresh active games
      await refreshApex(this.wiredActiveGamesResult);

      // Navigate to the new game
      this.dispatchEvent(
        new CustomEvent("playgame", {
          detail: { sessionId: gameSession.sessionId }
        })
      );
    } catch (error) {
      this.showToast(
        "Error",
        error.body?.message || "Failed to create game",
        "error"
      );
    } finally {
      this.isCreatingGame = false;
    }
  }

  // Navigation methods
  handlePlayGame(event) {
    const sessionId = event.currentTarget.dataset.sessionId;
    this.dispatchEvent(
      new CustomEvent("playgame", {
        detail: { sessionId }
      })
    );
  }

  async handleRefreshGames() {
    await refreshApex(this.wiredActiveGamesResult);
    this.showToast("Success", "Games refreshed", "success");
  }

  // Utility methods
  showToast(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({
        title,
        message,
        variant
      })
    );
  }
}
