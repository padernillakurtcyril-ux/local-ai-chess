import { useState, useEffect, useCallback, useRef } from "react";
import { Chess, Square } from "chess.js";
import { BOSSES, getOfflineComment } from "./bossData";
import { calculateHeuristicMove } from "./lib/chessEngine";
import { sounds } from "./lib/sounds";
import { ChessBoard } from "./components/ChessBoard";
import { SettingsPanel } from "./components/SettingsPanel";
import { BossDialogue } from "./components/BossDialogue";
import { MoveHistory } from "./components/MoveHistory";
import { BossProfile, BoardTheme, LlmSettings, RetroEmotion, PlayerColor } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trophy, HelpCircle, Flame, Swords, Cpu, Settings, MessageSquare, Joystick, Coins, Zap, ShieldAlert, Crosshair } from "lucide-react";

// Helper to manually shift active turn in FEN string for pure shooter logic
const flipFenTurn = (fenStr: string): string => {
  const parts = fenStr.split(" ");
  parts[1] = parts[1] === "w" ? "b" : "w";
  return parts.join(" ");
};

const PIECE_MAX_HP = {
  p: 2,
  n: 4,
  b: 4,
  r: 5,
  q: 8,
  k: 12
};

const initializeHpState = (board: any[][]) => {
  const hp: Record<string, number> = {};
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        hp[p.square] = PIECE_MAX_HP[p.type as keyof typeof PIECE_MAX_HP] || 2;
      }
    }
  }
  return hp;
};

