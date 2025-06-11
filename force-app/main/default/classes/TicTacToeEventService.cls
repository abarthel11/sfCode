/**
 * @description Service class for managing Platform Events for real-time notifications
 * @author Austin Barthel
 * @date 2024
 */
public with sharing class TicTacToeEventService {
  /**
   * @description Publishes a game move event
   * @param sessionId The game session ID
   * @param playerId The player who made the move
   * @param cellPosition The cell position of the move
   * @param eventType The type of event (MOVE_MADE, GAME_COMPLETED, etc.)
   */
  public static void publishGameEvent(
    String sessionId,
    String playerId,
    Integer cellPosition,
    String eventType
  ) {
    if (
      String.isBlank(sessionId) ||
      String.isBlank(playerId) ||
      String.isBlank(eventType)
    ) {
      return;
    }

    Game_Move_Event__e gameEvent = new Game_Move_Event__e(
      Game_Session_Id__c = sessionId,
      Player_Id__c = playerId,
      Cell_Position__c = cellPosition,
      Event_Type__c = eventType
    );

    List<Database.SaveResult> results = EventBus.publish(
      new List<Game_Move_Event__e>{ gameEvent }
    );

    for (Database.SaveResult result : results) {
      if (!result.isSuccess()) {
        System.debug('Failed to publish game event: ' + result.getErrors());
      }
    }
  }

  /**
   * @description Publishes a move made event
   * @param sessionId The game session ID
   * @param playerId The player who made the move
   * @param cellPosition The cell position of the move
   */
  public static void publishMoveEvent(
    String sessionId,
    String playerId,
    Integer cellPosition
  ) {
    publishGameEvent(sessionId, playerId, cellPosition, 'MOVE_MADE');
  }

  /**
   * @description Publishes a game started event
   * @param sessionId The game session ID
   * @param playerId The player who started/accepted the game
   */
  public static void publishGameStartedEvent(
    String sessionId,
    String playerId
  ) {
    publishGameEvent(sessionId, playerId, null, 'GAME_STARTED');
  }

  /**
   * @description Publishes a game completed event
   * @param sessionId The game session ID
   * @param playerId The player who made the final move
   * @param cellPosition The final cell position
   */
  public static void publishGameCompletedEvent(
    String sessionId,
    String playerId,
    Integer cellPosition
  ) {
    publishGameEvent(sessionId, playerId, cellPosition, 'GAME_COMPLETED');
  }

  /**
   * @description Publishes an invitation sent event
   * @param sessionId The game session ID
   * @param playerId The player who sent the invitation
   */
  public static void publishInvitationEvent(String sessionId, String playerId) {
    publishGameEvent(sessionId, playerId, null, 'INVITATION_SENT');
  }
}
