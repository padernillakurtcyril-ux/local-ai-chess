export type BoardTheme = "classic" | "wood" | "cyber" | "lavender";

export type PlayerColor = "w" | "b" | "random";

export type GameStatus =
  | "setup"
  | "playing"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "insufficient"
  | "threefold";

export type RetroEmotion =
  | "normal"
  | "thinking"
  | "smug"
  | "happy"
  | "nervous"
  | "angry"
  | "defeated";

export interface ChatMessage {
  id: string;
  sender: "player" | "ai" | "system";
  text: string;
  emotion?: RetroEmotion;
  timestamp: Date;
}

export interface BossProfile {
  id: string;
  name: string;
  title: string;
  difficulty: "Apprentice" | "Challenger" | "Sovereign";
  avatarColor: string;
  systemPrompt: string;
  description: string;
  colorHex: string;
  pieceStyle: "w" | "b"; // Pieces they want to play as (defaults)
  minTemp: number;
  maxTokens: number;
}

export interface LlmSettings {
  endpoint: string; // e.g. http://localhost:1234/v1/chat/completions
  model: string;    // e.g. gemma-2-9b-it
  temperature: number;
  autoMove: boolean; // If true, make move automatically when possible
}

export interface GameStats {
  playerWins: number;
  aiWins: number;
  draws: number;
}
