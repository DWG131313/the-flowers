// Procedural 32x32 SNES-style pixel sprite generator for survivors.
// Uses seeded PRNG so the same survivor always looks the same.
// Renders to an offscreen canvas, returns a data URL.

import { ALL_EQUIPMENT } from './equipment.js';

// === Seeded PRNG (mulberry32) ===
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashId(id) {
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// === SNES-style Palette ===
const SKIN_TONES = [
  '#F5D6B8', // light
  '#D4A574', // medium-light
  '#A67B5B', // medium
  '#8B5E3C', // medium-dark
  '#5C3A21', // dark
];

const HAIR_COLORS = [
  '#1A1A1A', // black
  '#3D2B1F', // dark brown
  '#8B4513', // brown
  '#CD853F', // light brown
  '#DAA520', // blonde
  '#B22222', // red
  '#C0C0C0', // grey/silver
  '#F5F5DC', // platinum
  '#4A0E0E', // auburn
];

const SKILL_COLORS = {
  combat:     { primary: '#4A6741', secondary: '#3D5635' }, // camo green
  medical:    { primary: '#E8E8E8', secondary: '#C8C8C8' }, // white
  scavenge:   { primary: '#8B6914', secondary: '#6B4F10' }, // brown
  craft:      { primary: '#CC7722', secondary: '#AA5500' }, // orange
  leadership: { primary: '#2B3D6B', secondary: '#1E2D4F' }, // dark blue
};

// Hair style templates — each is an array of [dx, dy] offsets from head top-left
const HAIR_STYLES = [
  // 0: short crop
  { rows: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
           [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1]] },
  // 1: mid-length (covers ears)
  { rows: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
           [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
           [0,2],[1,2],[6,2],[7,2],
           [0,3],[1,3],[6,3],[7,3]] },
  // 2: long (past ears)
  { rows: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
           [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
           [0,2],[1,2],[6,2],[7,2],
           [0,3],[1,3],[6,3],[7,3],
           [0,4],[1,4],[6,4],[7,4],
           [0,5],[1,5],[6,5],[7,5]] },
  // 3: mohawk
  { rows: [[3,0],[4,0],
           [2,-1],[3,-1],[4,-1],[5,-1],
           [3,1],[4,1]] },
  // 4: bald — no hair
  { rows: [] },
];