export default function App() {
  // --- Game Core States ---
  const [chess, setChess] = useState(() => new Chess());
  const [fen, setFen] = useState(() => chess.fen());
  const [history, setHistory] = useState<string[]>(() => []);
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [activePlayerColor, setActivePlayerColor] = useState<"w" | "b">("w"); // Resolved color for current game matching 'random' choices
  
  // --- RPG & Shootout Adventure Mechanics ---
  const [combatMode, setCombatMode] = useState<"chess" | "gun">("chess");
  const [gold, setGold] = useState(200);
  const [weaponsDmgUpgrade, setWeaponsDmgUpgrade] = useState(0);
  const [playerAmmo, setPlayerAmmo] = useState({ p: 3, n: 1, b: 2, r: 1, q: 1, k: 999 });
  const [piecesHp, setPiecesHp] = useState<Record<string, number>>(() => initializeHpState(chess.board()));
  const piecesHpRef = useRef<Record<string, number>>(piecesHp);
  useEffect(() => {
    piecesHpRef.current = piecesHp;
  }, [piecesHp]);
  const [laserTracer, setLaserTracer] = useState<{ from: string; to: string; color: string } | null>(null);

  // --- Tab Panels State switcher ---
  const [activeTab, setActiveTab] = useState<"log" | "boss" | "shop" | "settings">("log");
  
  // --- Visual & Theming States ---
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("cyber");
  const [pieceStyle, setPieceStyle] = useState<"pixel" | "realistic">("realistic");
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // --- Boss Chat & Face Mood States ---
  const [selectedBoss, setSelectedBoss] = useState<BossProfile>(BOSSES[0]);
  const [currentEmotion, setCurrentEmotion] = useState<RetroEmotion>("normal");
  const [currentDialogue, setCurrentDialogue] = useState<string>("");

  // --- LLM Model Connectivity settings ---
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [llmSettings, setLlmSettings] = useState<LlmSettings>({
    endpoint: "http://localhost:1234",
    model: "gemma-2-9b-it",
    temperature: 0.7,
    autoMove: true
  });
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Statistics state ---
  const [stats, setStats] = useState({
    playerWins: 0,
    aiWins: 0,
    draws: 0
  });

  // Load stats & selections from localStorage on boot
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem("retro_chess_stats");
      if (storedStats) setStats(JSON.parse(storedStats));

      const storedTheme = localStorage.getItem("retro_chess_theme");
      if (storedTheme) setBoardTheme(storedTheme as BoardTheme);

      const storedPieceStyle = localStorage.getItem("retro_chess_piece_style");
      if (storedPieceStyle) setPieceStyle(storedPieceStyle as "pixel" | "realistic");

      const storedSound = localStorage.getItem("retro_chess_sound");
      if (storedSound) {
        const soundState = storedSound === "true";
        setIsSoundEnabled(soundState);
        sounds.toggle(soundState);
      }
    } catch (e) {
      console.warn("Storage reading failed:", e);
    }
  }, []);

  // Save stats or settings whenever change happens
  useEffect(() => {
    localStorage.setItem("retro_chess_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("retro_chess_theme", boardTheme);
  }, [boardTheme]);

  useEffect(() => {
    localStorage.setItem("retro_chess_piece_style", pieceStyle);
  }, [pieceStyle]);

  useEffect(() => {
    localStorage.setItem("retro_chess_sound", String(isSoundEnabled));
    sounds.toggle(isSoundEnabled);
  }, [isSoundEnabled]);

  // Welcome introductory dialog when switching bosses or starting game
  useEffect(() => {
    const introKey = "start";
    setCurrentDialogue(getOfflineComment(selectedBoss.id, introKey));
    setCurrentEmotion("normal");
  }, [selectedBoss]);

  // Determine game statuses descriptions
  const getChessStatusText = () => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === "w" ? "Black" : "White";
      return `CHECKMATE! ${winner.toUpperCase()} VICTORIOUS!`;
    }
    if (chess.isDraw()) {
      if (chess.isStalemate()) return "DRAW BY STALEMATE!";
      if (chess.isThreefoldRepetition()) return "DRAW BY REPETITION!";
      if (chess.isInsufficientMaterial()) return "DRAW BY INSUFFICIENT MATERIAL!";
      return "DRAW MATCH!";
    }
    if (chess.inCheck()) {
      const activeSide = chess.turn() === "w" ? "White" : "Black";
      return `${activeSide.toUpperCase()} IS IN CHECK!`;
    }
    
    const turnVal = chess.turn() === "w" ? "WHITE's turn" : "GEMMA's turn";
    if (chess.turn() === activePlayerColor) {
      return `YOUR TURN - MAKE YOUR MOVE`;
    }
    return `GEMMA AI THINKING...`;
  };

  // Safe Multi-Method parser to extract algebraic chess moves from LLM strings
  const parseLlmOutput = (outputContent: string, legalMoves: string[]): { move: string; comment: string } => {
    const cleanOutput = outputContent.replace(/\\n/g, "\n").trim();
    
    // Strategy 1: Attempt perfect JSON block parsing
    try {
      const jsonMatch = cleanOutput.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         if (parsed && typeof parsed.move === "string") {
           // Verify moves list is matching
           const matchedMove = legalMoves.find(m => m.toLowerCase() === parsed.move.trim().toLowerCase());
           if (matchedMove) {
             return {
               move: matchedMove,
               comment: parsed.comment || "Executed computation cycle."
             };
           }
         }
      }
    } catch (e) {
      // JSON parse failed, cascade to next parser
    }

    // Strategy 2: Scan for any word that exactly matches active legal algebraic moves
    // Sorting by descending string length ensures longer strings like "Nxd4" match before "d4"
    const sortedMoves = [...legalMoves].sort((a,b) => b.length - a.length);
    for (const testMove of sortedMoves) {
       // Search bounds for words matching move notation (avoiding matching subwords or noise if possible)
       const escapedMove = testMove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       const regex = new RegExp(`\\b${escapedMove}\\b`, "i");
       if (regex.test(cleanOutput) || cleanOutput.includes(testMove)) {
         return {
           move: testMove,
           comment: "I locked onto this coordinate!"
         };
       }
    }

    // Strategy 3: Heuristic fallback
    return {
      move: legalMoves[0],
      comment: "Zipping through secondary calculations!"
    };
  };

  // Perform AI chess move calculation and execute turn state changes
  const handleAiTurn = useCallback(async (currentFen: string, currentHistory: string[]) => {
    setIsAiThinking(true);
    setCurrentEmotion("thinking");

    const activeChess = new Chess(currentFen);
    const legalMoves = activeChess.moves();
    const aiColor = activePlayerColor === "w" ? "b" : "w";

    // Failsafe exit in case game is already completed
    if (legalMoves.length === 0 || activeChess.isGameOver()) {
       setIsAiThinking(false);
       setCurrentEmotion("normal");
       return;
    }

    // --- ENEMY ADVENTURE GUN SNIPER CALCULATION ---
    const board = activeChess.board();
    const aiSniperTargets: { from: string; to: string; type: string }[] = [];

    const getCoord = (colIndex: number, rowIndex: number) => {
      if (colIndex >= 0 && colIndex < 8 && rowIndex >= 0 && rowIndex < 8) {
        return `${["a", "b", "c", "d", "e", "f", "g", "h"][colIndex]}${["8", "7", "6", "5", "4", "3", "2", "1"][rowIndex]}`;
      }
      return null;
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === aiColor) {
          const sq = piece.square;
          const possibleTargets: string[] = [];

          if (piece.type === "p") {
            const dir = aiColor === "w" ? 1 : -1;
            for (let d = 1; d <= 2; d++) {
              const t1 = getCoord(c, r + d * dir); if (t1) possibleTargets.push(t1);
              const t2 = getCoord(c - d, r + d * dir); if (t2) possibleTargets.push(t2);
              const t3 = getCoord(c + d, r + d * dir); if (t3) possibleTargets.push(t3);
            }
          } else if (piece.type === "n") {
            const leaps = [
              [-2, -1], [-2, 1], [-1, -2], [-1, 2],
              [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            leaps.forEach(([dc, dr]) => {
              const t = getCoord(c + dc, r + dr);
              if (t) possibleTargets.push(t);
            });
          } else if (piece.type === "b" || piece.type === "q") {
            const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            dirs.forEach(([dc, dr]) => {
              for (let i = 1; i < 8; i++) {
                const t = getCoord(c + dc * i, r + dr * i);
                if (!t) break;
                possibleTargets.push(t);
                if (activeChess.get(t as Square)) break;
              }
            });
          }
          if (piece.type === "r" || piece.type === "q") {
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            dirs.forEach(([dc, dr]) => {
              for (let i = 1; i < 8; i++) {
                const t = getCoord(c + dc * i, r + dr * i);
                if (!t) break;
                possibleTargets.push(t);
                if (activeChess.get(t as Square)) break;
              }
            });
          }
          if (piece.type === "k") {
            for (let dc = -1; dc <= 1; dc++) {
              for (let dr = -1; dr <= 1; dr++) {
                if (dc !== 0 || dr !== 0) {
                  const t = getCoord(c + dc, r + dr);
                  if (t) possibleTargets.push(t);
                }
              }
            }
          }

          possibleTargets.forEach(tSquare => {
            const defender = activeChess.get(tSquare as Square);
            if (defender && defender.color === activePlayerColor) {
              aiSniperTargets.push({ from: sq, to: tSquare, type: piece.type });
            }
          });
        }
      }
    }

    // Heuristics decision to fire weapon
    const shootPercentage = selectedBoss.difficulty === "Apprentice" ? 0.20 : selectedBoss.difficulty === "Challenger" ? 0.35 : 0.50;
    if (aiSniperTargets.length > 0 && Math.random() < shootPercentage) {
      // Find priority target
      const priorityTarget = aiSniperTargets.find(t => {
        const p = activeChess.get(t.to as Square);
        return p && (p.type === "k" || p.type === "q");
      }) || aiSniperTargets[Math.floor(Math.random() * aiSniperTargets.length)];

      const shooterType = priorityTarget.type;
      const targetSquare = priorityTarget.to;
      const defenderPiece = activeChess.get(targetSquare as Square);

      if (defenderPiece) {
        // Aesthetic target pause
        await new Promise(resolve => setTimeout(resolve, 1400));

        setLaserTracer({ from: priorityTarget.from, to: targetSquare, color: "#00ffff" });
        setTimeout(() => setLaserTracer(null), 400);

        sounds.playLaser();

        const baseDmgMap = { p: 2, n: 4, b: 3, r: 5, q: 6, k: 2 };
        const dmg = baseDmgMap[shooterType as keyof typeof baseDmgMap] || 2;

        const currentHp = piecesHpRef.current[targetSquare] !== undefined ? piecesHpRef.current[targetSquare] : 2;
        const newHp = currentHp - dmg;

        setPiecesHp(prev => {
          const next = { ...prev };
          if (newHp <= 0) {
            delete next[targetSquare];
          } else {
            next[targetSquare] = newHp;
          }
          return next;
        });

        if (newHp <= 0) {
          if (defenderPiece.type === "k") {
            setStats(prev => ({ ...prev, aiWins: prev.aiWins + 1 }));
            sounds.playDefeat();
            setCurrentDialogue(`[RPG ELIMINATION] Direct hit! My ${shooterType.toUpperCase()} weapon completely evaporated your King! SIMULATION COMPLETED!`);
            setCurrentEmotion("smug");
            setIsAiThinking(false);
            return;
          } else {
            activeChess.remove(targetSquare as Square);
            const flippedFen = flipFenTurn(activeChess.fen());
            activeChess.load(flippedFen);
            setChess(activeChess);
            setFen(flippedFen);
            setHistory(activeChess.history());

            sounds.playExplosion();
            setCurrentDialogue(`[RPG BLAST!] My ${shooterType.toUpperCase()} sniper locked onto your ${defenderPiece.type.toUpperCase()} and reduced it to digital ash! Ahaha!`);
            setCurrentEmotion("smug");
          }
        } else {
          const flippedFen = flipFenTurn(activeChess.fen());
          activeChess.load(flippedFen);
          setChess(activeChess);
          setFen(flippedFen);
          setHistory(activeChess.history());

          sounds.playCapture();
          setCurrentDialogue(`[RPG HIT!] My ${shooterType.toUpperCase()} weapon fired at your ${defenderPiece.type.toUpperCase()}! Dealt ${dmg} damage. It has ${newHp} HP remaining!`);
          setCurrentEmotion("smug");
        }

        setIsAiThinking(false);
        return; // spent turn shooting, skip standard chess calculations
      }
    }

    let nextMoveSan = "";
    let aiComment = "";

    if (isOnlineMode) {
      // --- LM Studio API request flow ---
      let normalizedEndpoint = llmSettings.endpoint.trim();
      if (!normalizedEndpoint.endsWith("/v1/chat/completions")) {
        if (normalizedEndpoint.endsWith("/")) normalizedEndpoint = normalizedEndpoint.slice(0, -1);
        if (!normalizedEndpoint.endsWith("/v1")) normalizedEndpoint = `${normalizedEndpoint}/v1`;
        normalizedEndpoint = `${normalizedEndpoint}/chat/completions`;
      }

      // Generate instructions matching our boss profiles
      const currentHistoryString = currentHistory.join(", ");
      const systemPrompt = selectedBoss.systemPrompt;
      const userPrompt = `The chess board status in FEN: "${currentFen}"
History tracking: ${currentHistoryString || "None (Game initialized)"}
YOUR VALIDS MOVES LIST: ${JSON.stringify(legalMoves)}

You must select exactly ONE move from this list: ${JSON.stringify(legalMoves)}.
Any other chess notation not in that list is STRICTLY FORBIDDEN and constitutes a software warning!

Format your response in this exact JSON block and nothing else:
{
  "move": "one legal move SAN",
  "comment": "your quick arcade line (15 words or less)"
}
`;

      try {
        const response = await fetch(normalizedEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: llmSettings.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: llmSettings.temperature,
            max_tokens: selectedBoss.maxTokens
          })
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        const outputText = data.choices[0].message.content;
        
        const parseResults = parseLlmOutput(outputText, legalMoves);
        nextMoveSan = parseResults.move;
        aiComment = parseResults.comment;

      } catch (err: any) {
        console.error("LM Studio error context:", err);
        // Seamless fallback to heuristic engine to prevent blocking the game!
        nextMoveSan = calculateHeuristicMove(currentFen, selectedBoss.difficulty);
        aiComment = "Bypassing server exception! Commencing matrix recalculation!";
      }

    } else {
      // --- Offline Heuristic engine thinking delay ---
      const delayMs = 1200 + Math.random() * 1200; // 1.2s to 2.4s thinking delay feels natural
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      nextMoveSan = calculateHeuristicMove(currentFen, selectedBoss.difficulty);
      
      // Determine appropriate dialogue category based on move impact
      const tempChess = new Chess(currentFen);
      const moveDetails = tempChess.history({ verbose: true });
      
      const testChess = new Chess(currentFen);
      const executed = testChess.move(nextMoveSan);
      
      let dialogCategory: "normal" | "capture" | "check" = "normal";
      if (executed.captured) {
        dialogCategory = "capture";
      } else if (testChess.inCheck()) {
        dialogCategory = "check";
      }

      aiComment = getOfflineComment(selectedBoss.id, dialogCategory);
    }

    // Commit Move
    try {
      const updatedChess = new Chess(currentFen);
      const moveObj = updatedChess.move(nextMoveSan);
      
      // Sync State
      setChess(updatedChess);
      setFen(updatedChess.fen());
      setHistory(updatedChess.history());

      // Carry over HP of moving AI piece and clear from origin
      setPiecesHp(prev => {
        const next = { ...prev };
        const fromSq = moveObj.from;
        const toSq = moveObj.to;
        if (next[fromSq] !== undefined) {
          next[toSq] = next[fromSq];
          delete next[fromSq];
        } else {
          next[toSq] = PIECE_MAX_HP[moveObj.piece as keyof typeof PIECE_MAX_HP] || 2;
        }
        return next;
      });

      // Trigger SFX
      if (moveObj.captured) {
        sounds.playCapture();
        setCurrentEmotion("smug"); // Smug face when capturing player piece
      } else if (updatedChess.inCheck()) {
        sounds.playCheck();
        setCurrentEmotion("smug");
      } else {
        sounds.playMove();
        setCurrentEmotion("normal");
      }

      // Check for Game Completion
      if (updatedChess.isGameOver()) {
        handleGameEndStates(updatedChess);
      } else {
        // Human's turn has arrived
        if (updatedChess.inCheck()) {
          // If human is placed in check
          setCurrentDialogue(`${aiComment} [CHECK!]`);
        } else {
          setCurrentDialogue(aiComment);
        }
      }

    } catch (err) {
      console.error("Failed executing calculated AI move:", err);
      // Fallback
      const resetChess = new Chess(currentFen);
      const randMove = legalMoves[0];
      resetChess.move(randMove);
      setChess(resetChess);
      setFen(resetChess.fen());
      setHistory(resetChess.history());
      sounds.playMove();
      setCurrentDialogue("Failsafe activated. Standard tactical alignment completed.");
      setCurrentEmotion("normal");
    } finally {
      setIsAiThinking(false);
    }
  }, [selectedBoss, isOnlineMode, llmSettings, activePlayerColor]);

  // Handle Game End evaluation and scoring
  const handleGameEndStates = (gameInstance: Chess) => {
    if (gameInstance.isCheckmate()) {
      const loserColor = gameInstance.turn();
      const aiColor = activePlayerColor === "w" ? "b" : "w";
      
      if (loserColor === aiColor) {
        // Player Wins! AI is defeated
        setStats(prev => ({ ...prev, playerWins: prev.playerWins + 1 }));
        sounds.playVictory();
        setCurrentDialogue(getOfflineComment(selectedBoss.id, "defeated"));
        setCurrentEmotion("defeated");
      } else {
        // AI Wins
        setStats(prev => ({ ...prev, aiWins: prev.aiWins + 1 }));
        sounds.playDefeat();
        setCurrentDialogue(getOfflineComment(selectedBoss.id, "win"));
        setCurrentEmotion("smug");
      }
    } else {
      // Draw Match
      setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
      sounds.playMove();
      setCurrentDialogue("Tactical tie detected. The simulation has resolved as a draw.");
      setCurrentEmotion("normal");
    }
  };

  // Move trigger invoked by human clicking squares
  const handlePlayerMove = useCallback((from: string, to: string) => {
    if (isAiThinking) return;

    try {
      const nextChess = new Chess(fen);
      
      // Validate promotion automatically to Queen to keep interface arcade-friendly
      const isPromotion = nextChess.moves({ verbose: true }).some(
        m => m.from === from && m.to === to && m.flags.includes("p")
      );

      const moveObj = nextChess.move({
        from: from as Square,
        to: to as Square,
        promotion: isPromotion ? "q" : undefined
      });

      // Commit Move
      setChess(nextChess);
      const newFen = nextChess.fen();
      const newHistory = nextChess.history();
      setFen(newFen);
      setHistory(newHistory);

      // Carry over HP of moving piece and clear from origin
      setPiecesHp(prev => {
        const next = { ...prev };
        if (next[from] !== undefined) {
          next[to] = next[from];
          delete next[from];
        } else {
          const p = nextChess.get(to as Square);
          if (p) {
            next[to] = PIECE_MAX_HP[p.type as keyof typeof PIECE_MAX_HP] || 2;
          }
        }
        return next;
      });

      // Play matching sounds
      if (moveObj.captured) {
        let reward = 100;
        if (moveObj.captured === "q") reward = 700;
        else if (moveObj.captured === "r") reward = 400;
        else if (moveObj.captured === "n" || moveObj.captured === "b") reward = 250;
        setGold(prev => prev + reward);

        sounds.playCapture();
        setCurrentEmotion("angry"); // Angry when you capture their piece!
        setCurrentDialogue(getOfflineComment(selectedBoss.id, "underAttack") + ` [+🪙${reward} GP]`);
      } else if (nextChess.inCheck()) {
        sounds.playCheck();
        setCurrentEmotion("nervous"); // Nervous face when you place AI in Check
        setCurrentDialogue(getOfflineComment(selectedBoss.id, "check"));
      } else {
        sounds.playMove();
        setCurrentEmotion("normal");
      }

      // Check if Player's move ended the game
      if (nextChess.isGameOver()) {
        handleGameEndStates(nextChess);
      } else {
        // Trigger AI's response turn recursively
        handleAiTurn(newFen, newHistory);
      }

    } catch (e) {
      console.warn("Invalid attempt: ignored square move trigger.");
    }
  }, [fen, isAiThinking, handleAiTurn, selectedBoss]);

  // Handle Player Triggered Weapon Shootout Action
  const handlePlayerShoot = useCallback((from: string, to: string) => {
    if (isAiThinking) return;

    const currentChessInstance = new Chess(fen);
    const attacker = currentChessInstance.get(from as Square);
    const victim = currentChessInstance.get(to as Square);
    if (!attacker || !victim) return;

    // Deduct Ammo
    setPlayerAmmo(prev => ({
      ...prev,
      [attacker.type]: Math.max(0, prev[attacker.type as keyof typeof prev] - 1)
    }));

    // Draw Laser Ray Tracer
    setLaserTracer({ from, to, color: "#ff00ff" });
    setTimeout(() => setLaserTracer(null), 400);

    sounds.playLaser();

    const baseDmgMap = { p: 2, n: 4, b: 3, r: 5, q: 6, k: 2 };
    const dmg = (baseDmgMap[attacker.type as keyof typeof baseDmgMap] || 2) + weaponsDmgUpgrade;

    const currentHp = piecesHpRef.current[to] !== undefined ? piecesHpRef.current[to] : 2;
    const newHp = currentHp - dmg;

    setPiecesHp(prev => {
      const next = { ...prev };
      if (newHp <= 0) {
        delete next[to];
      } else {
        next[to] = newHp;
      }
      return next;
    });

    const nextChess = new Chess(fen);

    if (newHp <= 0) {
      let reward = 100;
      if (victim.type === "q") reward = 700;
      else if (victim.type === "r") reward = 400;
      else if (victim.type === "n" || victim.type === "b") reward = 250;
      setGold(prev => prev + reward);

      if (victim.type === "k") {
        setStats(prev => ({ ...prev, playerWins: prev.playerWins + 1 }));
        sounds.playVictory();
        setCurrentDialogue(`[RPG CRITICAL KILL] Your ${attacker.type.toUpperCase()} weapon absolutely vaporized my King! I have been defeated! [+🪙${reward} GP]`);
        setCurrentEmotion("defeated");
        return;
      } else {
        nextChess.remove(to as Square);
        const flipped = flipFenTurn(nextChess.fen());
        const reloadedChess = new Chess(flipped);
        setChess(reloadedChess);
        setFen(flipped);
        setHistory(reloadedChess.history());

        sounds.playExplosion();
        setCurrentDialogue(`[BLASTED!] Your ${attacker.type === "p" ? "Pistol" : attacker.type === "n" ? "Shotgun" : attacker.type === "b" ? "Railgun" : attacker.type === "r" ? "RPG Launcher" : "BFG"} obliterated my ${victim.type.toUpperCase()}! Direct hit! [+🪙${reward} GP]`);
        setCurrentEmotion("angry");

        setCombatMode("chess");
        handleAiTurn(flipped, reloadedChess.history());
      }
    } else {
      const flipped = flipFenTurn(nextChess.fen());
      const reloadedChess = new Chess(flipped);
      setChess(reloadedChess);
      setFen(flipped);
      setHistory(reloadedChess.history());

      sounds.playCapture();
      setCurrentDialogue(`[HIT!] Your shot struck my ${victim.type.toUpperCase()}! Dealt ${dmg} damage. It has ${newHp} HP remaining!`);
      setCurrentEmotion("nervous");

      setCombatMode("chess");
      handleAiTurn(flipped, reloadedChess.history());
    }
  }, [fen, piecesHp, weaponsDmgUpgrade, isAiThinking, handleAiTurn, selectedBoss]);

  // --- Match Controls and Actions ---
  const handleUndo = () => {
    if (isAiThinking || history.length === 0) return;
    
    const redoChess = new Chess();
    // Replay moves history up to previous round (undoing last move pair)
    const movesToReplay = history.slice(0, -2); // retract player & AI responses
    
    for (const move of movesToReplay) {
      redoChess.move(move);
    }

    setChess(redoChess);
    setFen(redoChess.fen());
    setHistory(redoChess.history());
    sounds.playMove();
    setCurrentDialogue("Undid previous transaction cycle. Rerouting history state.");
    setCurrentEmotion("normal");
  };

  const handleResign = () => {
    if (isAiThinking || chess.isGameOver()) return;
    setStats(prev => ({ ...prev, aiWins: prev.aiWins + 1 }));
    sounds.playDefeat();
    setCurrentDialogue(getOfflineComment(selectedBoss.id, "win"));
    setCurrentEmotion("smug");
    
    // Create new terminal game state with winning flags using safe 2-king FEN
    const dummy = new Chess("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
    setChess(dummy);
    setFen("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
  };

  // Insert Coin / Start New Game
  const handleRestart = () => {
    const freshChess = new Chess();
    setChess(freshChess);
    setFen(freshChess.fen());
    setHistory([]);
    setIsAiThinking(false);
    
    // Reset Adventure States
    setCombatMode("chess");
    setGold(200);
    setWeaponsDmgUpgrade(0);
    setPlayerAmmo({ p: 3, n: 1, b: 2, r: 1, q: 1, k: 999 });
    setPiecesHp(initializeHpState(freshChess.board()));
    setLaserTracer(null);

    // Resolve Player Colors
    let assignedColor: "w" | "b" = "w";
    if (playerColor === "random") {
      assignedColor = Math.random() < 0.5 ? "w" : "b";
    } else {
      assignedColor = playerColor;
    }
    setActivePlayerColor(assignedColor);

    // Initial voice
    sounds.playVictory();
    setCurrentDialogue(getOfflineComment(selectedBoss.id, "start"));
    setCurrentEmotion("normal");

    // If active color is BLACK, AI acts first immediately as white!
    if (assignedColor === "b") {
       handleAiTurn(freshChess.fen(), []);
    }
  };

  // Sync color when user updates setting during setup
  useEffect(() => {
    handleRestart();
  }, [playerColor, selectedBoss]);

  const handleResetStatistics = () => {
    setStats({ playerWins: 0, aiWins: 0, draws: 0 });
    sounds.playCapture();
  };

  // Parse the last move to highlight cells
  const getLastMoveDetails = () => {
    if (history.length === 0) return null;
    const verboseHistory = chess.history({ verbose: true });
    if (verboseHistory.length > 0) {
      const last = verboseHistory[verboseHistory.length - 1];
      return { from: last.from, to: last.to };
    }
    return null;
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-[#0d0d0d] py-6 px-4 flex flex-col items-center justify-start text-[#00ff41] gap-6 selection:bg-[#ff00ff] selection:text-white antialiased font-sans relative overflow-x-hidden",
        boardTheme === "wood" ? "bg-[#180e06] text-amber-100" : ""
      )}
      id="root-chess-arcade-cabinet"
    >
      {/* Immersive CRT scanline glass filter overlay across the entire cabinet */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-6 z-50 mix-blend-screen"
        style={{
          background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
          backgroundSize: "100% 2px, 3px 100%"
        }}
      />

      {/* 8-Bit Arcade Header Cabinet Marquee bar following Immersive UI guidelines */}
      <header className={cn(
        "w-full max-w-7xl mx-auto flex flex-col items-center md:flex-row md:justify-between p-4 bg-[#1a1a1a] border-4 border-[#00ff41] shadow-[8px_8px_0px_0px_rgba(0,255,65,0.2)] relative overflow-hidden select-none mb-2",
        boardTheme === "wood" ? "border-amber-700 shadow-[8px_8px_0px_0px_rgba(176,106,46,0.2)]" : ""
      )}>
        {/* Glow accent lines */}
        {boardTheme !== "wood" && (
          <div className="absolute inset-0 border border-[#00ff41]/10 pointer-events-none shadow-[inset_0_0_20px_rgba(0,255,65,0.1)]" />
        )}
        
        <div className="flex items-center gap-3.5 z-10">
          <Joystick className={cn("text-[#ff00ff] w-8 h-8 shrink-0 stroke-[2.5] animate-pulse", boardTheme === "wood" ? "text-amber-500" : "")} />
          <div className="flex flex-col">
            <h1 className="font-press-start text-xs md:text-[15px] lg:text-lg tracking-widest text-[#00ff41] uppercase">
              8-BIT CHESS // v1.1
            </h1>
            <span className="text-[10px] text-zinc-400 font-mono leading-none uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#00ff41] animate-pulse inline-block" /> 
              HOST_PORT: LM_STUDIO @ {isOnlineMode ? llmSettings.model.toUpperCase() : "HEURISTIC_ENGINE_8BIT"}
            </span>
          </div>
        </div>

        {/* Console stats marquee box matching the mockup */}
        <div className="flex items-center gap-6 mt-4 md:mt-0 bg-black/40 border-2 border-[#00ff41]/50 px-4 py-2 font-mono text-[11px] z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" />
            <span className="text-zinc-400 font-press-start text-[8px] uppercase">MATCHES:</span>
            <span className="font-bold text-white text-xs">{stats.playerWins + stats.aiWins + stats.draws}</span>
          </div>
          <div className="w-1 h-5 bg-zinc-800" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-zinc-500 font-press-start uppercase">SYSTEM STATUS</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#00ff41] animate-ping rounded-full inline-block" />
              <span className="text-[#00ff41] font-press-start text-[8px] tracking-tight uppercase">AI CONNECTED</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Bento Cabinet Wrapper */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (Dialogue + Board) - spans 7 columns */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Dynamic Portait and Bubble Broadcast screen */}
          <BossDialogue
            boss={selectedBoss}
            currentEmotion={currentEmotion}
            currentDialogueText={currentDialogue}
            isThinking={isAiThinking}
            gameStatus={chess.isGameOver() ? "over" : "playing"}
          />

          {/* Core Visual Chess Board */}
          <div className="flex flex-col items-center justify-center w-full gap-4">
            {/* Shooter Combat HUD bar */}
            <div className="w-full max-w-[480px] bg-zinc-950 border-2 border-[#00ff41]/50 p-3 flex items-center justify-between font-mono text-xs select-none">
              <div className="flex items-center gap-2">
                <Coins className="w-4.5 h-4.5 text-yellow-400 shrink-0" />
                <span className="font-press-start text-[8px] text-zinc-300">GOLD: <span className="text-yellow-400 font-bold font-mono text-xs">{gold} GP</span></span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playMove();
                    setCombatMode(prev => prev === "chess" ? "gun" : "chess");
                  }}
                  className={cn(
                    "px-2.5 py-1.5 font-press-start text-[8px] uppercase tracking-wide cursor-pointer transition-all border flex items-center gap-1.5 rounded-none",
                    combatMode === "gun"
                      ? "bg-red-600 border-red-400 text-white animate-pulse"
                      : "bg-[#1a1a1a] border-[#00ff41]/60 text-[#00ff41] hover:bg-neutral-900"
                  )}
                >
                  <Crosshair className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  {combatMode === "gun" ? "WEAPON ARMED" : "SELECT WEAPON"}
                </button>
              </div>
            </div>

            <ChessBoard
              fen={fen}
              playerColor={activePlayerColor}
              boardTheme={boardTheme}
              isAiThinking={isAiThinking}
              onMove={handlePlayerMove}
              lastMove={getLastMoveDetails()}
              combatMode={combatMode}
              playerAmmo={playerAmmo}
              piecesHp={piecesHp}
              onShoot={handlePlayerShoot}
              laserTracer={laserTracer}
              pieceStyle={pieceStyle}
            />

            {/* AMMO STATUS DISPLAY BAR */}
            <div className="w-full max-w-[480px] bg-zinc-950/80 border-2 border-zinc-900 p-2.5 flex flex-wrap items-center justify-around font-mono text-[9px] text-zinc-400 select-none gap-y-1.5 gap-x-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-zinc-200">🔫 PAWN:</span> {playerAmmo.p > 99 ? "∞" : `${playerAmmo.p} CLIPS`}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-zinc-200">💨 KNIGHT:</span> {playerAmmo.n} SHELLS
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-zinc-200">⚡ BISHOP:</span> {playerAmmo.b} CHARGES
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-zinc-200">💣 ROOK:</span> {playerAmmo.r} ROCKETS
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-zinc-200">👑 QUEEN:</span> {playerAmmo.q} BFG
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (Control pads & settings tabs) - spans 5 columns */}
        <section className="lg:col-span-5 h-full flex flex-col gap-4">
          <div className="w-full flex-1 flex flex-col bg-retro-panel border-pixel border-zinc-800 rounded-sm">
            {/* Custom styled 8-bit tab bars */}
            <div className="grid grid-cols-4 bg-zinc-950 p-1.5 rounded-none border-b border-zinc-800/80">
              <button
                onClick={() => setActiveTab("log")}
                className={cn(
                  "font-press-start text-[8px] py-1.5 rounded-none cursor-pointer border-r border-zinc-800/60 transition-all uppercase",
                  activeTab === "log" ? "bg-zinc-900 text-retro-green font-bold" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Log
              </button>
              <button
                onClick={() => setActiveTab("shop")}
                className={cn(
                  "font-press-start text-[8px] py-1.5 rounded-none cursor-pointer border-r border-zinc-800/60 transition-all uppercase",
                  activeTab === "shop" ? "bg-zinc-900 text-yellow-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Shop
              </button>
              <button
                onClick={() => setActiveTab("boss")}
                className={cn(
                  "font-press-start text-[8px] py-1.5 rounded-none cursor-pointer border-r border-zinc-800/60 transition-all uppercase",
                  activeTab === "boss" ? "bg-zinc-900 text-retro-green font-bold" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Bosses
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "font-press-start text-[8px] py-1.5 rounded-none cursor-pointer transition-all uppercase",
                  activeTab === "settings" ? "bg-zinc-900 text-retro-green font-bold" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Config
              </button>
            </div>

            {/* TAB 1: Game Logs and Quick buttons */}
            {activeTab === "log" && (
              <div className="m-0 flex-1 h-full">
                <MoveHistory
                  history={history}
                  currentTurn={chess.turn()}
                  chessStatusText={getChessStatusText()}
                  isAiThinking={isAiThinking}
                  onUndo={handleUndo}
                  onResign={handleResign}
                  onRestart={handleRestart}
                />
              </div>
            )}

            {/* TAB: Shop to upgrade weapons / buy ammo */}
            {activeTab === "shop" && (
              <div className="m-0 flex-1 p-4 bg-retro-panel text-white flex flex-col gap-4 overflow-y-auto max-h-[720px]">
                <div className="border-b border-zinc-800 pb-2 select-none">
                  <h2 className="font-press-start text-[10px] uppercase text-yellow-400 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-400" /> BLACK MARKET SHOP
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    Spend your GP gold on tactical battlefield gear.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Shop item 1: Pawn pistol clips */}
                  <div className="p-3 bg-zinc-950 border-2 border-zinc-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-press-start text-[9px] text-zinc-200">PISTOL AMMO</h3>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">+3 Clips for your Pawns</p>
                    </div>
                    <Button
                      onClick={() => {
                        if (gold >= 60) {
                          setGold(prev => prev - 60);
                          setPlayerAmmo(prev => ({ ...prev, p: prev.p + 3 }));
                          sounds.playVictory();
                        } else {
                          sounds.playMove();
                        }
                      }}
                      disabled={gold < 60}
                      className="bg-yellow-600 hover:bg-yellow-500 text-black font-press-start text-[8px] h-7 px-2 border-0 rounded-none cursor-pointer"
                    >
                      60 GP
                    </Button>
                  </div>

                  {/* Shop item 2: Heavy Knight/Bishop shell stack */}
                  <div className="p-3 bg-zinc-950 border-2 border-zinc-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-press-start text-[9px] text-zinc-200">HEAVY AMMO</h3>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">+1 Knight Shotgun, +1 Bishop Railgun ammo</p>
                    </div>
                    <Button
                      onClick={() => {
                        if (gold >= 100) {
                          setGold(prev => prev - 100);
                          setPlayerAmmo(prev => ({ ...prev, n: prev.n + 1, b: prev.b + 1 }));
                          sounds.playVictory();
                        } else {
                          sounds.playMove();
                        }
                      }}
                      disabled={gold < 100}
                      className="bg-yellow-600 hover:bg-yellow-500 text-black font-press-start text-[8px] h-7 px-2 border-0 rounded-none cursor-pointer"
                    >
                      100 GP
                    </Button>
                  </div>

                  {/* Shop item 3: RPG / Rook rocket */}
                  <div className="p-3 bg-zinc-950 border-2 border-zinc-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-press-start text-[9px] text-zinc-200">TACTICAL ROCKET</h3>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">+1 Rook RPG rocket, +1 Queen BFG ammo</p>
                    </div>
                    <Button
                      onClick={() => {
                        if (gold >= 150) {
                          setGold(prev => prev - 150);
                          setPlayerAmmo(prev => ({ ...prev, r: prev.r + 1, q: prev.q + 1 }));
                          sounds.playVictory();
                        } else {
                          sounds.playMove();
                        }
                      }}
                      disabled={gold < 150}
                      className="bg-yellow-600 hover:bg-yellow-500 text-black font-press-start text-[8px] h-7 px-2 border-0 rounded-none cursor-pointer"
                    >
                      150 GP
                    </Button>
                  </div>

                  {/* Shop item 4: Hyper Booster Damage Upgrade */}
                  <div className="p-3 bg-zinc-950 border-2 border-zinc-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-press-start text-[9px] text-purple-400">WEAPON TUNING +1</h3>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Increases shooter damage on all pieces by +1</p>
                    </div>
                    <Button
                      onClick={() => {
                        if (gold >= 120) {
                          setGold(prev => prev - 120);
                          setWeaponsDmgUpgrade(prev => prev + 1);
                          sounds.playVictory();
                        } else {
                          sounds.playMove();
                        }
                      }}
                      disabled={gold < 120}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-press-start text-[8px] h-7 px-2 border-0 rounded-none cursor-pointer"
                    >
                      120 GP
                    </Button>
                  </div>

                  {/* Shop item 5: Medkit - Full heal all pawns and critical pieces */}
                  <div className="p-3 bg-zinc-950 border-2 border-[#39ff14]/40 flex items-center justify-between">
                    <div>
                      <h3 className="font-press-start text-[9px] text-[#39ff14]">MEDKIT HEALER</h3>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Heals all active user pieces back to full HP!</p>
                    </div>
                    <Button
                      onClick={() => {
                        if (gold >= 140) {
                          setGold(prev => prev - 140);
                          setPiecesHp(prev => {
                            const next = { ...prev };
                            Object.keys(next).forEach(sq => {
                              const pc = chess.get(sq as Square);
                              if (pc) {
                                next[sq] = PIECE_MAX_HP[pc.type as keyof typeof PIECE_MAX_HP] || 2;
                              }
                            });
                            return next;
                          });
                          sounds.playVictory();
                        } else {
                          sounds.playMove();
                        }
                      }}
                      disabled={gold < 140}
                      className="bg-[#39ff14] hover:bg-green-400 text-black font-press-start text-[8px] h-7 px-2 border-0 rounded-none cursor-pointer"
                    >
                      140 GP
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Boss Portrait selectors */}
            {activeTab === "boss" && (
              <div className="m-0 flex-1 p-4 bg-retro-panel text-white flex flex-col gap-4">
                <div className="border-b border-zinc-800 pb-2 select-none">
                  <h2 className="font-press-start text-[10px] uppercase text-[#00f0ff] flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-[#ff00ff]" /> SELECT YOUR OPPONENT
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    Choose a retro Gemma personality to challenge.
                  </p>
                </div>

                {/* Stacked list of Boss Characters */}
                <div className="flex flex-col gap-3.5">
                  {BOSSES.map(boss => (
                    <button
                      key={boss.id}
                      onClick={() => setSelectedBoss(boss)}
                      className={cn(
                        "p-3.5 bg-zinc-950 border-2 text-left rounded-none flex items-start gap-4 transition-all cursor-pointer relative",
                        selectedBoss.id === boss.id
                          ? "border-retro-green bg-zinc-900/50"
                          : "border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      {/* Tiny visual badge indicating selection */}
                      {selectedBoss.id === boss.id && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 font-press-start text-[7px] text-retro-green select-none uppercase">
                          <Flame className="w-3 animate-pulse" /> ACTIVE ENGAGED
                        </div>
                      )}

                      {/* Left color box style */}
                      <div className={cn("w-1.5 self-stretch shrink-0", boss.id === "apprentice" ? "bg-[#39ff14]" : boss.id === "challenger" ? "bg-[#ff00ff]" : "bg-[#00f0ff]")} />

                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 select-none">
                          <span className="font-press-start text-[10px] text-yellow-400">
                            {boss.name}
                          </span>
                          <span className="text-[8px] text-zinc-600 font-mono">
                            {boss.title}
                          </span>
                        </div>
                        <p className="text-zinc-400 font-mono text-[10px] leading-relaxed">
                          {boss.description}
                        </p>
                        
                        {/* Technical AI Settings values for visual interest */}
                        <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-600 border-t border-zinc-900 pt-1.5 select-none uppercase">
                          <span>SYS-MODEL: GEMMA-2</span>
                          <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                          <span>TEMP: {boss.minTemp}</span>
                          <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                          <span>TOKENS: {boss.maxTokens}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Advanced LM Studio and diagnostics configure */}
            {activeTab === "settings" && (
              <div className="m-0 flex-1">
                <SettingsPanel
                  settings={llmSettings}
                  setSettings={setLlmSettings}
                  boardTheme={boardTheme}
                  setBoardTheme={setBoardTheme}
                  playerColor={playerColor}
                  setPlayerColor={setPlayerColor}
                  isSoundEnabled={isSoundEnabled}
                  setIsSoundEnabled={setIsSoundEnabled}
                  isOnlineMode={isOnlineMode}
                  setIsOnlineMode={setIsOnlineMode}
                  onResetStats={handleResetStatistics}
                  stats={stats}
                  pieceStyle={pieceStyle}
                  setPieceStyle={setPieceStyle}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Small Humble Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center font-mono text-[9px] text-zinc-600 border-t border-zinc-900 pt-4 mt-6 select-none uppercase leading-relaxed font-semibold">
        <span>Retro Chess: Gemma AI Edition • Pure client-authoritative simulation • Hosted on sandboxed containers</span>
      </footer>
    </div>
  );
}
