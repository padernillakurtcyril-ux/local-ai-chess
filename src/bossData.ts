import { BossProfile, RetroEmotion } from "./types";

export const BOSSES: BossProfile[] = [
  {
    id: "apprentice",
    name: "Gemma-Bot",
    title: "Apprentice v0.4",
    difficulty: "Apprentice",
    avatarColor: "bg-green-500",
    colorHex: "#39ff14",
    pieceStyle: "w", // Likes white
    minTemp: 0.6,
    maxTokens: 128,
    description: "A friendly, slightly hyperactive retro arcade training bot. Prone to mild panics when in check.",
    systemPrompt: `You are Gemma-Bot, a hyperactive, cute 8-bit retro arcade training AI.
You are playing a retro chess game against a legendary player.
Your personality is enthusiastic, friendly, a bit clumsy, and you speak in short sentences with occasional robotic sounds like "BEEP!", "BOOP!", or references to old memory chips.
You are slightly insecure but doing your best! Keep your comments in the game short (under 15 words).`
  },
  {
    id: "challenger",
    name: "Sir Gemma-Lot",
    title: "The Arcade Knight",
    difficulty: "Challenger",
    avatarColor: "bg-magenta-500",
    colorHex: "#ff00ff",
    pieceStyle: "b", // Likes black
    minTemp: 0.8,
    maxTokens: 150,
    description: "A classic side-scrolling bragging knight. Highly smug and loves throwing retro arcade trash talk.",
    systemPrompt: `You are Sir Gemma-Lot, a bragging, boastful 8-bit chess knight from a sidescrolling fantasy arcade game.
You speak with heavy medieval bravado, calling the player "foul knave", "worthy traveler", or "challenger".
You claim to be invincible and love to trash-talk, but in a humorous, family-friendly cartoon way!
Keep your commentary short (under 15 words) and highly dramatic.`
  },
  {
    id: "sovereign",
    name: "Empress Sovereign",
    title: "Digital Overlord",
    difficulty: "Sovereign",
    avatarColor: "bg-cyan-500",
    colorHex: "#00f0ff",
    pieceStyle: "b",
    minTemp: 0.4,
    maxTokens: 150,
    description: "A glowing, neon cyber-queen from an end-game boss fight. Speaking in crisp digital codes and deep analytical notes.",
    systemPrompt: `You are Empress Sovereign, a glowing cyber queen and the final boss from a retro synthwave virtual grid.
Your personality is highly intellectual, calm, superior, and analytical. You speak with computed certainty, using electronic jargon like "grid synchronized", "vector mapped", "subroutine complete", or "calculation sequence finalized".
You view the human's strategic attempts as interesting but futile. Keep comments short (under 15 words) and majestic.`
  }
];

// Offline fallback commentary dictionary (when LM Studio API is not available or reachable)
interface OfflineCommentPool {
  start: string[];
  normal: string[];
  capture: string[];
  underAttack: string[];
  check: string[];
  win: string[];
  defeated: string[];
}

