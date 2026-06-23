import React from "react";
import { cn } from "@/lib/utils";

interface RealisticPieceProps {
  type: "p" | "r" | "n" | "b" | "q" | "k";
  color: "w" | "b";
  className?: string;
  size?: number;
}

export const RealisticPiece: React.FC<RealisticPieceProps> = ({
  type,
  color,
  className,
  size = 48
}) => {
  const pieceType = type.toLowerCase();
  const isWhite = color === "w";

  // Gradient IDs for this piece instance
  const bodyGradId = `realistic-grad-${color}-${pieceType}`;
  const accentGradId = `realistic-accent-${color}-${pieceType}`;
  const highlightGradId = `realistic-highlight-${color}-${pieceType}`;

  // We provide beautifully styled SVG components with high-resolution paths
  // incorporating advanced gradient coloring, highlights, and proper proportions.
  return (
    <div
      className={cn(
        "relative select-none flex items-center justify-center transition-transform duration-150 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95",
        className
      )}
      style={{ width: size, height: size }}
      id={`realistic-piece-${color}-${type}`}
    >
      <svg
        viewBox="0 0 45 45"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ivory / Pearl Gradient for White Pieces */}
          <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isWhite ? (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#f4f5f7" />
                <stop offset="80%" stopColor="#dedbe6" />
                <stop offset="100%" stopColor="#c4bcd0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#3d404d" />
                <stop offset="30%" stopColor="#2c2e38" />
                <stop offset="85%" stopColor="#18191f" />
                <stop offset="100%" stopColor="#0b0b0d" />
              </>
            )}
          </linearGradient>

          {/* Golden Highlight/Crown trim for Kings, Queens, and Bishops */}
          <linearGradient id={accentGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="50%" stopColor="#f5b041" />
            <stop offset="100%" stopColor="#d35400" />
          </linearGradient>

          {/* Specular Highlighting to give 3D spherical curves */}
          <linearGradient id={highlightGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            {isWhite ? (
              <>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* Outer Shadow Group to simulate 3D grounding */}
        <g
          stroke={isWhite ? "#1e222b" : "#e6e9f0"}
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {pieceType === "p" && (
            <g>
              {/* Pawn Base */}
              <path
                d="M 9,36 L 36,36 C 36,36 38,39 38,40 L 7,40 C 7,39 9,36 9,36 z"
                fill={`url(#${bodyGradId})`}
              />
              <path
                d="M 12,36 C 12,32 15,29 17,27 C 14,27 12,24 12,21 C 12,17.5 14.5,15.5 17.5,15.5 C 19.5,15.5 21,17 21,18.5 L 24,18.5 C 24,17 25.5,15.5 27.5,15.5 C 30.5,15.5 33,17.5 33,21 C 33,24 31,27 28,27 C 30,29 33,32 33,36 z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Pawn Collar */}
              <path
                d="M 15,33.5 L 30,33.5 C 30,33.5 28.5,35 22.5,35 C 16.5,35 15,33.5 15,33.5 z"
                fill={isWhite ? "#ffffff" : "#4a4f5c"}
              />
              {/* Pawn Head Ball */}
              <circle
                cx="22.5"
                cy="11.5"
                r="6.5"
                fill={`url(#${bodyGradId})`}
              />
              <circle
                cx="20.5"
                cy="9.5"
                r="2.5"
                fill={`url(#${highlightGradId})`}
                stroke="none"
              />
            </g>
          )}

          {pieceType === "r" && (
            <g>
              {/* Rook Base */}
              <path
                d="M 9,37 L 36,37 C 36,37 38,40 38,41 L 7,41 C 7,40 9,37 9,37 z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Rook Body */}
              <path
                d="M 12,37 L 13,24 L 32,24 L 33,37 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Rook Battlements */}
              <path
                d="M 11,14 L 11,21 L 14,21 L 14,17 L 18,17 L 18,21 L 21,21 L 21,17 L 24,17 L 24,21 L 27,21 L 27,17 L 31,17 L 31,21 L 34,21 L 34,14 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Base Ring Detail */}
              <path
                d="M 11,34.5 L 34,34.5"
                fill="none"
                stroke={isWhite ? "#a4abb3" : "#3c3e45"}
                strokeWidth="1.5"
              />
              {/* Gold Rook Banner Accent */}
              <rect
                x="17"
                y="26"
                width="11"
                height="4"
                fill={`url(#${accentGradId})`}
                stroke="none"
                rx="1"
              />
            </g>
          )}

          {pieceType === "n" && (
            <g>
              {/* Knight Base */}
              <path
                d="M 9,38 L 36,38 C 36,38 38,41 38,42 L 7,42 C 7,41 9,38 9,38 z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Knight Horse Head Detailed Outline */}
              <path
                d="M 33,26.5 C 33,21 31,16 28,12 C 24.5,12 21.5,10 18.5,14.5 C 15.5,19 15.5,23.5 15.5,23.5 C 15.5,23.5 17,21.5 19,21.5 C 21,21.5 24.5,22.5 25.5,25.5 C 25.5,25.5 24.5,24.5 23.5,24.5 C 22.5,24.5 19.5,25.5 18,29 C 16.5,32.5 18,34 20,34 C 22,34 24.5,32 26.5,32 C 26.5,32 25.5,33.5 23.5,35.5 C 21,37.5 20.5,40 22.5,40 C 24.5,40 27.5,39 30.5,36.5 C 33,34 34,29.5 33,26.5 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Knight Ears */}
              <path
                d="M 20.5,14 L 21.5,10 C 21.5,10 24.5,9 26,14"
                fill={`url(#${bodyGradId})`}
              />
              {/* Knight Eye - Glowing Yellow/Crimson for extra dramatic realistic flare */}
              <circle
                cx="21.5"
                cy="17"
                r="1.8"
                fill={isWhite ? "#f39c12" : "#e74c3c"}
                stroke="#111"
                strokeWidth="0.8"
              />
              {/* Mane Highlights */}
              <path
                d="M 29.5,15.5 C 31,18 32,21.5 32,24"
                fill="none"
                stroke={isWhite ? "#ffffff" : "#4a5161"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          )}

          {pieceType === "b" && (
            <g>
              {/* Bishop Base */}
              <path
                d="M 9,37 L 36,37 C 36,37 38,40 38,41 L 7,41 C 7,40 9,37 9,37 z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Bishop Mitre Body */}
              <path
                d="M 12,37 C 12,33 14,26 18,24 C 15,23 14,19 15,16 C 16,12.5 19.5,11 22.5,11 C 25.5,11 29,12.5 30,16 C 31,19 30,23 27,24 C 31,26 33,33 33,37 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Bishop Slash (The Mitre Cutout) */}
              <path
                d="M 22.5,14.5 L 26.5,18.5 M 21,17 L 21,21"
                fill="none"
                stroke={isWhite ? "#3a3d45" : "#f5f6f7"}
                strokeWidth="1.5"
              />
              {/* Royal Gold Ring */}
              <path
                d="M 15.5,31.5 L 29.5,31.5"
                fill="none"
                stroke={`url(#${accentGradId})`}
                strokeWidth="2.5"
              />
              {/* Golden Cross Crown Atop */}
              <path
                d="M 22.5,11 L 22.5,6 M 20,8 L 25,8"
                fill="none"
                stroke={`url(#${accentGradId})`}
                strokeWidth="1.8"
              />
            </g>
          )}

          {pieceType === "q" && (
            <g>
              {/* Queen Base */}
              <path
                d="M 8,39 L 37,39 C 37,39 39,41 39,42 L 6,42 C 6,41 8,39 8,39 z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Queen Body elegant flared stem */}
              <path
                d="M 12,39 C 12,31 16,23 16,19 L 29,19 C 29,23 33,31 33,39 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Queen Spiked Coronet/Crown */}
              <path
                d="M 13.5,19 L 11,11 L 17,15 L 22.5,9 C 22.5,9 24.5,13 28,15 L 34,11 L 31.5,19 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* Pearls atop the Crown Jewels */}
              <circle cx="11" cy="11" r="1.5" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.8" />
              <circle cx="17" cy="15" r="1.2" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.8" />
              <circle cx="22.5" cy="9"   r="1.8" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.8" />
              <circle cx="28" cy="15" r="1.2" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.8" />
              <circle cx="34" cy="11" r="1.5" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.8" />

              {/* Royal Gold Girdle Banner */}
              <path
                d="M 14,33 C 18,34.5 27,34.5 31,33"
                fill="none"
                stroke={`url(#${accentGradId})`}
                strokeWidth="2.5"
              />
            </g>
          )}

          {pieceType === "k" && (
            <g>
              {/* King Base */}
              <path
                d="M 8,39 L 37,39 C 37,39 39,41 39,42 L 6,42 C 6,41 8,39 8,39 z"
                fill={`url(#${bodyGradId})`}
              />
              {/* King Body thick robust stem */}
              <path
                d="M 12,39 C 12,30 15,22 15,19 L 30,19 C 30,22 33,30 33,39 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* King Crown outline */}
              <path
                d="M 13.5,19 C 13.5,19 12,12 17,11 C 21,10 22.5,13 22.5,13 C 22.5,13 24,10 28,11 C 33,12 31.5,19 31.5,19 Z"
                fill={`url(#${bodyGradId})`}
              />
              {/* King Crown Trim Grid */}
              <path
                d="M 14.5,17 L 30.5,17"
                fill="none"
                stroke={isWhite ? "#929ba6" : "#454b54"}
                strokeWidth="1.2"
              />
              {/* King Golden Crown Jewels Emblem */}
              <circle cx="18.5" cy="14" r="1.5" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.6" />
              <circle cx="22.5" cy="14.5" r="1.5" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.6" />
              <circle cx="26.5" cy="14" r="1.5" fill={`url(#${accentGradId})`} stroke="#111" strokeWidth="0.6" />

              {/* Solid Golden Cross atop the King's Head */}
              <path
                d="M 22.5,11 L 22.5,4 M 19.5,7 L 25.5,7"
                fill="none"
                stroke={`url(#${accentGradId})`}
                strokeWidth="2"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
