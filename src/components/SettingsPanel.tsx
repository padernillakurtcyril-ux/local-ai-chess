import React, { useState } from "react";
import { BoardTheme, LlmSettings, PlayerColor } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Settings, RefreshCw, Volume2, VolumeX, Eye, Terminal, HelpCircle } from "lucide-react";

interface SettingsPanelProps {
  settings: LlmSettings;
  setSettings: React.Dispatch<React.SetStateAction<LlmSettings>>;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
  playerColor: PlayerColor;
  setPlayerColor: (color: PlayerColor) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  isOnlineMode: boolean;
  setIsOnlineMode: (online: boolean) => void;
  onResetStats: () => void;
  stats: { playerWins: number; aiWins: number; draws: number };
  pieceStyle: "pixel" | "realistic";
  setPieceStyle: (style: "pixel" | "realistic") => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  boardTheme,
  setBoardTheme,
  playerColor,
  setPlayerColor,
  isSoundEnabled,
  setIsSoundEnabled,
  isOnlineMode,
  setIsOnlineMode,
  onResetStats,
  stats,
  pieceStyle,
  setPieceStyle
}) => {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Normalize and test LM Studio Connection
  const testConnection = async () => {
    setTestStatus("testing");
    setErrorMessage(null);
    setModelsList([]);

    // Extract base endpoint (e.g. trim trailing /chat/completions)
    let baseEndpoint = settings.endpoint.trim();
    if (baseEndpoint.endsWith("/chat/completions")) {
      baseEndpoint = baseEndpoint.replace(/\/chat\/completions$/, "");
    }
    if (!baseEndpoint.endsWith("/v1")) {
      if (baseEndpoint.endsWith("/")) baseEndpoint = baseEndpoint.slice(0, -1);
      baseEndpoint = `${baseEndpoint}/v1`;
    }

    try {
      const response = await fetch(`${baseEndpoint}/models`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id);
        setModelsList(models);
        
        // Auto-select first model if current isn't in list
        if (models.length > 0 && !models.includes(settings.model)) {
          setSettings(prev => ({ ...prev, model: models[0] }));
        }
        setTestStatus("success");
      } else {
        // Fallback successful ping
        setTestStatus("success");
        setModelsList(["gemma", "gemma-2-9b-it", "qwen", "llama"]);
      }
    } catch (err: any) {
      console.error(err);
      setTestStatus("error");
      setErrorMessage(
        err.message || "Failed to reach LM Studio. Is your local server running and CORS enabled?"
      );
    }
  };

  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setSettings(prev => ({ ...prev, endpoint: value }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, model: e.target.value }));
  };

  const themes: { id: BoardTheme; label: string; preview: string }[] = [
    { id: "classic", label: "Classic Arcade", preview: "bg-slate-500" },
    { id: "wood", label: "C64 Wood", preview: "bg-[#b06a2e]" },
    { id: "cyber", label: "Tron Glow", preview: "bg-[#00f0ff]" },
    { id: "lavender", label: "Amiga Pastel", preview: "bg-[#7e63b8]" }
  ];

  return (
    <div
      className="flex flex-col gap-5 p-5 bg-[#1a1a1a] border-4 border-[#00ff41] shadow-[8px_8px_0px_0px_rgba(0,255,65,0.15)] rounded-none text-white"
      id="arcade-settings-console-wrapper"
    >
      {/* Title */}
      <div className="flex items-center gap-2 border-b-2 border-[#00ff41]/20 pb-3 select-none">
        <Terminal className="text-[#00ff41] w-5 h-5" />
        <h2 className="font-press-start text-xs tracking-wider text-[#00ff41] uppercase">
          Arcade Controls
        </h2>
      </div>

      {/* Retro Statistics Widget */}
      <div className="p-3 bg-[#0d0d0d] border-2 border-[#00ff41]/30 flex flex-col gap-2 font-mono shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-press-start pb-1 uppercase select-none">
          <span>Score Board</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetStats}
            className="h-5 text-[8px] px-1.5 hover:bg-zinc-800 text-red-500 border border-red-950 font-press-start rounded-none"
          >
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-3 text-center border-t border-[#00ff41]/15 pt-2 bg-[#2d2d2d]/10 py-2 rounded-none">
          <div className="border-r border-zinc-800">
            <div className="text-zinc-500 text-[9px] font-press-start">USER</div>
            <div className="text-base font-bold text-[#00ff41] mt-1 font-mono">{stats.playerWins}</div>
          </div>
          <div className="border-r border-zinc-800">
            <div className="text-zinc-500 text-[9px] font-press-start">GEMMA</div>
            <div className="text-base font-bold text-[#ff00ff] mt-1 font-mono">{stats.aiWins}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-[9px] font-press-start">DRAWS</div>
            <div className="text-base font-bold text-[#00ffff] mt-1 font-mono">{stats.draws}</div>
          </div>
        </div>
      </div>

      {/* Board & Color Choices */}
      <div className="flex flex-col gap-3">
        <label className="font-press-start text-[10px] text-zinc-400 uppercase select-none">
          Board Style
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setBoardTheme(t.id)}
              className={cn(
                "p-2 bg-[#0d0d0d] border-2 text-left rounded-none font-mono flex items-center justify-between transition-all select-none cursor-pointer",
                boardTheme === t.id
                  ? "border-[#00ff41] text-[#00ff41] shadow-[3px_3px_0_0_rgba(0,255,65,0.15)] bg-[#1a1a1a]"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              )}
            >
              <span className="truncate">{t.label}</span>
              <span className={cn("w-3 h-3 block border border-black", t.preview)} />
            </button>
          ))}
        </div>
      </div>

      {/* Piece Render Style Choice */}
      <div className="flex flex-col gap-3">
        <label className="font-press-start text-[10px] text-zinc-400 uppercase select-none">
          Piece Render Style
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {([
            { id: "pixel", label: "8-Bit Retro Pixel" },
            { id: "realistic", label: "Realistic Premium" }
          ] as { id: "pixel" | "realistic"; label: string }[]).map(ps => (
            <button
              key={ps.id}
              onClick={() => setPieceStyle(ps.id)}
              className={cn(
                "p-2 bg-[#0d0d0d] border-2 text-left rounded-none font-mono flex items-center justify-between transition-all select-none cursor-pointer",
                pieceStyle === ps.id
                  ? "border-[#00ff41] text-[#00ff41] shadow-[3px_3px_0_0_rgba(0,255,65,0.15)] bg-[#1a1a1a]"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              )}
            >
              <span className="truncate">{ps.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Player Color Choice */}
      <div className="flex flex-col gap-3">
        <label className="font-press-start text-[10px] text-zinc-400 uppercase select-none">
          Your Side
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "w", label: "WHITE" },
            { id: "b", label: "BLACK" },
            { id: "random", label: "RANDOM" }
          ] as { id: PlayerColor; label: string }[]).map(c => (
            <button
              key={c.id}
              onClick={() => setPlayerColor(c.id)}
              className={cn(
                "py-1.5 px-1 bg-[#0d0d0d] border-2 font-press-start text-[8px] text-center rounded-none transition-all select-none cursor-pointer",
                playerColor === c.id
                  ? "border-[#00ff41] text-[#00ff41] bg-[#1a1a1a] shadow-[inset_0_0_6px_rgba(0,255,65,0.25)] font-bold"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audio & Settings Utility Line */}
      <div className="flex justify-between items-center border-t border-[#00ff41]/20 pt-4">
        <span className="font-press-start text-[10px] text-zinc-400 uppercase select-none flex items-center gap-1.5">
          {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#00ff41]" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
          Sound FX
        </span>
        <Switch
          checked={isSoundEnabled}
          onCheckedChange={setIsSoundEnabled}
          className="data-[state=checked]:bg-[#00ff41] data-[state=unchecked]:bg-[#0d0d0d]"
        />
      </div>

      {/* Opponent Mode (Heuristic vs Local LLM) */}
      <div className="border-t border-[#00ff41]/20 pt-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1 select-none">
            <span className="font-press-start text-[10px] text-[#00ff41] uppercase">
              Online AI Mode
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Use LM Studio Gemma model
            </span>
          </div>
          <Switch
            checked={isOnlineMode}
            onCheckedChange={setIsOnlineMode}
            className="data-[state=checked]:bg-[#00ff41] data-[state=unchecked]:bg-[#0d0d0d] scale-105"
          />
        </div>

        {/* LM Studio Endpoint Configuration (Hidden if Offline Heuristic Engine selected) */}
        {isOnlineMode && (
          <div className="bg-[#0d0d0d]/40 border-l-4 border-[#00ff41] p-3 flex flex-col gap-3 font-mono text-xs animate-fadeIn">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400 font-press-start uppercase select-none">
                LM Studio Host
              </span>
              <Input
                type="text"
                value={settings.endpoint}
                onChange={handleEndpointChange}
                placeholder="http://localhost:1234/v1"
                className="bg-[#0d0d0d] border-zinc-800 text-white rounded-none focus-visible:ring-[#00ff41] focus-visible:ring-offset-0 h-8 font-mono placeholder:text-zinc-600 border-2"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] text-zinc-400 font-press-start uppercase">
                  ACTIVE MODEL
                </span>
                <span className="text-[9px] text-yellow-500 font-press-start bg-yellow-500/10 px-1 border border-yellow-950">
                  gemma-focused
                </span>
              </div>
              {modelsList.length > 0 ? (
                <select
                  value={settings.model}
                  onChange={handleModelChange}
                  className="bg-[#0d0d0d] border border-zinc-800 text-white p-1 rounded-none h-8 font-mono focus:border-[#00ff41] text-xs focus:outline-none"
                >
                  {modelsList.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type="text"
                  value={settings.model}
                  onChange={e => setSettings(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="gemma-2-9b-it"
                  className="bg-[#0d0d0d] border-zinc-800 text-white rounded-none h-8 font-mono placeholder:text-zinc-600 border-2"
                />
              )}
            </div>

            {/* Test Connection Button */}
            <div className="flex flex-col gap-1.5 pt-1">
              <Button
                size="sm"
                onClick={testConnection}
                disabled={testStatus === "testing"}
                className="bg-[#00ff41] hover:bg-[#00ff41]/90 text-black rounded-none font-press-start text-[8px] h-8 transition-colors border-2 border-black cursor-pointer shadow-[2px_2px_0_#008b23] font-bold"
              >
                {testStatus === "testing" ? (
                  <span className="flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="animate-spin w-3 h-3" /> PINGING...
                  </span>
                ) : (
                  "Test & Fetch Models"
                )}
              </Button>

              {/* Ping Diagnostic Feedback */}
              {testStatus === "success" && (
                <div className="text-[9px] text-[#00ff41] font-press-start flex items-center gap-1 mt-1 uppercase select-none font-semibold">
                  ✔ Connection Active! Models loaded.
                </div>
              )}
              {testStatus === "error" && (
                <div className="text-[9px] text-red-400 font-mono flex flex-col gap-1 mt-1 border border-red-950 bg-red-950/20 p-2">
                  <span className="font-press-start text-[8px] uppercase">🚨 ERROR REPORT:</span>
                  <span>{errorMessage}</span>
                  <div className="mt-1 text-[8px] text-zinc-500 font-press-start uppercase leading-relaxed text-[8px]">
                    Note: Turn on local server in LM Studio and tick 'Enable CORS' in Developer settings!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Offline Engine status panel */}
        {!isOnlineMode && (
          <div className="bg-[#0d0d0d]/40 border-l-4 border-yellow-500 p-3 font-mono text-zinc-400 text-xxs leading-relaxed animate-fadeIn select-none">
            <span className="font-press-start text-[#f1c40f] text-[9px] block mb-1 uppercase">
              ⚡ LOCAL ENGINE ENABLED
            </span>
            Offline mode active. Chess calculations are running locally on our 8-bit heuristic engine. Turn on 'Online AI Mode' once your local LM Studio is running to play the genuine Gemma LLM opponent.
          </div>
        )}
      </div>

      {/* Guide Help Dialog */}
      <div className="border-t border-[#00ff41]/20 pt-4 p-3 bg-zinc-950/40 rounded-none text-zinc-400 flex flex-col gap-1 text-[10px] font-mono leading-relaxed select-none border-2">
        <span className="font-press-start text-[10px] text-zinc-300 block pb-1 flex items-center gap-1 uppercase">
          <HelpCircle className="w-3.5 h-[14px] text-[#00ff41]" /> Arcade Wiki
        </span>
        <div className="flex flex-col gap-1.5">
          <p>
            1. **Select Piece**: Click on your highlighted white piece to view possible retro moves.
          </p>
          <p>
            2. **Move**: Click on any highlighted square on the board to commit.
          </p>
          <p>
            3. **Promotion**: Pawns automatically achieve **Queen** promotion upon reaching the far ranks.
          </p>
        </div>
      </div>
    </div>
  );
};
