/**
 * @description Core game engine for Tic Tac Toe logic
 * @author Austin Barthel
 * @date 2024
 */
public with sharing class TicTacToeGameEngine {
  public static final List<List<Integer>> WIN_PATTERNS = new List<List<Integer>>{
    new List<Integer>{ 0, 1, 2 },
    new List<Integer>{ 3, 4, 5 },
    new List<Integer>{ 6, 7, 8 }, // Rows
    new List<Integer>{ 0, 3, 6 },
    new List<Integer>{ 1, 4, 7 },
    new List<Integer>{ 2, 5, 8 }, // Columns
    new List<Integer>{ 0, 4, 8 },
    new List<Integer>{ 2, 4, 6 } // Diagonals
  };

  /**
   * @description Represents the result of a game state check
   */
  public class GameStateResult {
    @AuraEnabled
    public Boolean isGameOver { get; set; }
    @AuraEnabled
    public String winner { get; set; }
    @AuraEnabled
    public Boolean isDraw { get; set; }
    @AuraEnabled
    public List<Integer> winningLine { get; set; }

    public GameStateResult() {
      this.isGameOver = false;
      this.winner = null;
      this.isDraw = false;
      this.winningLine = new List<Integer>();
    }
  }

  /**
   * @description Validates if a move is legal
   * @param boardState Current board state as List<String>
   * @param position Cell position (0-8)
   * @return Boolean indicating if move is valid
   */
  public static Boolean isValidMove(List<String> boardState, Integer position) {
    if (position == null || position < 0 || position > 8) {
      return false;
    }

    if (boardState == null || boardState.size() != 9) {
      return false;
    }

    return String.isBlank(boardState[position]);
  }

  /**
   * @description Makes a move and returns updated board state
   * @param boardState Current board state
   * @param position Cell position
   * @param player Player symbol ('X' or 'O')
   * @return Updated board state
   */
  public static List<String> makeMove(
    List<String> boardState,
    Integer position,
    String player
  ) {
    if (!isValidMove(boardState, position)) {
      throw new TicTacToeException(
        'Invalid move: position ' + position + ' is not available'
      );
    }

    if (player != 'X' && player != 'O') {
      throw new TicTacToeException('Invalid player symbol: ' + player);
    }

    List<String> newBoardState = boardState.clone();
    newBoardState[position] = player;
    return newBoardState;
  }

  /**
   * @description Checks current game state for winner or draw
   * @param boardState Current board state
   * @return GameStateResult with game status
   */
  public static GameStateResult checkGameState(List<String> boardState) {
    GameStateResult result = new GameStateResult();

    if (boardState == null || boardState.size() != 9) {
      return result;
    }

    // Check for winner
    for (List<Integer> pattern : WIN_PATTERNS) {
      String cell1 = boardState[pattern[0]];
      String cell2 = boardState[pattern[1]];
      String cell3 = boardState[pattern[2]];

      if (String.isNotBlank(cell1) && cell1 == cell2 && cell1 == cell3) {
        result.isGameOver = true;
        result.winner = cell1;
        result.winningLine = pattern;
        return result;
      }
    }

    // Check for draw
    Boolean hasEmptyCell = false;
    for (String cell : boardState) {
      if (String.isBlank(cell)) {
        hasEmptyCell = true;
        break;
      }
    }

    if (!hasEmptyCell) {
      result.isGameOver = true;
      result.isDraw = true;
    }

    return result;
  }

  /**
   * @description Gets the next player symbol
   * @param currentPlayer Current player ('X' or 'O')
   * @return Next player symbol
   */
  public static String getNextPlayer(String currentPlayer) {
    return currentPlayer == 'X' ? 'O' : 'X';
  }

  /**
   * @description Converts board state to JSON string
   * @param boardState Board state as List<String>
   * @return JSON string representation
   */
  public static String boardStateToJson(List<String> boardState) {
    if (boardState == null) {
      return '["","","","","","","","",""]';
    }
    return JSON.serialize(boardState);
  }

  /**
   * @description Parses JSON string to board state
   * @param jsonString JSON representation of board
   * @return Board state as List<String>
   */
  public static List<String> jsonToBoardState(String jsonString) {
    if (String.isBlank(jsonString)) {
      return new List<String>{ '', '', '', '', '', '', '', '', '' };
    }

    try {
      return (List<String>) JSON.deserialize(jsonString, List<String>.class);
    } catch (Exception e) {
      return new List<String>{ '', '', '', '', '', '', '', '', '' };
    }
  }
}
