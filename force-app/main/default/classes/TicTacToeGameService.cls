/**
 * @description Service class for managing Tic Tac Toe game sessions
 * @author Austin Barthel
 * @date 2024
 */
public with sharing class TicTacToeGameService {
  /**
   * @description Data transfer object for game session information
   */
  public class GameSessionDTO {
    @AuraEnabled
    public String sessionId { get; set; }
    @AuraEnabled
    public String playerXId { get; set; }
    @AuraEnabled
    public String playerOId { get; set; }
    @AuraEnabled
    public String playerXName { get; set; }
    @AuraEnabled
    public String playerOName { get; set; }
    @AuraEnabled
    public String currentPlayer { get; set; }
    @AuraEnabled
    public String gameStatus { get; set; }
    @AuraEnabled
    public List<String> boardState { get; set; }
    @AuraEnabled
    public String winnerId { get; set; }
    @AuraEnabled
    public String winnerName { get; set; }
    @AuraEnabled
    public Boolean isDraw { get; set; }
    @AuraEnabled
    public List<Integer> winningLine { get; set; }
    @AuraEnabled
    public DateTime lastMoveTime { get; set; }
    @AuraEnabled
    public Boolean isMyTurn { get; set; }
    @AuraEnabled
    public String mySymbol { get; set; }

    public GameSessionDTO() {
      this.boardState = new List<String>{ '', '', '', '', '', '', '', '', '' };
      this.winningLine = new List<Integer>();
      this.isDraw = false;
      this.isMyTurn = false;
    }
  }

  /**
   * @description Creates a new game session between two players
   * @param opponentId The ID of the opponent user
   * @return GameSessionDTO of the created session
   */
  @AuraEnabled
  public static GameSessionDTO createGameSession(String opponentId) {
    try {
      validateCreateGameRequest(opponentId);

      Game_Session__c newSession = new Game_Session__c(
        Player_X__c = UserInfo.getUserId(),
        Player_O__c = opponentId,
        Current_Player__c = 'X',
        Game_Status__c = 'Pending',
        Board_State__c = TicTacToeGameEngine.boardStateToJson(
          new List<String>{ '', '', '', '', '', '', '', '', '' }
        ),
        Last_Move_Time__c = System.now()
      );

      insert newSession;

      // Initialize player statistics if they don't exist
      TicTacToeStatisticsService.initializePlayerStatistics(
        UserInfo.getUserId()
      );
      TicTacToeStatisticsService.initializePlayerStatistics(opponentId);

      // Publish invitation event
      TicTacToeEventService.publishInvitationEvent(
        newSession.Id,
        UserInfo.getUserId()
      );

      return getGameSession(newSession.Id);
    } catch (TicTacToeException e) {
      AuraHandledException ahe = new AuraHandledException(e.getMessage());
      ahe.setMessage(e.getMessage());
      throw ahe;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to create game session: ' + e.getMessage()
      );
    }
  }

  /**
   * @description Accepts a pending game invitation
   * @param sessionId The game session ID
   * @return Updated GameSessionDTO
   */
  @AuraEnabled
  public static GameSessionDTO acceptGameInvitation(String sessionId) {
    try {
      Game_Session__c session = getGameSessionRecord(sessionId);

      if (session.Player_O__c != UserInfo.getUserId()) {
        throw new TicTacToeException(
          'You are not authorized to accept this game invitation'
        );
      }

      if (session.Game_Status__c != 'Pending') {
        throw new TicTacToeException('This game invitation is no longer valid');
      }

      session.Game_Status__c = 'In Progress';
      session.Last_Move_Time__c = System.now();
      update session;

      // Publish game started event
      TicTacToeEventService.publishGameStartedEvent(
        sessionId,
        UserInfo.getUserId()
      );

      return getGameSession(sessionId);
    } catch (TicTacToeException e) {
      AuraHandledException ahe = new AuraHandledException(e.getMessage());
      ahe.setMessage(e.getMessage());
      throw ahe;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to accept game invitation: ' + e.getMessage()
      );
    }
  }

  /**
   * @description Makes a move in the game
   * @param sessionId The game session ID
   * @param cellPosition The cell position (0-8)
   * @return Updated GameSessionDTO
   */
  @AuraEnabled
  public static GameSessionDTO makeMove(
    String sessionId,
    Integer cellPosition
  ) {
    try {
      Game_Session__c session = getGameSessionRecord(sessionId);
      validateMoveRequest(session, cellPosition);

      List<String> currentBoard = TicTacToeGameEngine.jsonToBoardState(
        session.Board_State__c
      );
      String playerSymbol = getCurrentPlayerSymbol(session);

      // Make the move
      List<String> newBoard = TicTacToeGameEngine.makeMove(
        currentBoard,
        cellPosition,
        playerSymbol
      );
      TicTacToeGameEngine.GameStateResult gameState = TicTacToeGameEngine.checkGameState(
        newBoard
      );

      // Create move record
      Game_Move__c move = new Game_Move__c(
        Game_Session__c = session.Id,
        Player__c = UserInfo.getUserId(),
        Cell_Position__c = cellPosition,
        Player_Symbol__c = playerSymbol,
        Move_Number__c = getMoveCount(session.Id) + 1
      );
      insert move;

      // Update session
      session.Board_State__c = TicTacToeGameEngine.boardStateToJson(newBoard);
      session.Last_Move_Time__c = System.now();

      if (gameState.isGameOver) {
        session.Game_Status__c = 'Completed';

        if (gameState.isDraw) {
          session.Is_Draw__c = true;
        } else {
          session.Winner__c = UserInfo.getUserId();
          session.Winning_Line__c = JSON.serialize(gameState.winningLine);
        }

        // Update statistics
        updatePlayerStatistics(session, gameState);
      } else {
        session.Current_Player__c = TicTacToeGameEngine.getNextPlayer(
          session.Current_Player__c
        );
      }

      update session;

      // Publish appropriate event
      if (gameState.isGameOver) {
        TicTacToeEventService.publishGameCompletedEvent(
          sessionId,
          UserInfo.getUserId(),
          cellPosition
        );
      } else {
        TicTacToeEventService.publishMoveEvent(
          sessionId,
          UserInfo.getUserId(),
          cellPosition
        );
      }

      return getGameSession(sessionId);
    } catch (TicTacToeException e) {
      AuraHandledException ahe = new AuraHandledException(e.getMessage());
      ahe.setMessage(e.getMessage());
      throw ahe;
    } catch (Exception e) {
      throw new AuraHandledException('Failed to make move: ' + e.getMessage());
    }
  }

  /**
   * @description Gets a game session by ID
   * @param sessionId The game session ID
   * @return GameSessionDTO
   */
  @AuraEnabled(cacheable=true)
  public static GameSessionDTO getGameSession(String sessionId) {
    try {
      Game_Session__c session = getGameSessionRecord(sessionId);
      return convertToDTO(session);
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to get game session: ' + e.getMessage()
      );
    }
  }

  /**
   * @description Gets all active games for current user
   * @return List of GameSessionDTO
   */
  @AuraEnabled(cacheable=true)
  public static List<GameSessionDTO> getMyActiveGames() {
    try {
      List<Game_Session__c> sessions = [
        SELECT
          Id,
          Name,
          Player_X__c,
          Player_O__c,
          Player_X__r.Name,
          Player_O__r.Name,
          Current_Player__c,
          Game_Status__c,
          Board_State__c,
          Winner__c,
          Winner__r.Name,
          Is_Draw__c,
          Winning_Line__c,
          Last_Move_Time__c
        FROM Game_Session__c
        WHERE
          (Player_X__c = :UserInfo.getUserId()
          OR Player_O__c = :UserInfo.getUserId())
          AND Game_Status__c IN ('Pending', 'In Progress')
        ORDER BY Last_Move_Time__c DESC
        LIMIT 50
      ];

      List<GameSessionDTO> result = new List<GameSessionDTO>();
      for (Game_Session__c session : sessions) {
        result.add(convertToDTO(session));
      }

      return result;
    } catch (Exception e) {
      throw new AuraHandledException(
        'Failed to get active games: ' + e.getMessage()
      );
    }
  }

  // Private helper methods

  private static void validateCreateGameRequest(String opponentId) {
    if (String.isBlank(opponentId)) {
      throw new TicTacToeException('Opponent ID is required');
    }

    if (opponentId == UserInfo.getUserId()) {
      throw new TicTacToeException('You cannot play against yourself');
    }

    // Check if there's already an active game between these players
    List<Game_Session__c> existingSessions = [
      SELECT Id
      FROM Game_Session__c
      WHERE
        ((Player_X__c = :UserInfo.getUserId()
        AND Player_O__c = :opponentId)
        OR (Player_X__c = :opponentId
        AND Player_O__c = :UserInfo.getUserId()))
        AND Game_Status__c IN ('Pending', 'In Progress')
      LIMIT 1
    ];

    if (!existingSessions.isEmpty()) {
      throw new TicTacToeException(
        'You already have an active game with this player'
      );
    }
  }

  private static void validateMoveRequest(
    Game_Session__c session,
    Integer cellPosition
  ) {
    if (session.Game_Status__c != 'In Progress') {
      throw new TicTacToeException('Game is not in progress');
    }

    String currentUserId = UserInfo.getUserId();
    if (
      (session.Current_Player__c == 'X' &&
      session.Player_X__c != currentUserId) ||
      (session.Current_Player__c == 'O' &&
      session.Player_O__c != currentUserId)
    ) {
      throw new TicTacToeException('It is not your turn');
    }

    List<String> boardState = TicTacToeGameEngine.jsonToBoardState(
      session.Board_State__c
    );
    if (!TicTacToeGameEngine.isValidMove(boardState, cellPosition)) {
      throw new TicTacToeException('Invalid move');
    }
  }

  private static String getCurrentPlayerSymbol(Game_Session__c session) {
    return (session.Current_Player__c == 'X' &&
      session.Player_X__c == UserInfo.getUserId()) ||
      (session.Current_Player__c == 'O' &&
      session.Player_O__c == UserInfo.getUserId())
      ? session.Current_Player__c
      : null;
  }

  private static Integer getMoveCount(String sessionId) {
    return [
      SELECT COUNT()
      FROM Game_Move__c
      WHERE Game_Session__c = :sessionId
    ];
  }

  private static void updatePlayerStatistics(
    Game_Session__c session,
    TicTacToeGameEngine.GameStateResult gameState
  ) {
    if (gameState.isDraw) {
      TicTacToeStatisticsService.incrementDraws(session.Player_X__c);
      TicTacToeStatisticsService.incrementDraws(session.Player_O__c);
    } else {
      String winnerId = session.Winner__c;
      String loserId = winnerId == session.Player_X__c
        ? session.Player_O__c
        : session.Player_X__c;

      TicTacToeStatisticsService.incrementWins(winnerId);
      TicTacToeStatisticsService.incrementLosses(loserId);
    }
  }

  private static Game_Session__c getGameSessionRecord(String sessionId) {
    List<Game_Session__c> sessions = [
      SELECT
        Id,
        Name,
        Player_X__c,
        Player_O__c,
        Player_X__r.Name,
        Player_O__r.Name,
        Current_Player__c,
        Game_Status__c,
        Board_State__c,
        Winner__c,
        Winner__r.Name,
        Is_Draw__c,
        Winning_Line__c,
        Last_Move_Time__c
      FROM Game_Session__c
      WHERE Id = :sessionId
      LIMIT 1
    ];

    if (sessions.isEmpty()) {
      throw new TicTacToeException('Game session not found');
    }

    return sessions[0];
  }

  private static GameSessionDTO convertToDTO(Game_Session__c session) {
    GameSessionDTO dto = new GameSessionDTO();

    dto.sessionId = session.Id;
    dto.playerXId = session.Player_X__c;
    dto.playerOId = session.Player_O__c;
    dto.playerXName = session.Player_X__r?.Name;
    dto.playerOName = session.Player_O__r?.Name;
    dto.currentPlayer = session.Current_Player__c;
    dto.gameStatus = session.Game_Status__c;
    dto.boardState = TicTacToeGameEngine.jsonToBoardState(
      session.Board_State__c
    );
    dto.winnerId = session.Winner__c;
    dto.winnerName = session.Winner__r?.Name;
    dto.isDraw = session.Is_Draw__c;
    dto.lastMoveTime = session.Last_Move_Time__c;

    if (String.isNotBlank(session.Winning_Line__c)) {
      dto.winningLine = (List<Integer>) JSON.deserialize(
        session.Winning_Line__c,
        List<Integer>.class
      );
    }

    // Determine if it's current user's turn and their symbol
    String currentUserId = UserInfo.getUserId();
    if (session.Player_X__c == currentUserId) {
      dto.mySymbol = 'X';
      dto.isMyTurn = (session.Current_Player__c == 'X' &&
      session.Game_Status__c == 'In Progress');
    } else if (session.Player_O__c == currentUserId) {
      dto.mySymbol = 'O';
      dto.isMyTurn = (session.Current_Player__c == 'O' &&
      session.Game_Status__c == 'In Progress');
    }

    return dto;
  }
}
