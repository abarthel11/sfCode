import { LightningElement, api, wire } from 'lwc';
import getPlayerStatistics from '@salesforce/apex/TicTacToeStatisticsService.getPlayerStatistics';
import USER_ID from '@salesforce/user/Id';

export default class TicTacToePlayerStats extends LightningElement {
  @api playerId;
  
  playerStats;
  isLoading = false;
  error;

  // Use current user if no playerId provided
  get effectivePlayerId() {
    return this.playerId || USER_ID;
  }

  @wire(getPlayerStatistics, { playerId: '$effectivePlayerId' })
  wiredPlayerStats(result) {
    this.isLoading = result.pending;
    
    if (result.data) {
      this.playerStats = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error.body?.message || 'Failed to load statistics';
      this.playerStats = undefined;
    }
  }

  // Computed properties
  get formattedWinPercentage() {
    if (!this.playerStats || this.playerStats.totalGames === 0) {
      return '0%';
    }
    return `${this.playerStats.winPercentage.toFixed(1)}%`;
  }

  get progressBarVariant() {
    if (!this.playerStats) return 'base';
    
    const winRate = this.playerStats.winPercentage;
    if (winRate >= 70) return 'success';
    if (winRate >= 50) return 'warning';
    return 'error';
  }

  get showProgressBar() {
    return this.playerStats && this.playerStats.totalGames > 0;
  }

  get showNoDataMessage() {
    return this.playerStats && this.playerStats.totalGames === 0;
  }
}