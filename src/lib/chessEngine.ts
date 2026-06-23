import { Chess, Square } from "chess.js";

// Piece values for static evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 1000
};

// Simple positional bonuses for 8-bit retro engine (center control is key!)
const PSQT_PAWN = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5,  5,  5,  5,  5,  5,  5,  5],
  [1,  1,  2,  3,  3,  2,  1,  1],
  [0.5,0.5,1,2.5,2.5,1,0.5,0.5],
  [0,  0,  0,  2,  2,  0,  0,  0],
  [0.5,-0.5,-1,0,0,-1,-0.5,0.5],
  [0.5,  1, 1,-2,-2,  1,  1,0.5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const PSQT_KNIGHT = [
  [-5, -4, -3, -3, -3, -3, -4, -5],
  [-4, -2,  0,  0,  0,  0, -2, -4],
  [-3,  0,  1,  1.5,1.5,1,  0, -3],
  [-3,  0.5,1.5,2,  2,  1.5,0.5,-3],
  [-3,  0,  1.5,2,  2,  1.5,0,  -3],
  [-3,  0.5,1,  1.5,1.5,1,  0.5,-3],
  [-4, -2,  0,  0.5,0.5,0,  -2, -4],
  [-5, -4, -3, -3, -3, -3, -4, -5]
];

const PSQT_BISHOP = [
  [-2, -1, -1, -1, -1, -1, -1, -2],
  [-1,  0,  0,  0,  0,  0,  0, -1],
  [-1,  0,  0.5,1,  1,  0.5,0, -1],
  [-1,  0.5,0.5,1,  1,  0.5,0.5,-1],
  [-1,  0,  1,  1,  1,  1,  0, -1],
  [-1,  1,  1,  1,  1,  1,  1, -1],
  [-1,  0.5,0,  0,  0,  0,  0.5,-1],
  [-2, -1, -1, -1, -1, -1, -1, -2]
];

// Evaluate board state from the perspective of 'color'
export const evaluateBoard = (chess: Chess, aiColor: "w" | "b"): number => {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        let pieceVal = PIECE_VALUES[piece.type];
        let positionBonus = 0;

        // Apply custom retro positional layouts (reversing for black side)
        const rowIdx = piece.color === "w" ? 7 - r : r;
        const colIdx = piece.color === "w" ? c : 7 - c;

        if (piece.type === "p") {
          positionBonus = PSQT_PAWN[rowIdx][colIdx];
        } else if (piece.type === "n") {
          positionBonus = PSQT_KNIGHT[rowIdx][colIdx];
        } else if (piece.type === "b") {
          positionBonus = PSQT_BISHOP[rowIdx][colIdx];
        }

        const totalVal = pieceVal + positionBonus;

        if (piece.color === aiColor) {
          score += totalVal;
        } else {
          score -= totalVal;
        }
      }
    }
  }

  // Slightly prefer check status in evaluation
  if (chess.inCheck()) {
    score += chess.turn() === aiColor ? -5 : 5;
  }

  return score;
};

// MiniMax algorithm with alpha-beta pruning (Depth 2 - fast & reliable)
const minimax = (
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: "w" | "b"
): { score: number; move: string | null } => {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess, aiColor), move: null };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluateBoard(chess, aiColor), move: null };
  }

  let bestMove: string | null = null;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      chess.move(move.san);
      const val = minimax(chess, depth - 1, alpha, beta, false, aiColor).score;
      chess.undo();

      if (val > maxScore) {
        maxScore = val;
        bestMove = move.san;
      }
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break; // Pruned
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      chess.move(move.san);
      const val = minimax(chess, depth - 1, alpha, beta, true, aiColor).score;
      chess.undo();

      if (val < minScore) {
        minScore = val;
        bestMove = move.san;
      }
      beta = Math.min(beta, val);
      if (beta <= alpha) break; // Pruned
    }
    return { score: minScore, move: bestMove };
  }
};

/**
 * Calculates the best move for our heuristic engine.
 * @param fen The current chess position FEN
 * @param difficulty "Apprentice" | "Challenger" | "Sovereign"
 * @returns Best legal move SAN string
 */
export const calculateHeuristicMove = (
  fen: string,
  difficulty: "Apprentice" | "Challenger" | "Sovereign"
): string => {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ verbose: true });
  
  if (legalMoves.length === 0) return "";
  if (legalMoves.length === 1) return legalMoves[0].san;

  const turnColor = chess.turn();

  // Difficulty configurations:
  // Apprentice (Easy): 45% make random move, 55% make smart move
  // Challenger (Medium): 15% random blunder, 85% computed move (Depth 2)
  // Sovereign (Hard): 100% Depth 2 computed tactical move
  const roll = Math.random();
  let shouldPlayRandom = false;

  if (difficulty === "Apprentice") {
    shouldPlayRandom = roll < 0.45;
  } else if (difficulty === "Challenger") {
    shouldPlayRandom = roll < 0.15;
  }

  if (shouldPlayRandom) {
    // Return a random legal move
    const randIdx = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randIdx].san;
  }

  // Else run minimax evaluation
  const { move } = minimax(chess, 2, -Infinity, Infinity, true, turnColor);
  
  // Failsafe in case move calculation had any edge exceptions
  if (move && legalMoves.some(m => m.san === move)) {
    return move;
  }
  return legalMoves[Math.floor(Math.random() * legalMoves.length)].san;
};
