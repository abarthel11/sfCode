/**
 * @description Test class for TicTacToeGameEngine
 * @author Austin Barthel
 * @date 2024
 */
@IsTest
private class TicTacToeGameEngineTest {
  @IsTest
  static void testIsValidMove_ValidPositions() {
    List<String> emptyBoard = new List<String>{
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    // Test all valid positions on empty board
    for (Integer i = 0; i < 9; i++) {
      System.assert(
        TicTacToeGameEngine.isValidMove(emptyBoard, i),
        'Position ' + i + ' should be valid on empty board'
      );
    }
  }

  @IsTest
  static void testIsValidMove_InvalidPositions() {
    List<String> emptyBoard = new List<String>{
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    // Test invalid positions
    System.assert(
      !TicTacToeGameEngine.isValidMove(emptyBoard, -1),
      'Negative position should be invalid'
    );
    System.assert(
      !TicTacToeGameEngine.isValidMove(emptyBoard, 9),
      'Position 9 should be invalid'
    );
    System.assert(
      !TicTacToeGameEngine.isValidMove(emptyBoard, null),
      'Null position should be invalid'
    );
    System.assert(
      !TicTacToeGameEngine.isValidMove(null, 0),
      'Null board should be invalid'
    );
  }

  @IsTest
  static void testIsValidMove_OccupiedPosition() {
    List<String> board = new List<String>{
      'X',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    System.assert(
      !TicTacToeGameEngine.isValidMove(board, 0),
      'Occupied position should be invalid'
    );
    System.assert(
      TicTacToeGameEngine.isValidMove(board, 1),
      'Empty position should be valid'
    );
  }

  @IsTest
  static void testMakeMove_ValidMove() {
    List<String> emptyBoard = new List<String>{
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    List<String> result = TicTacToeGameEngine.makeMove(emptyBoard, 0, 'X');

    System.assertEquals('X', result[0], 'Position 0 should contain X');
    System.assertEquals('', result[1], 'Position 1 should remain empty');
  }

  @IsTest
  static void testMakeMove_InvalidMove() {
    List<String> board = new List<String>{
      'X',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    try {
      TicTacToeGameEngine.makeMove(board, 0, 'O');
      System.assert(
        false,
        'Should have thrown exception for occupied position'
      );
    } catch (TicTacToeException e) {
      System.assert(
        e.getMessage().contains('Invalid move'),
        'Should throw TicTacToeException'
      );
    }
  }

  @IsTest
  static void testMakeMove_InvalidPlayer() {
    List<String> emptyBoard = new List<String>{
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    try {
      TicTacToeGameEngine.makeMove(emptyBoard, 0, 'Z');
      System.assert(false, 'Should have thrown exception for invalid player');
    } catch (TicTacToeException e) {
      System.assert(
        e.getMessage().contains('Invalid player symbol'),
        'Should throw TicTacToeException'
      );
    }
  }

  @IsTest
  static void testCheckGameState_HorizontalWin() {
    List<String> board = new List<String>{
      'X',
      'X',
      'X',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    TicTacToeGameEngine.GameStateResult result = TicTacToeGameEngine.checkGameState(
      board
    );

    System.assert(result.isGameOver, 'Game should be over');
    System.assertEquals('X', result.winner, 'X should be the winner');
    System.assert(!result.isDraw, 'Should not be a draw');
    System.assertEquals(
      new List<Integer>{ 0, 1, 2 },
      result.winningLine,
      'Winning line should be first row'
    );
  }

  @IsTest
  static void testCheckGameState_VerticalWin() {
    List<String> board = new List<String>{
      'O',
      '',
      '',
      'O',
      '',
      '',
      'O',
      '',
      ''
    };

    TicTacToeGameEngine.GameStateResult result = TicTacToeGameEngine.checkGameState(
      board
    );

    System.assert(result.isGameOver, 'Game should be over');
    System.assertEquals('O', result.winner, 'O should be the winner');
    System.assertEquals(
      new List<Integer>{ 0, 3, 6 },
      result.winningLine,
      'Winning line should be first column'
    );
  }

  @IsTest
  static void testCheckGameState_DiagonalWin() {
    List<String> board = new List<String>{
      'X',
      '',
      '',
      '',
      'X',
      '',
      '',
      '',
      'X'
    };

    TicTacToeGameEngine.GameStateResult result = TicTacToeGameEngine.checkGameState(
      board
    );

    System.assert(result.isGameOver, 'Game should be over');
    System.assertEquals('X', result.winner, 'X should be the winner');
    System.assertEquals(
      new List<Integer>{ 0, 4, 8 },
      result.winningLine,
      'Winning line should be main diagonal'
    );
  }

  @IsTest
  static void testCheckGameState_Draw() {
    List<String> board = new List<String>{
      'X',
      'O',
      'X',
      'O',
      'O',
      'X',
      'O',
      'X',
      'O'
    };

    TicTacToeGameEngine.GameStateResult result = TicTacToeGameEngine.checkGameState(
      board
    );

    System.assert(result.isGameOver, 'Game should be over');
    System.assert(result.isDraw, 'Should be a draw');
    System.assertEquals(null, result.winner, 'Should have no winner');
  }

  @IsTest
  static void testCheckGameState_GameInProgress() {
    List<String> board = new List<String>{
      'X',
      'O',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    TicTacToeGameEngine.GameStateResult result = TicTacToeGameEngine.checkGameState(
      board
    );

    System.assert(!result.isGameOver, 'Game should not be over');
    System.assert(!result.isDraw, 'Should not be a draw');
    System.assertEquals(null, result.winner, 'Should have no winner');
  }

  @IsTest
  static void testGetNextPlayer() {
    System.assertEquals(
      'O',
      TicTacToeGameEngine.getNextPlayer('X'),
      'Next player after X should be O'
    );
    System.assertEquals(
      'X',
      TicTacToeGameEngine.getNextPlayer('O'),
      'Next player after O should be X'
    );
  }

  @IsTest
  static void testBoardStateJsonConversion() {
    List<String> originalBoard = new List<String>{
      'X',
      'O',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    String json = TicTacToeGameEngine.boardStateToJson(originalBoard);
    List<String> convertedBoard = TicTacToeGameEngine.jsonToBoardState(json);

    System.assertEquals(
      originalBoard,
      convertedBoard,
      'Board state should be preserved through JSON conversion'
    );
  }

  @IsTest
  static void testJsonToBoardState_InvalidJson() {
    List<String> result = TicTacToeGameEngine.jsonToBoardState('invalid json');
    List<String> expected = new List<String>{
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    System.assertEquals(
      expected,
      result,
      'Invalid JSON should return empty board'
    );
  }

  @IsTest
  static void testJsonToBoardState_NullJson() {
    List<String> result = TicTacToeGameEngine.jsonToBoardState(null);
    List<String> expected = new List<String>{
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    };

    System.assertEquals(
      expected,
      result,
      'Null JSON should return empty board'
    );
  }
}
