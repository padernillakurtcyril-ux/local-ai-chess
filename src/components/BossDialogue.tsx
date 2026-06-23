import React, { useState, useEffect } from "react";
import { BossProfile, RetroEmotion, ChatMessage } from "../types";
import { RetroAvatar } from "./RetroAvatar";
import { cn } from "@/lib/utils";
import { Terminal, Bot, ShieldAlert } from "lucide-react";

interface BossDialogueProps {
  boss: BossProfile;
  currentEmotion: RetroEmotion;
  currentDialogueText: string;
  isThinking: boolean;
  gameStatus: string;
}

export const BossDialogue: React.FC<BossDialogueProps> = ({
  boss,
  currentEmotion,
  currentDialogueText,
  isThinking,
  gameStatus
}) => {
  const [typedText, setTypedText] = useState("");

  // Simple NES-style typing effect for the dialog bubble
  useEffect(() => {
    let active = true;
    setTypedText("");
    
    let index = 0;
    const interval = setInterval(() => {
      if (!active) return;
      if (index < currentDialogueText.length) {
        setTypedText(prev => prev + currentDialogueText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25); // Speeds: 25ms per pixel character feels highly retro!

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [currentDialogueText]);

  // Determine difficulty color badge
  const activeDifficultyStyle = {
    Apprentice: "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5",
    Challenger: "border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff]/5",
    Sovereign: "border-[#00ffff] text-[#00ffff] bg-[#00ffff]/5"
  }[boss.difficulty];

  return (
    <div
      className="flex flex-col md:flex-row gap-5 p-4 bg-[#1a1a1a] border-4 border-[#00ff41] shadow-[8px_8px_0px_0px_rgba(0,255,65,0.15)] rounded-none text-white relative items-stretch"
      id="arcade-ai-dialogue-screen"
    >
      {/* Boss Character Details / Portrait Card */}
      <div className="flex flex-row md:flex-col items-center gap-4 text-center md:border-r border-[#00ff41]/20 md:pr-4 md:min-w-[170px] justify-center md:justify-start">
        {/* The dynamic 8-bit Avatar */}
        <div className="relative p-1 border-2 border-[#00ff41] bg-[#0d0d0d] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,255,65,0.1)]">
          <RetroAvatar
            bossId={boss.id as any}
            emotion={currentEmotion}
            size={80}
            className="crt-flicker-anim"
          />
          {/* Active Status Ring (pulsing dot) */}
          <div className="absolute top-1.5 right-1.5 flex h-3 w-3 select-none">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              isThinking ? "bg-[#ff00ff]" : "bg-[#00ff41]"
            )}></span>
            <span className={cn(
              "relative inline-flex rounded-full h-3 w-3",
              isThinking ? "bg-[#ff00ff]" : "bg-[#00ff41]"
            )}></span>
          </div>
        </div>

        {/* Boss Names & Difficulty Badge */}
        <div className="flex flex-col items-start md:items-center gap-1">
          <h3 className="font-press-start text-[11px] leading-tight text-yellow-400 select-none">
            {boss.name}
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono tracking-wide select-none uppercase">
            {boss.title}
          </span>
          <span className={cn("px-2 py-0.5 border text-[8px] font-press-start mt-1 leading-none uppercase", activeDifficultyStyle)}>
            {boss.difficulty}
          </span>
        </div>
      </div>

      {/* Retro RPG Dialogue Box (Pixel Styled Bubble) */}
      <div className="flex-1 flex flex-col justify-between p-3 border-2 border-[#00ff41] bg-[#0d0d0d] rounded-none relative crt-screen">
        <div className="flex flex-col gap-2">
          {/* Box Header Label */}
          <div className="flex items-center gap-1.5 select-none pb-1.5 border-b border-[#00ff41]/20">
            <Bot className="text-[#00ff41] w-3.5 h-3.5" />
            <span className="font-press-start text-[8px] text-[#00ff41] uppercase">
              OPPONENT BROADCAST
            </span>
          </div>

          {/* Scrolling Dialog Text */}
          <div className="min-h-[52px] flex items-start text-xs font-press-start leading-relaxed text-[#00ff41] relative py-1">
            <span className="whitespace-pre-line tracking-wide">
              {isThinking && typedText.length === 0 ? (
                <span className="text-[#ff00ff] italic">Thinking... Scanning grid coordinates...</span>
              ) : (
                typedText
              )}
            </span>
            {/* Blinking Prompt Cursor (classic retro prompt arrow) */}
            {!isThinking && (
              <span className="inline-block w-2.5 h-3.5 bg-[#00ff41] ml-1.5 animate-bounce rounded-none select-none" />
            )}
          </div>
        </div>

        {/* Emotion status message */}
        <div className="flex justify-between items-center text-[8px] font-press-start text-zinc-500 border-t border-[#00ff41]/20 pt-2 select-none">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#ff00ff]" /> STATE: <span className="text-zinc-300">{currentEmotion.toUpperCase()}</span>
          </span>
          <span>CHESS-ARCADE v1.1</span>
        </div>
      </div>
    </div>
  );
};
