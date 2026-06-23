import React from "react";
import { cn } from "@/lib/utils";

interface PixelPieceProps {
  type: "p" | "r" | "n" | "b" | "q" | "k"; // lower-case representation
  color: "w" | "b";
  className?: string;
  size?: number;
}

// 12x12 pixel grid representations for each chess piece
// Symbols:
// '.' = Transparent
// 'B' = Border / Outline (Dark charcoal)
// 'F' = Fill / Base color (Light cream for White pieces, Deep retro slate/indigo for Black)
// 'S' = Shadow / Secondary depth color
// 'H' = Highlight / Accent (Shinier light color for 3D retro depth)
// 'X' = Secondary Accent (e.g. eyes or crown stones)
const SP_PAWN = [
  "............",
  "............",
  ".....BB.....",
  "....BHHB....",
  "....BFFB....",
  ".....BB.....",
  "....BBBB....",
  "...BFHFFB...",
  "..BFFFFFSB..",
  "..BFFFFFSB..",
  ".BBBBBBBBBB.",
  "............"
];

const SP_ROOK = [
  "............",
  "..B.B..B.B..",
  "..BBBBBBBB..",
  "..BFHFFHFB..",
  "..BFFSFFSB..",
  "..BBBBBBBB..",
  "...BFFFB....",
  "...BFFFB....",
  "..BFFFFFSB..",
  ".BFFFFFFFSB.",
  ".BBBBBBBBBB.",
  "............"
];

const SP_KNIGHT = [
  "............",
  ".....BBB....",
  "....BHHFFB..",
  "...BFFFFXFB.",
  "...BFFBFFB..",
  "....BBFFSB..",
  ".....BFFSB..",
  "....BFFFSSB.",
  "...BFFFFSSB.",
  "..BFFFFFFSSB",
  ".BBBBBBBBBBB",
  "............"
];

const SP_BISHOP = [
  "............",
  ".....BB.....",
  "....BFFB....",
  "....BHXB....",
  "...BHFFFB...",
  "...BFFFFB...",
  "....BFFB....",
  "....BFFSB...",
  "...BFFFSB...",
  "..BFFFFFFB..",
  ".BBBBBBBBBB.",
  "............"
];

const SP_QUEEN = [
  "............",
  "..B..B..B..B",
  "..BHBFFBFFB.",
  "..BFFXFFXFB.",
  "...BFFFFFB..",
  "...BFFFFFB..",
  "...BFFFFSB..",
  "...BFFFFSB..",
  "..BFFFFFSB..",
  ".BFFFFFFFSB.",
  ".BBBBBBBBBB.",
  "............"
];

const SP_KING = [
  ".....BB.....",
  "....BXXB....",
  ".....BB.....",
  "...BBBBBB...",
  "..BHHHHHFB..",
  "..BFFXFFSB..",
  "..BFFFFFFB..",
  "..BFFFFFSB..",
  "..BFFFFFSB..",
  ".BFFFFFFFSB.",
  ".BBBBBBBBBB.",
  "............"
];

const PIECE_SPRITES: Record<string, string[]> = {
  p: SP_PAWN,
  r: SP_ROOK,
  n: SP_KNIGHT,
  b: SP_BISHOP,
  q: SP_QUEEN,
  k: SP_KING
};

export const PixelPiece: React.FC<PixelPieceProps> = ({
  type,
  color,
  className,
  size = 48
}) => {
  const sprite = PIECE_SPRITES[type.toLowerCase()] || SP_PAWN;

  // Retro Arcade Palette Configurations
  const colors = {
    // Shared outline
    B: "#1d1f21", // Dark slate / black outline
    X: color === "w" ? "#ff4136" : "#ffdb58", // Accent color (Ruby for white king cross/crown, Golden for black eyes/crowns)
    
    // White Piece Palette (Ivory theme)
    w: {
      F: "#f5f5f5", // Creamy White Fill
      H: "#ffffff", // Pure White Highlight
      S: "#d2d2d2", // Cool Gray Shadow
    },
    
    // Black Piece Palette (Cyber Retro Magenta/Purple theme)
    b: {
      F: "#3a3f58", // Deep Violet Slate Fill
      H: "#565f89", // Lavender Highlight
      S: "#222538", // Heavy Dark Purple Shadow
    }
  };

  const getPixelColor = (char: string) => {
    if (char === ".") return "transparent";
    if (char === "B") return colors.B;
    if (char === "X") return colors.X;
    
    const palette = colors[color];
    if (char === "F") return palette.F;
    if (char === "H") return palette.H;
    if (char === "S") return palette.S;
    
    return "transparent";
  };

  return (
    <div
      className={cn("relative select-none flex items-center justify-center transition-transform duration-100", className)}
      style={{ width: size, height: size }}
      id={`pixel-piece-${color}-${type}`}
    >
      <svg
        viewBox="0 0 12 12"
        width="100%"
        height="100%"
        className="shape-rendering-pixelated"
        style={{ imageRendering: "pixelated" }}
      >
        {sprite.map((row, rIdx) => {
          return row.split("").map((char, cIdx) => {
            const pixelColor = getPixelColor(char);
            if (pixelColor === "transparent") return null;
            return (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width={1.05} // Slightly wider overlap to eliminate SVG grid rendering gaps
                height={1.05}
                fill={pixelColor}
                shapeRendering="crispEdges"
              />
            );
          });
        })}
      </svg>
    </div>
  );
};
