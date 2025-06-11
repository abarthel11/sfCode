import { LightningElement, api, wire } from "lwc";
import getLeaderboard from "@salesforce/apex/TicTacToeStatisticsService.getLeaderboard";

export default class TicTacToeLeaderboard extends LightningElement {
  @api limit = 10;

  leaderboardData = [];
  isLoading = false;
  error;

  @wire(getLeaderboard, { limitCount: "$limit" })
  wiredLeaderboard(result) {
    this.isLoading = result.pending;

    if (result.data) {
      this.leaderboardData = this.transformLeaderboardData(result.data);
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error.body?.message || "Failed to load leaderboard";
      this.leaderboardData = [];
    }
  }

  // Data transformation
  transformLeaderboardData(data) {
    return data.map((player, index) => {
      const rank = index + 1;

      return {
        ...player,
        rank,
        formattedWinPercentage: this.formatWinPercentage(player.winPercentage),
        showMedal: rank <= 3,
        medalIcon: this.getMedalIcon(rank),
        medalClass: this.getMedalClass(rank)
      };
    });
  }

  formatWinPercentage(percentage) {
    if (!percentage && percentage !== 0) return "0%";
    return `${percentage.toFixed(1)}%`;
  }

  getMedalIcon(rank) {
    switch (rank) {
      case 1:
        return "utility:trophy";
      case 2:
        return "utility:medal";
      case 3:
        return "utility:ribbon";
      default:
        return "";
    }
  }

  getMedalClass(rank) {
    switch (rank) {
      case 1:
        return "medal-gold";
      case 2:
        return "medal-silver";
      case 3:
        return "medal-bronze";
      default:
        return "";
    }
  }

  // Computed properties
  get hasLeaderboardData() {
    return this.leaderboardData && this.leaderboardData.length > 0;
  }

  get showNoDataMessage() {
    return (
      !this.isLoading &&
      !this.error &&
      (!this.leaderboardData || this.leaderboardData.length === 0)
    );
  }
}