// === Main Generator ===
export function generateSpriteDataURL(survivor) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  const rng = mulberry32(hashId(survivor.id));

  // Pick attributes
  const skinIdx = Math.floor(rng() * SKIN_TONES.length);
  const hairColorIdx = Math.floor(rng() * HAIR_COLORS.length);
  const hairStyleIdx = Math.floor(rng() * HAIR_STYLES.length);
  const skin = SKIN_TONES[skinIdx];
  const hair = HAIR_COLORS[hairColorIdx];
  const skillColor = SKILL_COLORS[survivor.skill] || SKILL_COLORS.combat;

  // Clear
  ctx.clearRect(0, 0, 32, 32);

  const px = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  // === LEGS (y: 24-31) ===
  const pantsColor = '#2C2C3A';
  const shoeColor = '#1A1A1A';
  // Left leg
  rect(11, 24, 3, 5, pantsColor);
  rect(11, 29, 3, 2, shoeColor);
  // Right leg
  rect(18, 24, 3, 5, pantsColor);
  rect(18, 29, 3, 2, shoeColor);

  // === BODY (y: 14-23) ===
  const bodyX = 9, bodyW = 14, bodyY = 14, bodyH = 10;
  rect(bodyX, bodyY, bodyW, bodyH, skillColor.primary);
  // Shirt detail — collar/trim
  rect(bodyX + 1, bodyY, bodyW - 2, 1, skillColor.secondary);
  rect(bodyX, bodyY + bodyH - 1, bodyW, 1, skillColor.secondary);
  // Arms
  rect(bodyX - 2, bodyY + 1, 2, 6, skillColor.primary);
  rect(bodyX + bodyW, bodyY + 1, 2, 6, skillColor.primary);
  // Hands
  rect(bodyX - 2, bodyY + 7, 2, 2, skin);
  rect(bodyX + bodyW, bodyY + 7, 2, 2, skin);

  // === HEAD (y: 5-13) ===
  const headX = 12, headY = 5, headW = 8, headH = 9;
  rect(headX, headY, headW, headH, skin);
  // Neck
  rect(14, headY + headH, 4, 1, skin);

  // === EYES (on head) ===
  const eyeY = headY + 4;
  px(headX + 2, eyeY, '#1A1A1A');
  px(headX + 5, eyeY, '#1A1A1A');
  // Eye whites
  px(headX + 2, eyeY - 1, '#FFFFFF');
  px(headX + 5, eyeY - 1, '#FFFFFF');

  // === MOUTH ===
  px(headX + 3, headY + 6, '#8B4513');
  px(headX + 4, headY + 6, '#8B4513');

  // === HAIR ===
  const style = HAIR_STYLES[hairStyleIdx];
  style.rows.forEach(([dx, dy]) => {
    const hx = headX + dx;
    const hy = headY + dy;
    if (hx >= 0 && hx < 32 && hy >= 0 && hy < 32) {
      px(hx, hy, hair);
    }
  });

  // === ARMOR OVERLAY ===
  if (survivor.armor) {
    const armorItem = ALL_EQUIPMENT[survivor.armor];
    if (armorItem) {
      switch (survivor.armor) {
        case 'leather_jacket':
          // Brown overlay on body
          rect(bodyX, bodyY, bodyW, 3, '#5C3A21');
          rect(bodyX - 2, bodyY + 1, 2, 4, '#5C3A21');
          rect(bodyX + bodyW, bodyY + 1, 2, 4, '#5C3A21');
          break;
        case 'riot_shield':
          // Shield on left side
          rect(3, 16, 5, 8, '#4A4A5A');
          rect(4, 17, 3, 6, '#6A6A7A');
          break;
        case 'hiking_boots':
          // Taller brown boots
          rect(11, 27, 3, 4, '#8B4513');
          rect(18, 27, 3, 4, '#8B4513');
          break;
        case 'gas_mask':
          // Mask over face
          rect(headX + 1, eyeY - 1, 6, 4, '#3A4A3A');
          px(headX + 2, eyeY, '#88AAAA');
          px(headX + 5, eyeY, '#88AAAA');
          break;
        case 'combat_vest':
          // Dark vest over body
          rect(bodyX + 1, bodyY + 1, bodyW - 2, bodyH - 2, '#2A3A2A');
          rect(bodyX + 2, bodyY + 2, 2, 2, '#4A5A4A'); // pocket
          break;
        case 'lucky_charm':
          // Small gold pendant
          px(15, bodyY, '#FFD700');
          px(16, bodyY, '#FFD700');
          px(15, bodyY + 1, '#FFD700');
          break;
        case 'medic_pouch':
          // Red cross pouch on hip
          rect(23, 20, 4, 3, '#8B0000');
          px(24, 21, '#FFFFFF');
          px(25, 21, '#FFFFFF');
          break;
      }
    }
  }

  // === WEAPON OVERLAY ===
  if (survivor.weapon) {
    const weapItem = ALL_EQUIPMENT[survivor.weapon];
    if (weapItem) {
      switch (survivor.weapon) {
        case 'pipe_wrench':
          // Grey wrench on right
          rect(25, 14, 2, 8, '#888888');
          rect(25, 13, 3, 2, '#888888');
          break;
        case 'hunting_knife':
          // Small blade
          rect(25, 18, 1, 5, '#C0C0C0');
          rect(25, 17, 2, 2, '#5C3A21');
          break;
        case 'fire_axe':
          // Red axe head + handle
          rect(25, 12, 2, 10, '#8B4513');
          rect(24, 12, 4, 3, '#CC2222');
          break;
        case 'crossbow':
          // Crossbow shape
          rect(25, 15, 2, 6, '#5C3A21');
          rect(23, 15, 6, 1, '#5C3A21');
          rect(23, 16, 1, 1, '#5C3A21');
          rect(28, 16, 1, 1, '#5C3A21');
          break;
        case 'machete':
          // Long blade
          rect(25, 14, 1, 8, '#C0C0C0');
          rect(25, 22, 2, 2, '#5C3A21');
          break;
        case 'shotgun':
          // Double barrel
          rect(25, 13, 1, 10, '#3A3A3A');
          rect(26, 13, 1, 10, '#3A3A3A');
          rect(25, 23, 2, 2, '#5C3A21');
          break;
        case 'nail_bat':
          // Bat with nail dots
          rect(25, 13, 2, 10, '#8B4513');
          px(24, 14, '#C0C0C0');
          px(27, 15, '#C0C0C0');
          px(24, 16, '#C0C0C0');
          break;
      }
    }
  }

  // === PET (tiny sprite at feet) ===
  if (survivor.hasPet && survivor.alive) {
    if (survivor.petType === 'dog') {
      rect(2, 28, 4, 2, '#B8860B');
      rect(1, 27, 2, 1, '#B8860B'); // head
      px(1, 26, '#B8860B'); // ear
      px(2, 27, '#1A1A1A'); // eye
    } else {
      rect(2, 28, 3, 2, '#808080');
      rect(1, 27, 2, 1, '#808080'); // head
      px(0, 26, '#808080'); // ear
      px(4, 26, '#808080'); // ear
      px(2, 27, '#1A1A1A'); // eye
    }
  }

  // === STATUS OVERLAYS ===
  if (!survivor.alive) {
    // Grayscale the entire sprite
    const imageData = ctx.getImageData(0, 0, 32, 32);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const gray = Math.round(data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
        data[i + 3] = Math.round(data[i + 3] * 0.6);
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // X over sprite
    ctx.strokeStyle = '#FF3333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, 4); ctx.lineTo(28, 28);
    ctx.moveTo(28, 4); ctx.lineTo(4, 28);
    ctx.stroke();
  } else {
    if (survivor.injured) {
      // Bandage on head
      rect(headX, headY + 2, headW, 1, '#FFFFFF');
      px(headX + headW - 1, headY + 2, '#CC2222');
    }
    if (survivor.sick) {
      // Green tint overlay
      const imageData = ctx.getImageData(0, 0, 32, 32);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          data[i] = Math.round(data[i] * 0.8);
          data[i + 1] = Math.min(255, Math.round(data[i + 1] * 1.15));
          data[i + 2] = Math.round(data[i + 2] * 0.8);
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }

  return canvas.toDataURL('image/png');
}
