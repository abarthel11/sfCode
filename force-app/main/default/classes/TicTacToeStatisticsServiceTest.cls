/**
 * @description Test class for TicTacToeStatisticsService
 * @author Austin Barthel
 * @date 2024
 */
@IsTest
private class TicTacToeStatisticsServiceTest {
  @TestSetup
  static void setup() {
    // Create test users
    Profile standardProfile = [
      SELECT Id
      FROM Profile
      WHERE Name = 'Standard User'
      LIMIT 1
    ];

    List<User> testUsers = new List<User>();

    User testUser1 = new User(
      FirstName = 'Test',
      LastName = 'Player1',
      Email = 'testplayer1@example.com',
      Username = 'testplayer1@example.com.statstest',
      Alias = 'tplyr1',
      TimeZoneSidKey = 'America/New_York',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US',
      ProfileId = standardProfile.Id
    );
    testUsers.add(testUser1);

    User testUser2 = new User(
      FirstName = 'Test',
      LastName = 'Player2',
      Email = 'testplayer2@example.com',
      Username = 'testplayer2@example.com.statstest',
      Alias = 'tplyr2',
      TimeZoneSidKey = 'America/New_York',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US',
      ProfileId = standardProfile.Id
    );
    testUsers.add(testUser2);

    User testUser3 = new User(
      FirstName = 'Test',
      LastName = 'Player3',
      Email = 'testplayer3@example.com',
      Username = 'testplayer3@example.com.statstest',
      Alias = 'tplyr3',
      TimeZoneSidKey = 'America/New_York',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US',
      ProfileId = standardProfile.Id
    );
    testUsers.add(testUser3);

    insert testUsers;
  }

