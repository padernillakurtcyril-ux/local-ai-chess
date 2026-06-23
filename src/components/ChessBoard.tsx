import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { BoardTheme, PlayerColor } from "../types";
import { PixelPiece } from "./PixelPiece";
import { RealisticPiece } from "./RealisticPiece";
import { cn } from "@/lib/utils";

interface ChessBoardProps {
  fen: string;
  playerColor: "w" | "b";
  boardTheme: BoardTheme;
  isAiThinking: boolean;
  onMove: (from: string, to: string) => void;
  lastMove: { from: string; to: string } | null;
  combatMode?: "chess" | "gun";
  playerAmmo?: Record<string, number>;
  piecesHp?: Record<string, number>;
  onShoot?: (from: string, to: string) => void;
  laserTracer?: { from: string; to: string; color: string } | null;
  pieceStyle?: "pixel" | "realistic";
}

const PIECE_MAX_HP = {
  p: 2,
  n: 4,
  b: 4,
  r: 5,
  q: 8,
  k: 12
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  playerColor,
  boardTheme,
  isAiThinking,
  onMove,
  lastMove,
  combatMode = "chess",
  playerAmmo = { p: 3, n: 1, b: 2, r: 1, q: 1, k: 999 },
  piecesHp = {},
  onShoot,
  laserTracer = null,
  pieceStyle = "realistic"
}) => {
  // Use chess.js instance to calculate legal moves locally
  const [chessInstance, setChessInstance] = useState(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validDestinations, setValidDestinations] = useState<string[]>([]);
  const [checkedSquare, setCheckedSquare] = useState<string | null>(null);

  // Sync chessInstance when FEN changes
  useEffect(() => {
    try {
      const newChess = new Chess(fen);
      setChessInstance(newChess);
      setSelectedSquare(null);
      setValidDestinations([]);

      // Check if anyone is in check, and find the king's square
      if (newChess.inCheck()) {
        const turn = newChess.turn();
        const board = newChess.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === "k" && piece.color === turn) {
              setCheckedSquare(piece.square);
              return;
            }
          }
        }
      } else {
        setCheckedSquare(null);
      }
    } catch (e) {
      console.warn("Invalid FEN encountered:", e);
    }
  }, [fen]);

  // Helper to resolve retro shooting coordinates
  const getShootingDestinations = (sq: string, type: "p"|"r"|"n"|"b"|"q"|"k", color: "w"|"b"): string[] => {
    const filesList = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranksList = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const fIdx = filesList.indexOf(sq[0]);
    const rIdx = ranksList.indexOf(sq[1]);
    const targets: string[] = [];

    const checkAndAdd = (f: number, r: number) => {
      if (f >= 0 && f < 8 && r >= 0 && r < 8) {
        targets.push(`${filesList[f]}${ranksList[r]}`);
      }
    };

    if (type === "p") {
      // Pawn colt pistol: 2 squares orthogonal front/diagonal/sides
      const dir = color === "w" ? 1 : -1;
      for (let d = 1; d <= 2; d++) {
        checkAndAdd(fIdx, rIdx + d * dir);
        checkAndAdd(fIdx - d, rIdx + d * dir);
        checkAndAdd(fIdx + d, rIdx + d * dir);
      }
      checkAndAdd(fIdx - 1, rIdx);
      checkAndAdd(fIdx + 1, rIdx);
    } else if (type === "n") {
      // Knight Shotgun: leaps
      const leaps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      leaps.forEach(([df, dr]) => checkAndAdd(fIdx + df, rIdx + dr));
    } else if (type === "b") {
      // Bishop railgun: diagonal line of sight
      const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      dirs.forEach(([df, dr]) => {
        for (let i = 1; i < 8; i++) {
          const nf = fIdx + df * i;
          const nr = rIdx + dr * i;
          if (nf < 0 || nf >= 8 || nr < 0 || nr >= 8) break;
          const targetSq = `${filesList[nf]}${ranksList[nr]}`;
          targets.push(targetSq);
          if (chessInstance.get(targetSq as Square)) break; // block laser line
        }
      });
    } else if (type === "r") {
      // Rook RPG: straight line of sight
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      dirs.forEach(([df, dr]) => {
        for (let i = 1; i < 8; i++) {
          const nf = fIdx + df * i;
          const nr = rIdx + dr * i;
          if (nf < 0 || nf >= 8 || nr < 0 || nr >= 8) break;
          const targetSq = `${filesList[nf]}${ranksList[nr]}`;
          targets.push(targetSq);
          if (chessInstance.get(targetSq as Square)) break; // block RPG rocket line
        }
      });
    } else if (type === "q") {
      // Queen energy submachine: all line of sights
      const dirs = [
        [1, 1], [1, -1], [-1, 1], [-1, -1],
        [1, 0], [-1, 0], [0, 1], [0, -1]
      ];
      dirs.forEach(([df, dr]) => {
        for (let i = 1; i < 8; i++) {
          const nf = fIdx + df * i;
          const nr = rIdx + dr * i;
          if (nf < 0 || nf >= 8 || nr < 0 || nr >= 8) break;
          const targetSq = `${filesList[nf]}${ranksList[nr]}`;
          targets.push(targetSq);
          if (chessInstance.get(targetSq as Square)) break;
        }
      });
    } else if (type === "k") {
      // King short revolver: radius 1
      for (let df = -1; df <= 1; df++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (df !== 0 || dr !== 0) {
            checkAndAdd(fIdx + df, rIdx + dr);
          }
        }
      }
    }
    return targets;
  };

  // Handle Square Selection
  const handleSquareClick = (squareRepresentation: string) => {
    if (isAiThinking) return;

    const turn = chessInstance.turn();
    if (turn !== playerColor) return;

    const piece = chessInstance.get(squareRepresentation as Square);

    // If a valid move/shoot target was clicked
    if (selectedSquare && validDestinations.includes(squareRepresentation)) {
      if (combatMode === "gun") {
        if (onShoot) {
          onShoot(selectedSquare, squareRepresentation);
        }
      } else {
        onMove(selectedSquare, squareRepresentation);
      }
      setSelectedSquare(null);
      setValidDestinations([]);
      return;
    }

    // Otherwise, handle piece selection
    if (piece && piece.color === playerColor) {
      if (combatMode === "gun") {
        const ammoCount = playerAmmo[piece.type] || 0;
        if (ammoCount <= 0) {
          setSelectedSquare(null);
          setValidDestinations([]);
          return;
        }
        setSelectedSquare(squareRepresentation);
        const shootDests = getShootingDestinations(squareRepresentation, piece.type, playerColor);
        // Only highlight destinations that contain active hostile target pieces
        const enemiesInRange = shootDests.filter(t => {
          const p = chessInstance.get(t as Square);
          return p && p.color !== playerColor;
        });
        setValidDestinations(enemiesInRange);
      } else {
        setSelectedSquare(squareRepresentation);
        const moves = chessInstance.moves({
          square: squareRepresentation as Square,
          verbose: true
        });
        setValidDestinations(moves.map(m => m.to));
      }
    } else {
      setSelectedSquare(null);
      setValidDestinations([]);
    }
  };

  // Color theme definitions for our chess Board squares
  const themeStyles = {
    classic: {
      light: "bg-[#e2e8f0]", // Slate 100
      dark: "bg-[#475569]",  // Slate 600
      border: "border-[#1e293b]",
      coords: "text-slate-400 font-mono",
      selected: "ring-4 ring-green-500 ring-inset bg-green-500/20",
      highlight: "bg-green-400/30 ring-2 ring-green-400/60 ring-inset",
      lastMove: "bg-yellow-500/15"
    },
    wood: {
      light: "bg-[#eedcaf]", // Cream Wood
      dark: "bg-[#b06a2e]",  // Mahogany Brown
      border: "border-[#5c3104]",
      coords: "text-[#b06a2e] font-press-start",
      selected: "ring-4 ring-[#39ff14] ring-inset bg-[#39ff14]/20",
      highlight: "bg-green-400/25 ring-2 ring-green-400/50 ring-inset",
      lastMove: "bg-orange-500/15"
    },
    cyber: {
      light: "bg-[#262626] border border-[#00ff41]/5", // Carbon grey light
      dark: "bg-[#121212] border border-[#00ff41]/5",  // Absolute carbon black dark
      border: "border-[#00ff41]",
      coords: "text-[#00ff41] font-press-start text-[8px]",
      selected: "ring-4 ring-[#ff00ff] ring-inset bg-[#ff00ff]/15 shadow-[0_0_12px_rgba(255,0,255,0.25)]",
      highlight: "bg-[#00ffff]/20 ring-2 ring-[#00ffff]/60 ring-inset",
      lastMove: "bg-[#00ff41]/10"
    },
    lavender: {
      light: "bg-[#ece5f8] border border-[#7e63b8]/15", // Soft Lavender
      dark: "bg-[#7e63b8]",  // Dark Violet
      border: "border-[#40237e]",
      coords: "text-[#7e63b8] font-mono",
      selected: "ring-4 ring-[#ff007f] ring-inset bg-[#ff007f]/20",
      highlight: "bg-[#ff007f]/25 ring-2 ring-[#ff007f]/50 ring-inset",
      lastMove: "bg-indigo-500/15"
    }
  }[boardTheme];

  // Helper arrays to draw ranks and files
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  // Flip board representation if player is BLACK:
  // White has 'a1' at bottom-left, Black has 'h8' at bottom-left
  const orderedRanks = playerColor === "w" ? ranks : [...ranks].reverse();
  const orderedFiles = playerColor === "w" ? files : [...files].reverse();

  return (
    <div
      className={cn(
        "relative select-none flex flex-col p-4 bg-[#1a1a1a] border-4 border-[#00ff41] shadow-[8px_8px_0px_0px_rgba(0,255,65,0.15)] rounded-none",
        boardTheme === "cyber" ? "border-[#00ff41] bg-[#1a1a1a]" : "",
        boardTheme === "wood" ? "border-amber-800 bg-[#29170a] shadow-[8px_8px_0px_0px_rgba(176,106,46,0.15)]" : ""
      )}
      id="chess-gameplay-arcade"
    >
      {/* Visual Overlay for AI Thinking State */}
      {isAiThinking && (
        <div className="absolute inset-0 bg-black/35 z-30 flex items-center justify-center backdrop-blur-xxs select-none pointer-events-auto">
          <div className="px-4 py-2 border-pixel border-yellow-500 bg-black text-yellow-500 font-press-start text-xxs animate-pulse pixel-shadow flex flex-col items-center gap-1">
            <span>[GEMMA TURN]</span>
            <span className="text-[10px] text-yellow-300">CALCULATING VECTOR...</span>
          </div>
        </div>
      )}

      {/* Grid wrapper containing ranks coordinate bar + 8x8 Board + files coordinate bar */}
      <div className="flex flex-row items-stretch">
        {/* Left Side Ranks Label */}
        <div className="flex flex-col justify-around pr-2 text-center text-xs">
          {orderedRanks.map(rank => (
            <div
              key={`rank-left-${rank}`}
              className={cn("w-4 text-center text-xs uppercase select-none font-press-start leading-none flex items-center justify-center", themeStyles.coords)}
              style={{ fontSize: "10px" }}
            >
              {rank}
            </div>
          ))}
        </div>

        {/* The Core 8x8 Board */}
        <div
          className={cn(
            "grid grid-cols-8 grid-rows-8 border-4 border-double w-full aspect-square max-w-[480px] min-w-[280px] relative overflow-hidden",
            themeStyles.border,
            boardTheme === "cyber" ? "shadow-[0_0_12px_rgba(0,240,255,0.15)]" : ""
          )}
        >
          {orderedRanks.map((rank, rIdx) => {
            return orderedFiles.map((file, fIdx) => {
              const squareRepresentation = `${file}${rank}`;
              const piece = chessInstance.get(squareRepresentation as Square);
              
              // Determine cell base color (even cell in odd row vs odd cell in even row)
              const fileNum = files.indexOf(file);
              const rankNum = ranks.indexOf(rank);
              const isDark = (fileNum + rankNum) % 2 === 1;

              // Action styles
              const isSelected = selectedSquare === squareRepresentation;
              const isDestination = validDestinations.includes(squareRepresentation);
              const isKingInCheckFlag = checkedSquare === squareRepresentation;
              const isCellLastMove = lastMove && (lastMove.from === squareRepresentation || lastMove.to === squareRepresentation);

              return (
                <div
                  key={squareRepresentation}
                  onClick={() => handleSquareClick(squareRepresentation)}
                  className={cn(
                    "aspect-square flex items-center justify-center relative transition-colors duration-100 cursor-pointer select-none",
                    isDark ? themeStyles.dark : themeStyles.light,
                    isCellLastMove && themeStyles.lastMove,
                    isSelected && themeStyles.selected,
                    isKingInCheckFlag && "bg-rose-500/40 ring-4 ring-rose-500 ring-inset animate-pulse"
                  )}
                  style={{
                    imageRendering: "pixelated"
                  }}
                  id={`square-${squareRepresentation}`}
                >
                  {/* Underlay Destination highlight dot */}
                  {isDestination && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      {combatMode === "gun" ? (
                        // Ultra-detailed custom shooter targeting sights crosshair overlay
                        <div className="w-[88%] h-[88%] border-2 border-double border-[#ff00ff] absolute animate-pulse flex items-center justify-center bg-red-500/10 shadow-[0_0_8px_rgba(255,0,255,0.3)]">
                          <span className="text-[12px] font-bold text-[#ff00ff] font-sans drop-shadow-[0_0_2px_#000]">🎯</span>
                        </div>
                      ) : piece ? (
                        // capture-focused selector rings
                        <div className="w-[85%] h-[85%] border-2 border-dashed border-red-500 absolute rounded-sm animate-pulse" />
                      ) : (
                        // simple target dot
                        <div className="w-3 h-3 bg-green-500/80 rounded-none border border-pixel-double border-white/40" />
                      )}
                    </div>
                  )}

                  {/* Render Chess Piece */}
                  {piece && (
                    pieceStyle === "realistic" ? (
                      <RealisticPiece
                        type={piece.type as any}
                        color={piece.color}
                        className={cn(
                          "z-10 relative pointer-events-none drop-shadow-md select-none",
                          isAiThinking ? "opacity-90" : ""
                        )}
                        size={38}
                      />
                    ) : (
                      <PixelPiece
                        type={piece.type as any}
                        color={piece.color}
                        className={cn(
                          "z-10 relative pointer-events-none drop-shadow-md select-none",
                          isAiThinking ? "opacity-90" : ""
                        )}
                        size={36}
                      />
                    )
                  )}

                  {/* Absolute Cell Coordinates bottom-right layer for beautiful retro details */}
                  {rIdx === 7 && (
                    <span
                      className={cn(
                        "absolute bottom-0 right-1 text-[8px] font-mono select-none opacity-20 pointer-events-none",
                        isDark ? "text-white" : "text-black"
                      )}
                    >
                      {file}
                    </span>
                  )}

                  {/* Mini Retro HP Bar and Numeric Badge for Adventure Mode */}
                  {piece && piecesHp[squareRepresentation] !== undefined && (
                    <>
                      {/* Numeric HP Indicator */}
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-bold leading-none bg-black/75 text-[#00ff41] px-0.5 border border-[#00ff41]/20 z-20 select-none scale-90">
                        {piecesHp[squareRepresentation]} HP
                      </span>

                      {/* Mini HP Slider */}
                      <div className="absolute bottom-1.5 left-1 right-1 h-1 bg-black/75 border border-zinc-800 z-20 pointer-events-none overflow-hidden flex">
                        <div 
                          className={cn(
                            "h-full transition-all duration-300",
                            piecesHp[squareRepresentation] > (PIECE_MAX_HP[piece.type as keyof typeof PIECE_MAX_HP] * 0.5) 
                              ? "bg-[#00ff41]" 
                              : piecesHp[squareRepresentation] > (PIECE_MAX_HP[piece.type as keyof typeof PIECE_MAX_HP] * 0.25)
                                ? "bg-yellow-400"
                                : "bg-red-500"
                          )}
                          style={{ width: `${Math.max(0, (piecesHp[squareRepresentation] / PIECE_MAX_HP[piece.type as keyof typeof PIECE_MAX_HP])) * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            });
          })}

          {/* Svg Tracer Overlay for Active Bullet Shoots */}
          {(() => {
            if (!laserTracer) return null;
            const fFile = laserTracer.from[0];
            const fRank = laserTracer.from[1];
            const tFile = laserTracer.to[0];
            const tRank = laserTracer.to[1];

            const cFrom = orderedFiles.indexOf(fFile);
            const rFrom = orderedRanks.indexOf(fRank);
            const cTo = orderedFiles.indexOf(tFile);
            const rTo = orderedRanks.indexOf(tRank);

            if (cFrom === -1 || rFrom === -1 || cTo === -1 || rTo === -1) return null;

            const x1 = (cFrom + 0.5) * 12.5;
            const y1 = (rFrom + 0.5) * 12.5;
            const x2 = (cTo + 0.5) * 12.5;
            const y2 = (rTo + 0.5) * 12.5;

            return (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-visible">
                {/* Laser Ray Beam */}
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={laserTracer.color || "#ff00ff"}
                  strokeWidth="5"
                  className="animate-pulse shadow-lg"
                  strokeLinecap="round"
                />
                
                {/* Visual Laser Core (Pure white core) */}
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Particle Impact Circle */}
                <circle
                  cx={`${x2}%`}
                  cy={`${y2}%`}
                  r="16"
                  fill="transparent"
                  stroke={laserTracer.color || "#ff00ff"}
                  strokeWidth="3"
                  className="animate-ping"
                />
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Bottom Files coordinate bar */}
      <div className="flex flex-row pl-6 pt-2 select-none">
        <div className="grid grid-cols-8 w-full pr-1">
          {orderedFiles.map(file => (
            <div
              key={`file-bottom-${file}`}
              className={cn("text-center uppercase font-press-start", themeStyles.coords)}
              style={{ fontSize: "10px" }}
            >
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