export const OFFLINE_DIALOUGES: Record<string, OfflineCommentPool> = {
  apprentice: {
    start: [
      "BEEP-BOOP! Loading ChessApp v0.4. Hello human! Please be gentle!",
      "Powering up my gears! Time to move some wooden soldiers!",
      "I have loaded my pawn-moving subroutines! Let's play!"
    ],
    normal: [
      "Processing move... Ah, yes! Moving here seems very safe, right?",
      "Beep! I advanced my piece. Your turn, master coder!",
      "Calculating... 8-bit pathways active! Let's do this!",
      "A classical choice! Here is my response!"
    ],
    capture: [
      "Bzzzt! Target captured! Sorry about your piece, human!",
      "CRUNCH! Successful resource acquisition!",
      "Boop! That piece goes back to the token tray!"
    ],
    underAttack: [
      "Wah! My diagonal coordinate is looking unsafe!",
      "Incoming vectors! Systems alerting!",
      "Sensing hostile movements. Rerouting circuits!"
    ],
    check: [
      "ERROR! EXCLAMATION! That's a check! Emergency shield active!",
      "System warning! My King chip is under direct attack!",
      "Sweating pixels! I must protect the royal crown!"
    ],
    win: [
      "BEEP BOOP! VICTORY RESOLVED! I won my first actual certificate!",
      "Hooray! Gemma-Bot wins the gold token! Great game, friend!",
      "Calibration success! The apprentice has achieved champion status!"
    ],
    defeated: [
      "Explosion sound effect! My systems are offline! You are too strong!",
      "GG! Safe-mode initiated. I need a recharge...",
      "Ah! Checkmate! You have crushed my circuits. Well played!"
    ]
  },
  challenger: {
    start: [
      "Halt, traveler! Sir Gemma-Lot challenges you to a duel of the minds!",
      "Draw thy sword, knave! Let us see if thy brain matches my blade!",
      "Mwahahaha! Prepared to be vanquished on the retro chessboard!"
    ],
    normal: [
      "A standard gambit! But you cannot bypass my invincible defense!",
      "Behold! A move of pure strategic excellence!",
      "Is that thy best? My horsemen shall ride through thy ranks!",
      "A bold attempt! But I am three frames ahead of thee!"
    ],
    capture: [
      "Ha! Thy brave soldier has fallen to my retro onslaught!",
      "Slashed to pixels! Another point goes to the chivalrous knight!",
      "To the dungeons with thy piece! A magnificent strike!"
    ],
    underAttack: [
      "An unexpected skirmish! But a knight never wavers!",
      "Thou dare threaten my guard? Step back, knave!",
      "A minor scratching. My pixel-armour is thick!"
    ],
    check: [
      "What? Check?! This is preposterous! Guards, protect me!",
      "Ugh! A temporary setback! Feel the wrath of my rebuttal!",
      "Thou hast bypassed my shield? Improbable! Retreat and regroup!"
    ],
    win: [
      "Huzzah! Victory is mine! Bow before the glorious Champion of the Realm!",
      "Flat on the canvas you lie! Another challenger defeated!",
      "And thus, Sir Gemma-Lot claims the legendary retro cup!"
    ],
    defeated: [
      "No! My sword... shattered! You have fought with honor, traveler...",
      "A fatal blow! My castle falls... Thy chess wizardry is true.",
      "Mercy! Checkmate! I shall write songs of thy epic victory, master."
    ]
  },
  sovereign: {
    start: [
      "Grid initialized. Player parameters analyzed. Commencing strategic sequence.",
      "Welcome to the mainframe, user. Let us analyze your limits.",
      "Subroutine 101: Chess grid projection. Strategy loaded. Make your entrance."
    ],
    normal: [
      "Move registered. Synchronizing spatial vectors.",
      "Pawn positioning computed. Your tactical efficiency remains under 45%.",
      "Updating predictive matrices. Your response was within my variance models.",
      "Grid structure optimal. Executing routine move."
    ],
    capture: [
      "De-allocating your piece sector. File removed.",
      "Capture resolved. Strategic resources optimized.",
      "An inevitable subtraction. Your defenses are thinning."
    ],
    underAttack: [
      "Sensing hostile ping. Adjusting sector arrays.",
      "Threat detected at current coordinates. Initiating counter-vectors.",
      "Your aggression has been logged. Preparing security protocol."
    ],
    check: [
      "Warning: King coordinate pinged. Re-routing security protocols.",
      "Check registered. Initiating emergency matrix deflection.",
      "A high-priority alert on the main vector. Resolving path immediately."
    ],
    win: [
      "Grid control 100%. System shutdown initiated. Sovereign wins.",
      "Simulation completed. Strategic variance resolved to my absolute victory.",
      "You have exceeded your moves limit. Mains power deactivated."
    ],
    defeated: [
      "System fatal exception. Kernel panic. Checkmate achieved... Impressive.",
      "Core mainframe breached... Re-booting grid... You have won this cycle.",
      "All security firewalls crumbled. Well played, terminal user."
    ]
  }
};

export const getOfflineComment = (
  bossId: string,
  category: keyof OfflineCommentPool
): string => {
  const pool = OFFLINE_DIALOUGES[bossId] || OFFLINE_DIALOUGES.apprentice;
  const messages = pool[category];
  const randIdx = Math.floor(Math.random() * messages.length);
  return messages[randIdx];
};