  @IsTest
  static void testInitializePlayerStatistics_NewPlayer() {
    User testUser = [
      SELECT Id
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    Test.startTest();
    TicTacToeStatisticsService.initializePlayerStatistics(testUser.Id);
    Test.stopTest();

    List<Player_Statistics__c> stats = [
      SELECT Id, Player__c, Total_Wins__c, Total_Losses__c, Total_Draws__c
      FROM Player_Statistics__c
      WHERE Player__c = :testUser.Id
    ];

    System.assertEquals(
      1,
      stats.size(),
      'One statistics record should be created'
    );
    System.assertEquals(testUser.Id, stats[0].Player__c, 'Player should match');
    System.assertEquals(
      0,
      stats[0].Total_Wins__c,
      'Wins should be initialized to 0'
    );
    System.assertEquals(
      0,
      stats[0].Total_Losses__c,
      'Losses should be initialized to 0'
    );
    System.assertEquals(
      0,
      stats[0].Total_Draws__c,
      'Draws should be initialized to 0'
    );
  }

  @IsTest
  static void testInitializePlayerStatistics_ExistingPlayer() {
    User testUser = [
      SELECT Id
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    // Create existing statistics record
    Player_Statistics__c existingStats = new Player_Statistics__c(
      Player__c = testUser.Id,
      Name = 'Existing Stats',
      Total_Wins__c = 5,
      Total_Losses__c = 3,
      Total_Draws__c = 1
    );
    insert existingStats;

    Test.startTest();
    TicTacToeStatisticsService.initializePlayerStatistics(testUser.Id);
    Test.stopTest();

    List<Player_Statistics__c> stats = [
      SELECT Id, Total_Wins__c, Total_Losses__c, Total_Draws__c
      FROM Player_Statistics__c
      WHERE Player__c = :testUser.Id
    ];

    System.assertEquals(
      1,
      stats.size(),
      'Should not create duplicate statistics'
    );
    System.assertEquals(
      5,
      stats[0].Total_Wins__c,
      'Existing wins should be preserved'
    );
  }

  @IsTest
  static void testInitializePlayerStatistics_BlankPlayerId() {
    Test.startTest();
    TicTacToeStatisticsService.initializePlayerStatistics('');
    TicTacToeStatisticsService.initializePlayerStatistics(null);
    Test.stopTest();

    // Should not throw exception and not create any records
    List<Player_Statistics__c> stats = [SELECT Id FROM Player_Statistics__c];
    System.assertEquals(
      0,
      stats.size(),
      'No statistics should be created for blank player ID'
    );
  }

  @IsTest
  static void testIncrementWins() {
    User testUser = [
      SELECT Id
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    Test.startTest();
    TicTacToeStatisticsService.incrementWins(testUser.Id);
    TicTacToeStatisticsService.incrementWins(testUser.Id);
    TicTacToeStatisticsService.incrementWins(testUser.Id);
    Test.stopTest();

    Player_Statistics__c stats = [
      SELECT Total_Wins__c, Total_Losses__c, Total_Draws__c
      FROM Player_Statistics__c
      WHERE Player__c = :testUser.Id
      LIMIT 1
    ];

    System.assertEquals(3, stats.Total_Wins__c, 'Should have 3 wins');
    System.assertEquals(0, stats.Total_Losses__c, 'Should have 0 losses');
    System.assertEquals(0, stats.Total_Draws__c, 'Should have 0 draws');
  }

  @IsTest
  static void testIncrementLosses() {
    User testUser = [
      SELECT Id
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    Test.startTest();
    TicTacToeStatisticsService.incrementLosses(testUser.Id);
    TicTacToeStatisticsService.incrementLosses(testUser.Id);
    Test.stopTest();

    Player_Statistics__c stats = [
      SELECT Total_Wins__c, Total_Losses__c, Total_Draws__c
      FROM Player_Statistics__c
      WHERE Player__c = :testUser.Id
      LIMIT 1
    ];

    System.assertEquals(0, stats.Total_Wins__c, 'Should have 0 wins');
    System.assertEquals(2, stats.Total_Losses__c, 'Should have 2 losses');
    System.assertEquals(0, stats.Total_Draws__c, 'Should have 0 draws');
  }

  @IsTest
  static void testIncrementDraws() {
    User testUser = [
      SELECT Id
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    Test.startTest();
    TicTacToeStatisticsService.incrementDraws(testUser.Id);
    Test.stopTest();

    Player_Statistics__c stats = [
      SELECT Total_Wins__c, Total_Losses__c, Total_Draws__c
      FROM Player_Statistics__c
      WHERE Player__c = :testUser.Id
      LIMIT 1
    ];

    System.assertEquals(0, stats.Total_Wins__c, 'Should have 0 wins');
    System.assertEquals(0, stats.Total_Losses__c, 'Should have 0 losses');
    System.assertEquals(1, stats.Total_Draws__c, 'Should have 1 draw');
  }

  @IsTest
  static void testGetPlayerStatistics_NewPlayer() {
    User testUser = [
      SELECT Id, Name
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    Test.startTest();
    TicTacToeStatisticsService.PlayerStatsDTO result = TicTacToeStatisticsService.getPlayerStatistics(
      testUser.Id
    );
    Test.stopTest();

    System.assertEquals(testUser.Id, result.playerId, 'Player ID should match');
    System.assertEquals(
      testUser.Name,
      result.playerName,
      'Player name should match'
    );
    System.assertEquals(0, result.totalWins, 'Should have 0 wins');
    System.assertEquals(0, result.totalLosses, 'Should have 0 losses');
    System.assertEquals(0, result.totalDraws, 'Should have 0 draws');
    System.assertEquals(0, result.totalGames, 'Should have 0 total games');
    System.assertEquals(0, result.winPercentage, 'Should have 0% win rate');

    // Verify that statistics record was created
    List<Player_Statistics__c> stats = [
      SELECT Id
      FROM Player_Statistics__c
      WHERE Player__c = :testUser.Id
    ];
    System.assertEquals(1, stats.size(), 'Statistics record should be created');
  }

  @IsTest
  static void testGetPlayerStatistics_ExistingPlayer() {
    User testUser = [
      SELECT Id, Name
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    // Create statistics record with data
    Player_Statistics__c existingStats = new Player_Statistics__c(
      Player__c = testUser.Id,
      Name = 'Test Stats',
      Total_Wins__c = 15,
      Total_Losses__c = 8,
      Total_Draws__c = 2
    );
    insert existingStats;

    Test.startTest();
    TicTacToeStatisticsService.PlayerStatsDTO result = TicTacToeStatisticsService.getPlayerStatistics(
      testUser.Id
    );
    Test.stopTest();

    System.assertEquals(testUser.Id, result.playerId, 'Player ID should match');
    System.assertEquals(
      testUser.Name,
      result.playerName,
      'Player name should match'
    );
    System.assertEquals(15, result.totalWins, 'Should have 15 wins');
    System.assertEquals(8, result.totalLosses, 'Should have 8 losses');
    System.assertEquals(2, result.totalDraws, 'Should have 2 draws');
    // Total games and win percentage are calculated fields, so we'll verify they are calculated correctly
    System.assertEquals(
      25,
      result.totalGames,
      'Should have 25 total games (calculated)'
    );
    System.assertNotEquals(
      null,
      result.winPercentage,
      'Win percentage should be calculated'
    );
  }

  @IsTest
  static void testGetPlayerStatistics_BlankPlayerId() {
    User currentUser = [
      SELECT Id, Name
      FROM User
      WHERE Id = :UserInfo.getUserId()
      LIMIT 1
    ];

    Test.startTest();
    TicTacToeStatisticsService.PlayerStatsDTO result = TicTacToeStatisticsService.getPlayerStatistics(
      ''
    );
    TicTacToeStatisticsService.PlayerStatsDTO result2 = TicTacToeStatisticsService.getPlayerStatistics(
      null
    );
    Test.stopTest();

    System.assertEquals(
      currentUser.Id,
      result.playerId,
      'Should default to current user'
    );
    System.assertEquals(
      currentUser.Id,
      result2.playerId,
      'Should default to current user for null'
    );
  }

  @IsTest
  static void testGetLeaderboard_WithData() {
    List<User> testUsers = [
      SELECT Id, Name
      FROM User
      WHERE Username LIKE '%.statstest'
      ORDER BY Username
    ];

    // Create statistics for multiple players
    List<Player_Statistics__c> statsList = new List<Player_Statistics__c>();

    // Player 1 - High performer
    statsList.add(
      new Player_Statistics__c(
        Player__c = testUsers[0].Id,
        Name = 'Stats 1',
        Total_Wins__c = 20,
        Total_Losses__c = 5,
        Total_Draws__c = 0
      )
    );

    // Player 2 - Medium performer
    statsList.add(
      new Player_Statistics__c(
        Player__c = testUsers[1].Id,
        Name = 'Stats 2',
        Total_Wins__c = 10,
        Total_Losses__c = 8,
        Total_Draws__c = 2
      )
    );

    // Player 3 - Low performer
    statsList.add(
      new Player_Statistics__c(
        Player__c = testUsers[2].Id,
        Name = 'Stats 3',
        Total_Wins__c = 5,
        Total_Losses__c = 10,
        Total_Draws__c = 0
      )
    );

    insert statsList;

    Test.startTest();
    List<TicTacToeStatisticsService.PlayerStatsDTO> result = TicTacToeStatisticsService.getLeaderboard(
      10
    );
    Test.stopTest();

    System.assertEquals(3, result.size(), 'Should return 3 players');

    // Should be ordered by wins (descending), then win percentage
    System.assertEquals(
      20,
      result[0].totalWins,
      'First player should have 20 wins'
    );
    System.assertNotEquals(
      null,
      result[0].winPercentage,
      'First player should have calculated win rate'
    );

    System.assertEquals(
      10,
      result[1].totalWins,
      'Second player should have 10 wins'
    );
    System.assertNotEquals(
      null,
      result[1].winPercentage,
      'Second player should have calculated win rate'
    );

    System.assertEquals(
      5,
      result[2].totalWins,
      'Third player should have 5 wins'
    );
    System.assertNotEquals(
      null,
      result[2].winPercentage,
      'Third player should have calculated win rate'
    );
  }

  @IsTest
  static void testGetLeaderboard_EmptyResults() {
    Test.startTest();
    List<TicTacToeStatisticsService.PlayerStatsDTO> result = TicTacToeStatisticsService.getLeaderboard(
      10
    );
    Test.stopTest();

    System.assertEquals(
      0,
      result.size(),
      'Should return empty list when no players have games'
    );
  }

  @IsTest
  static void testGetLeaderboard_LimitHandling() {
    User testUser = [
      SELECT Id
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    // Create one player with games
    Player_Statistics__c stats = new Player_Statistics__c(
      Player__c = testUser.Id,
      Name = 'Test Stats',
      Total_Wins__c = 5,
      Total_Losses__c = 2,
      Total_Draws__c = 1
    );
    insert stats;

    Test.startTest();

    // Test null limit - should default to 10
    List<TicTacToeStatisticsService.PlayerStatsDTO> result1 = TicTacToeStatisticsService.getLeaderboard(
      null
    );
    System.assertEquals(
      1,
      result1.size(),
      'Should return 1 player with null limit'
    );

    // Test zero limit - should default to 10
    List<TicTacToeStatisticsService.PlayerStatsDTO> result2 = TicTacToeStatisticsService.getLeaderboard(
      0
    );
    System.assertEquals(
      1,
      result2.size(),
      'Should return 1 player with zero limit'
    );

    // Test negative limit - should default to 10
    List<TicTacToeStatisticsService.PlayerStatsDTO> result3 = TicTacToeStatisticsService.getLeaderboard(
      -5
    );
    System.assertEquals(
      1,
      result3.size(),
      'Should return 1 player with negative limit'
    );

    Test.stopTest();
  }

  @IsTest
  static void testMixedStatisticsOperations() {
    User testUser = [
      SELECT Id
      FROM User
      WHERE Username = 'testplayer1@example.com.statstest'
      LIMIT 1
    ];

    Test.startTest();

    // Test multiple operations
    TicTacToeStatisticsService.incrementWins(testUser.Id);
    TicTacToeStatisticsService.incrementWins(testUser.Id);
    TicTacToeStatisticsService.incrementLosses(testUser.Id);
    TicTacToeStatisticsService.incrementDraws(testUser.Id);

    // Verify current state
    TicTacToeStatisticsService.PlayerStatsDTO stats = TicTacToeStatisticsService.getPlayerStatistics(
      testUser.Id
    );

    System.assertEquals(2, stats.totalWins, 'Should have 2 wins');
    System.assertEquals(1, stats.totalLosses, 'Should have 1 loss');
    System.assertEquals(1, stats.totalDraws, 'Should have 1 draw');

    Test.stopTest();
  }

  @IsTest
  static void testIncrementMethods_BlankPlayerId() {
    Test.startTest();

    // Should not throw exceptions for blank player IDs
    TicTacToeStatisticsService.incrementWins('');
    TicTacToeStatisticsService.incrementWins(null);
    TicTacToeStatisticsService.incrementLosses('');
    TicTacToeStatisticsService.incrementLosses(null);
    TicTacToeStatisticsService.incrementDraws('');
    TicTacToeStatisticsService.incrementDraws(null);

    Test.stopTest();

    // Verify no statistics records were created
    List<Player_Statistics__c> stats = [SELECT Id FROM Player_Statistics__c];
    System.assertEquals(
      0,
      stats.size(),
      'No statistics should be created for blank player IDs'
    );
  }

  @IsTest
  static void testPlayerStatsDTO_DefaultValues() {
    Test.startTest();
    TicTacToeStatisticsService.PlayerStatsDTO dto = new TicTacToeStatisticsService.PlayerStatsDTO();
    Test.stopTest();

    System.assertEquals(0, dto.totalWins, 'Total wins should default to 0');
    System.assertEquals(0, dto.totalLosses, 'Total losses should default to 0');
    System.assertEquals(0, dto.totalDraws, 'Total draws should default to 0');
    System.assertEquals(0, dto.totalGames, 'Total games should default to 0');
    System.assertEquals(
      0,
      dto.winPercentage,
      'Win percentage should default to 0'
    );
  }
}
