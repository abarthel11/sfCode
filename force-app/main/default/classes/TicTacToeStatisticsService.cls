/**
 * @description Service class for managing player statistics
 * @author Austin Barthel
 * @date 2024
 */
public with sharing class TicTacToeStatisticsService {
  /**
   * @description Data transfer object for player statistics
   */
  public class PlayerStatsDTO {
    @AuraEnabled
    public String playerId { get; set; }
    @AuraEnabled
    public String playerName { get; set; }
    @AuraEnabled
    public Integer totalWins { get; set; }
    @AuraEnabled
    public Integer totalLosses { get; set; }
    @AuraEnabled
    public Integer totalDraws { get; set; }
    @AuraEnabled
    public Integer totalGames { get; set; }
    @AuraEnabled
    public Decimal winPercentage { get; set; }

    public PlayerStatsDTO() {
      this.totalWins = 0;
      this.totalLosses = 0;
      this.totalDraws = 0;
      this.totalGames = 0;
      this.winPercentage = 0;
    }
  }

  /**
   * @description Gets statistics for a specific player
   * @param playerId The player's user ID
   * @return PlayerStatsDTO
   */
  @AuraEnabled(cacheable=true)
  public static PlayerStatsDTO getPlayerStatistics(String playerId) {
    try {
      if (String.isBlank(playerId)) {
        playerId = UserInfo.getUserId();
      }

      List<Player_Statistics__c> stats = [
        SELECT
          Player__c,
          Player__r.Name,
          Total_Wins__c,
          Total_Losses__c,
          Total_Draws__c,
          Total_Games__c,
          Win_Percentage__c
        FROM Player_Statistics__c
        WHERE Player__c = :playerId
        LIMIT 1
      ];

      if (stats.isEmpty()) {
        // Initialize statistics if they don't exist
        initializePlayerStatistics(playerId);
        User player = [SELECT Name FROM User WHERE Id = :playerId LIMIT 1];

        PlayerStatsDTO dto = new PlayerStatsDTO();
        dto.playerId = playerId;
        dto.playerName = player.Name;
        return dto;
      }

      return convertStatsToDTO(stats[0]);
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to get player statistics: ' + e.getMessage()
      );
    }
  }

  /**
   * @description Gets leaderboard statistics for all players
   * @param limitCount Number of top players to return
   * @return List of PlayerStatsDTO ordered by wins
   */
  @AuraEnabled(cacheable=true)
  public static List<PlayerStatsDTO> getLeaderboard(Integer limitCount) {
    try {
      if (limitCount == null || limitCount <= 0) {
        limitCount = 10;
      }

      List<Player_Statistics__c> stats = [
        SELECT
          Player__c,
          Player__r.Name,
          Total_Wins__c,
          Total_Losses__c,
          Total_Draws__c,
          Total_Games__c,
          Win_Percentage__c
        FROM Player_Statistics__c
        WHERE Total_Games__c > 0
        ORDER BY Total_Wins__c DESC, Win_Percentage__c DESC
        LIMIT :limitCount
      ];

      List<PlayerStatsDTO> result = new List<PlayerStatsDTO>();
      for (Player_Statistics__c stat : stats) {
        result.add(convertStatsToDTO(stat));
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to get leaderboard: ' + e.getMessage()
      );
    }
  }

  /**
   * @description Initializes player statistics record if it doesn't exist
   * @param playerId The player's user ID
   */
  public static void initializePlayerStatistics(String playerId) {
    if (String.isBlank(playerId)) {
      return;
    }

    List<Player_Statistics__c> existing = [
      SELECT Id
      FROM Player_Statistics__c
      WHERE Player__c = :playerId
      LIMIT 1
    ];

    if (existing.isEmpty()) {
      try {
        Player_Statistics__c newStats = new Player_Statistics__c(
          Player__c = playerId,
          Name = 'Stats for ' + playerId,
          Total_Wins__c = 0,
          Total_Losses__c = 0,
          Total_Draws__c = 0
        );
        insert newStats;
      } catch (DmlException e) {
        // Handle potential duplicate insertion in concurrent scenarios
        System.debug('Statistics record may already exist: ' + e.getMessage());
      }
    }
  }

  /**
   * @description Increments win count for a player
   * @param playerId The player's user ID
   */
  public static void incrementWins(String playerId) {
    updateStatistics(playerId, 'wins');
  }

  /**
   * @description Increments loss count for a player
   * @param playerId The player's user ID
   */
  public static void incrementLosses(String playerId) {
    updateStatistics(playerId, 'losses');
  }

  /**
   * @description Increments draw count for a player
   * @param playerId The player's user ID
   */
  public static void incrementDraws(String playerId) {
    updateStatistics(playerId, 'draws');
  }

  // Private helper methods

  private static void updateStatistics(String playerId, String statType) {
    if (String.isBlank(playerId)) {
      return;
    }

    initializePlayerStatistics(playerId);

    List<Player_Statistics__c> stats = [
      SELECT Id, Total_Wins__c, Total_Losses__c, Total_Draws__c
      FROM Player_Statistics__c
      WHERE Player__c = :playerId
      LIMIT 1
      FOR UPDATE
    ];

    if (!stats.isEmpty()) {
      Player_Statistics__c stat = stats[0];

      if (statType == 'wins') {
        stat.Total_Wins__c = (stat.Total_Wins__c ?? 0) + 1;
      } else if (statType == 'losses') {
        stat.Total_Losses__c = (stat.Total_Losses__c ?? 0) + 1;
      } else if (statType == 'draws') {
        stat.Total_Draws__c = (stat.Total_Draws__c ?? 0) + 1;
      }

      try {
        update stat;
      } catch (DmlException e) {
        System.debug('Failed to update statistics: ' + e.getMessage());
        throw new TicTacToeException('Failed to update player statistics');
      }
    }
  }

  private static PlayerStatsDTO convertStatsToDTO(Player_Statistics__c stat) {
    PlayerStatsDTO dto = new PlayerStatsDTO();

    dto.playerId = stat.Player__c;
    dto.playerName = stat.Player__r?.Name;
    dto.totalWins = Integer.valueOf(stat.Total_Wins__c ?? 0);
    dto.totalLosses = Integer.valueOf(stat.Total_Losses__c ?? 0);
    dto.totalDraws = Integer.valueOf(stat.Total_Draws__c ?? 0);
    dto.totalGames = Integer.valueOf(stat.Total_Games__c ?? 0);
    dto.winPercentage = stat.Win_Percentage__c ?? 0;

    return dto;
  }
}
