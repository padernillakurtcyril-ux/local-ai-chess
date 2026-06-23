import React from "react";
import { RetroEmotion } from "../types";

interface RetroAvatarProps {
  bossId: "apprentice" | "challenger" | "sovereign";
  emotion: RetroEmotion;
  className?: string;
  size?: number;
}

export const RetroAvatar: React.FC<RetroAvatarProps> = ({
  bossId,
  emotion,
  className,
  size = 96
}) => {
  // Let's programmatically render three gorgeous 16x16 pixel portraits
  
  // Color reference palettes
  const palette = {
    BG: "transparent",
    OUTLINE: "#121216",
    METAL_LIGHT: "#cfd8dc",
    METAL_MEDIUM: "#90a4ae",
    METAL_DARK: "#455a64",
    
    SCREEN_BG: "#1a237e", // Deep blue CRM screen
    SCREEN_LIGHT: "#3f51b5",
    
    GOLD_LIGHT: "#ffd700",
    GOLD_DARK: "#c79a00",
    
    GLOW_GREEN: "#39ff14",
    GLOW_RED: "#ff3333",
    GLOW_BLUE: "#00f0ff",
    GLOW_YELLOW: "#ffdb58",
    GLOW_MAGENTA: "#ff007f",
    
    SKIN_CRAWL: "#ffccaa",
    HAIR_CYBER: "#ff00ff"
  };

  // Build a custom 16x16 grid depending on boss and emotion
  const getAvatarMatrix = (): { grid: string[]; colors: Record<string, string> } => {
    if (bossId === "apprentice") {
      // GEMMA-BOT: A cute retro robotic CRT monitor face
      const colors = {
        ".": "transparent",
        "D": palette.OUTLINE, // Dark
        "L": palette.METAL_LIGHT, // Metal highlights
        "M": palette.METAL_MEDIUM, // Metal body
        "S": palette.METAL_DARK, // Shadow metal
        "G": emotion === "thinking" ? palette.GLOW_BLUE :
             emotion === "smug" || emotion === "happy" ? palette.GLOW_YELLOW :
             emotion === "angry" ? palette.GLOW_RED :
             emotion === "nervous" ? "#ff8800" :
             emotion === "defeated" ? "#777777" :
             palette.GLOW_GREEN, // Screen display color
        "B": "#0a0a0f", // Dark screen active background
        "P": "#ffd1dc"  // Pink rosy cheeks in success!
      };

      // Visor eye designs for 16x16 (starting at row 4, column 4)
      let eyePattern = [
        "....GG......GG..",
        "....GG......GG.."
      ];
      if (emotion === "thinking") {
        eyePattern = [
          "......GGGG......",
          "......GGGG......"
        ];
      } else if (emotion === "smug") {
        eyePattern = [
          "...G..G....G..G.",
          "....GG......GG.."
        ];
      } else if (emotion === "happy") {
        eyePattern = [
          "...G..G....G..G.",
          "...GGGG....GGGG."
        ];
      } else if (emotion === "angry") {
        eyePattern = [
          "....GG......GG..",
          ".....G......G..."
        ];
      } else if (emotion === "nervous") {
        eyePattern = [
          ".....G......G...",
          "....GG......GG.."
        ];
      } else if (emotion === "defeated") {
        eyePattern = [
          "...G..G....G..G.",
          "....G........G.."
        ];
      }

      const grid = [
        ".....DDDDDD.....",
        "....DLLLLLDD....",
        "...DLMMMMMDLD...",
        "..DLMBBBBBBDLD..",
        "..DLMBBBBBBDLD..",
        "..DMMBBBBBBBDMD.",
        "..DMMBBBBBBBDMD.",
        "..DMMBBBBBBBDMD.",
        "..DMMSBBBBBDSSD.",
        "..DMSSBBBBBDSSD.",
        "...DSSSSSSSSD...",
        "....DDDDDDDD....",
        ".....DMMMMD.....",
        "....DMMMMMMD....",
        "...DDDDDDDDDD...",
        "................"
      ];

      // Replace screen pixels (rows 3 to 9, cols 4 to 11) with customized expressions
      const resultGrid = [...grid];
      
      // Paint the pixel visor depending on emotion
      // Let's inject custom facial features within the canvas bounds
      if (emotion === "thinking") {
        resultGrid[5] = "..DLMBB_GG_BBDLD..";
        resultGrid[6] = "..DMMB_G_G_BBDMD..";
        resultGrid[7] = "..DMMB_G_G_BBDMD..";
        resultGrid[8] = "..DMMSB_GG_BDSSD..";
      } else if (emotion === "happy" || emotion === "smug") {
        resultGrid[5] = "..DLMBB_G_G_BDLD..";
        resultGrid[6] = "..DMMB_G_G_G_DMD..";
        resultGrid[7] = "..DMMB_P_B_P_DMD..";
        resultGrid[8] = "..DMMSB_GGG_DSSD..";
      } else if (emotion === "angry") {
        resultGrid[5] = "..DLMB_GG_GG_DLD..";
        resultGrid[6] = "..DMMB_GBB_G_DMD..";
        resultGrid[7] = "..DMMBBBB_BBB_D..";
        resultGrid[8] = "..DMMSB_GGGG_SSD..";
      } else if (emotion === "nervous") {
        resultGrid[5] = "..DLMBB_G_G_BDLD..";
        resultGrid[6] = "..DMMB_G_B_G_DMD..";
        resultGrid[7] = "..DMMB_G_B_B_DMD.."; // single sweat drop in orange next
        resultGrid[8] = "..DMMSB_G_G_DSSD..";
      } else if (emotion === "defeated") {
        resultGrid[5] = "..DLMB_G_G_G_DLD..";
        resultGrid[6] = "..DMMB_B_G_B_DMD..";
        resultGrid[7] = "..DMMB_G_B_G_DMD..";
        resultGrid[8] = "..DMMSB_BBB_DSSD..";
      } else {
        // Normal
        resultGrid[5] = "..DLMBB_G_G_BDLD..";
        resultGrid[6] = "..DMMBB_G_G_BDMD..";
        resultGrid[7] = "..DMMBBB_B_BBDMD..";
        resultGrid[8] = "..DMMSB_GGG_DSSD..";
      }

      // Convert customized strings back to clean grid format
      const cleaned = resultGrid.map(row => row.replace(/_/g, "B"));
      return { grid: cleaned, colors };

    } else if (bossId === "challenger") {
      // SIR GEMMA-LOT: A medieval knight in pixel armor with glowing pink eyes
      const colors = {
        ".": "transparent",
        "D": palette.OUTLINE,
        "S": "#708090", // Slatgrey metal
        "M": "#4e5d6c", // Medium metal
        "H": "#a1afbc", // Highlights
        "C": "#ff3366", // Red plum crest on helmet
        "E": emotion === "thinking" ? palette.GLOW_BLUE :
             emotion === "smug" ? palette.GLOW_MAGENTA :
             emotion === "happy" ? palette.GLOW_GREEN :
             emotion === "angry" || emotion === "nervous" ? palette.GLOW_RED :
             "#444444", // Eye glow inside visor
        "B": "#12121e", // Visor shadow slit
        "W": "#ffffff"  // Sweat drop for nervous state
      };

      const baseGrid = [
        "......DCCCCD....",
        ".....DCCCCCCD...",
        ".....DCCDDCDD...",
        "....DCDHHHHHD...",
        "...DDHHHHHHHHD..",
        "...DHHHHHHHHHD..",
        "...DHDBBBBDHHD..",
        "...DHDBSBBDHHD..",
        "...DHDBBBBDHHD..",
        "...DDMMSMMSMDD..",
        "....DMMMMMMMD...",
        "....DMDMMMDMD...",
        ".....DDDDDDD....",
        ".....DMMHMMD....",
        "....DMMDDMMD....",
        "....DDDDDDDD...."
      ];

      // Visor sits on row 6 & 7 & 8, Columns 6 to 9
      const result = [...baseGrid];
      if (emotion === "thinking") {
        result[6] = "...DHDBBEBBDHHD..";
        result[7] = "...DHDBSBBDHHD..";
      } else if (emotion === "happy") {
        result[6] = "...DHDBEEBBDHHD..";
        result[7] = "...DHDBSESDHHB.."; // happy crest active
      } else if (emotion === "smug") {
        result[6] = "...DHDBEEBBDHHD..";
        result[7] = "...DHDBSBBDHHD..";
      } else if (emotion === "nervous") {
        result[6] = "...DHDBEEBBDHHD..";
        result[7] = "...DHDBWBBBDHHD.."; // Sweat pixel 'W' on left
      } else if (emotion === "angry") {
        result[6] = "...DHDBEEEEDHHD.."; // Extra wide intense glow
        result[7] = "...DHDBSBBDHHD..";
      } else if (emotion === "defeated") {
        result[6] = "...DHDBBBBDHHD.."; // dead black eyes
        result[7] = "...DHDBSBBDHHD..";
      }

      return { grid: result, colors };

    } else {
      // SOVEREIGN GEMMA: Neon Cyber Empress
      const colors = {
        ".": "transparent",
        "D": palette.OUTLINE,
        "C": "#00f0ff", // Neon Cyber crown cyan
        "P": "#ff007f", // Cyber crown magenta stones
        "S": "#0f111a", // Dark skin tone vector shadow
        "F": "#1e2233", // Cyber face tone
        "N": "#00f0ff", // Neon glowing face indicators
        "E": emotion === "defeated" ? "#777777" : palette.GLOW_MAGENTA, // Glowing eyes
        "H": "#ff33cc"  // Hair
      };

      const baseGrid = [
        "....CDCCCDCCCD..",
        "...CDPCDPCDPCDD.",
        "....CHHHHHHHD...",
        "....CHHHHHHHD...",
        "...CHHFFFFFHHD..",
        "..CHHFEEEEFFHHD.",
        "..CHHFFFFFFFHHD.",
        "..CHFNNNNNNNFHD.",
        "..CHFNNFDNNNFHD.",
        "..CHFNNNNNNNFHD.",
        "...CHFFFFFFFHD..",
        "....CHFFFFFHD...",
        ".....CHFFFHD....",
        "......CHHHD.....",
        ".......CHD......",
        "................"
      ];

      const result = [...baseGrid];
      if (emotion === "thinking") {
        result[5] = "..CHHFEEEEFFHHD."; // flashing magenta
        result[7] = "..CHFNNNNNNNFHD.";
      } else if (emotion === "angry") {
        result[5] = "..CHHFEFEEFFHHD.";
        result[7] = "..CHFNDDDDNFHD."; // tight jaw angle
      } else if (emotion === "defeated") {
        result[5] = "..CHHFDBBDFFHHD."; // eyes offline
        result[7] = "..CHFNNNNNNNFHD.";
      } else if (emotion === "happy" || emotion === "smug") {
        result[5] = "..CHHFEEFEEFHHD."; // flashing eyes
        result[7] = "..CHFNNFEFNNFHD."; // smiling face outline
      }

      return { grid: result, colors };
    }
  };

  const { grid, colors } = getAvatarMatrix();

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      id={`avatar-${bossId}-${emotion}`}
    >
      <svg
        viewBox="0 0 16 16"
        width="100%"
        height="100%"
        className="shape-rendering-pixelated drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
        style={{ imageRendering: "pixelated" }}
      >
        {grid.map((row, rIdx) => {
          return row.split("").map((char, cIdx) => {
            const pixelColor = colors[char as keyof typeof colors] || "transparent";
            if (pixelColor === "transparent") return null;
            return (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width={1.05}
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
