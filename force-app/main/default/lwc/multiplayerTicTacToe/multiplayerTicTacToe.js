import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import getGameSession from '@salesforce/apex/TicTacToeGameService.getGameSession';
import makeMove from '@salesforce/apex/TicTacToeGameService.makeMove';
import acceptGameInvitation from '@salesforce/apex/TicTacToeGameService.acceptGameInvitation';
import USER_ID from '@salesforce/user/Id';

export default class MultiplayerTicTacToe extends LightningElement {
  @api sessionId;
  @track gameSession;
  @track isLoading = false;
  @track isProcessing = false;
  @track error;
  
  currentUserId = USER_ID;
  subscription = {};
  channelName = '/event/Game_Move_Event__e';

  // Wired methods
  @wire(getGameSession, { sessionId: '$sessionId' })
  wiredGameSession(result) {
    this.wiredGameSessionResult = result;
    if (result.data) {
      this.gameSession = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error.body?.message || 'Failed to load game session';
      this.gameSession = undefined;
    }
  }

  connectedCallback() {
    this.subscribeToEvents();
    this.handleErrors();
  }

  disconnectedCallback() {
    this.unsubscribeFromEvents();
  }

  // Event subscription methods
  subscribeToEvents() {
    const messageCallback = (response) => {
      this.handleGameEvent(response.data.payload);
    };

    subscribe(this.channelName, -1, messageCallback).then(response => {
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
    onError(error => {
      console.error('EMP API error: ', error);
    });
  }

  handleGameEvent(payload) {
    // Only refresh if this event is for our game session
    if (payload.Game_Session_Id__c === this.sessionId) {
      // Refresh the game session data
      refreshApex(this.wiredGameSessionResult);
      
      // Show notification based on event type
      this.showEventNotification(payload);
    }
  }

  showEventNotification(payload) {
    const eventType = payload.Event_Type__c;
    const isMyMove = payload.Player_Id__c === this.currentUserId;
    
    if (eventType === 'MOVE_MADE' && !isMyMove) {
      this.showToast('Info', 'Your opponent made a move!', 'info');
    } else if (eventType === 'GAME_COMPLETED' && !isMyMove) {
      this.showToast('Info', 'Game completed!', 'info');
    } else if (eventType === 'GAME_STARTED' && !isMyMove) {
      this.showToast('Success', 'Game started! Your turn.', 'success');
    }
  }

  // Computed properties
  get isPlayerXTurn() {
    return this.gameSession?.currentPlayer === 'X' && 
           this.gameSession?.gameStatus === 'In Progress';
  }

  get isPlayerOTurn() {
    return this.gameSession?.currentPlayer === 'O' && 
           this.gameSession?.gameStatus === 'In Progress';
  }

  get displayCurrentPlayer() {
    if (!this.gameSession || this.gameSession.gameStatus !== 'In Progress') {
      return '';
    }
    
    if (this.gameSession.isMyTurn) {
      return 'Your turn';
    }
    
    const opponentName = this.gameSession.mySymbol === 'X' 
      ? this.gameSession.playerOName 
      : this.gameSession.playerXName;
    
    return `${opponentName}'s turn`;
  }

  get isBoardDisabled() {
    return !this.gameSession?.isMyTurn || 
           this.gameSession?.gameStatus !== 'In Progress' || 
           this.isProcessing;
  }

  get showAcceptButton() {
    return this.gameSession?.gameStatus === 'Pending' && 
           this.gameSession?.playerOId === this.currentUserId;
  }

  get showNewGameButton() {
    return this.gameSession?.gameStatus === 'Completed';
  }

  // Event handlers
  async handleCellClick(event) {
    const cellIndex = event.detail.index;
    
    if (this.isBoardDisabled) {
      return;
    }

    this.isProcessing = true;
    
    try {
      await makeMove({ 
        sessionId: this.sessionId, 
        cellPosition: cellIndex 
      });
      
      // Refresh the game session data
      await refreshApex(this.wiredGameSessionResult);
      
    } catch (error) {
      this.showToast('Error', error.body?.message || 'Failed to make move', 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  async handleAcceptInvitation() {
    this.isProcessing = true;
    
    try {
      await acceptGameInvitation({ sessionId: this.sessionId });
      
      // Refresh the game session data
      await refreshApex(this.wiredGameSessionResult);
      
      this.showToast('Success', 'Game started! Good luck!', 'success');
      
    } catch (error) {
      this.showToast('Error', error.body?.message || 'Failed to accept invitation', 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  handleNewGame() {
    // Navigate to lobby to start a new game
    this.dispatchEvent(new CustomEvent('newgame', {
      detail: { 
        opponentId: this.gameSession?.mySymbol === 'X' 
          ? this.gameSession?.playerOId 
          : this.gameSession?.playerXId 
      }
    }));
  }

  handleBackToLobby() {
    this.dispatchEvent(new CustomEvent('backtolobby'));
  }

  // Utility methods
  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({
      title,
      message,
      variant
    }));
  }

  // Public methods for parent components
  @api
  async refreshGameSession() {
    if (this.wiredGameSessionResult) {
      await refreshApex(this.wiredGameSessionResult);
    }
  }

  @api
  async loadGameSession(sessionId) {
    this.sessionId = sessionId;
    if (this.wiredGameSessionResult) {
      await refreshApex(this.wiredGameSessionResult);
    }
  }
}