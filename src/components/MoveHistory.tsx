import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoveLeft, Trash2, Award, PlayCircle } from "lucide-react";

interface MoveHistoryProps {
  history: string[]; // SAN list of moves made so far (e.g. ['e4', 'e5', 'Nf3'])
  currentTurn: "w" | "b";
  chessStatusText: string;
  isAiThinking: boolean;
  onUndo: () => void;
  onResign: () => void;
  onRestart: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentTurn,
  chessStatusText,
  isAiThinking,
  onUndo,
  onResign,
  onRestart
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group linear history array into pairs [WhiteMove, BlackMove]
  const movePairs: { round: number; w: string; b?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      round: Math.floor(i / 2) + 1,
      w: history[i],
      b: history[i + 1]
    });
  }

  // Scroll to bottom when history grows
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div
      className="flex flex-col p-4 bg-[#1a1a1a] border-4 border-[#00ffff] shadow-[8px_8px_0px_0px_rgba(0,255,255,0.15)] rounded-none text-white h-full justify-between"
      id="arcade-match-status-board"
    >
      <div className="flex flex-col gap-3 min-h-[220px]">
        {/* Header Indicator */}
        <div className="flex justify-between items-center border-b-2 border-[#00ffff]/20 pb-2.5 select-none">
          <span className="font-press-start text-xxs text-[#00ffff] uppercase">
            MOVE LOG
          </span>
          <span className="font-mono text-xs text-zinc-400">
            {history.length} MOVES MADE
          </span>
        </div>

        {/* Live Match Status Bar */}
        <div className="p-2.5 bg-[#262626] border-2 border-[#00ffff] text-center font-press-start leading-relaxed relative shadow-[inset_0_0_8px_rgba(0,255,255,0.1)]">
          <span className="text-[10px] text-[#00ffff] uppercase inline-block animate-pulse">
            {chessStatusText}
          </span>
        </div>

        {/* Move Pairs Log Scroll Table */}
        <div
          ref={scrollRef}
          className="bg-[#0d0d0d] border-2 border-[#00ffff]/30 overflow-y-auto max-h-[190px] h-[190px] p-2 flex flex-col gap-1 font-mono text-xs shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
        >
          {movePairs.length === 0 ? (
            <div className="text-zinc-600 text-center italic py-10 font-press-start text-xxs">
              [GRID BLANK]
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* Header row */}
              <div className="grid grid-cols-3 text-center text-[#00ffff]/60 font-press-start text-[8px] border-b border-[#00ffff]/20 pb-1.5 uppercase select-none font-semibold">
                <span>RND</span>
                <span>WHITE</span>
                <span>BLACK</span>
              </div>
              
              {/* Data rows */}
              {movePairs.map(pair => (
                <div
                  key={`move-rnd-${pair.round}`}
                  className="grid grid-cols-3 text-center border-b border-zinc-900/40 py-1 hover:bg-[#262626]/40 cursor-default select-none transition-colors"
                >
                  <span className="text-[#00ffff] font-press-start text-[8px] flex items-center justify-center">
                    {String(pair.round).padStart(2, '0')}.
                  </span>
                  <span className="text-white font-mono font-bold tracking-wide">{pair.w}</span>
                  <span className="text-[#ff00ff] font-mono font-bold tracking-wide">
                    {pair.b || "..."}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Retro Arcade Control Keypad */}
      <div className="flex flex-col gap-2 mt-4 border-t border-[#00ffff]/20 pt-4">
        <div className="grid grid-cols-2 gap-2 text-xs select-none">
          {/* Back/Undo Action */}
          <Button
            size="sm"
            onClick={onUndo}
            disabled={history.length === 0 || isAiThinking}
            className="bg-[#262626] hover:bg-[#333] text-[#00ffff] border-2 border-[#00ffff] disabled:opacity-40 disabled:border-zinc-800 disabled:text-zinc-600 disabled:bg-[#111] rounded-none font-press-start text-[8px] h-9 cursor-pointer shadow-[2px_2px_0_0_rgba(0,255,255,0.2)] active:translate-y-0.5 select-none"
          >
            <MoveLeft className="w-3.5 h-3.5 pr-0.5" /> UNDO
          </Button>

          {/* Resign / Ragequit Action */}
          <Button
            size="sm"
            onClick={onResign}
            disabled={isAiThinking}
            className="bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-black border-2 border-black rounded-none font-press-start text-[8px] h-9 cursor-pointer shadow-[2px_2px_0_0_#9d009d] active:translate-y-0.5 font-bold select-none"
          >
            <Trash2 className="w-3.5 h-3.5 text-black" /> RESIGN
          </Button>
        </div>

        {/* Restart/Coin Button */}
        <Button
          onClick={onRestart}
          className="w-full bg-[#00ff41] hover:bg-[#00ff41]/85 text-black rounded-none border-2 border-black font-press-start text-[9px] h-10 select-none shadow-[4px_4px_0_#008b23] cursor-pointer flex items-center justify-center gap-1.5 mt-1 font-bold"
        >
          <PlayCircle className="w-4 h-4 text-black" /> INSERT COIN (NEW GAME)
        </Button>
      </div>
    </div>
  );
};
