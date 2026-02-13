import { useMemo } from 'react';
import { generateSpriteDataURL } from '../game/spriteGenerator.js';

export default function SurvivorSprite({ survivor, size = 48 }) {
  // Re-generate only when visual attributes change
  const spriteUrl = useMemo(() => {
    return generateSpriteDataURL(survivor);
  }, [
    survivor.id,
    survivor.alive,
    survivor.injured,
    survivor.sick,
    survivor.weapon,
    survivor.armor,
    survivor.hasPet,
    survivor.petType,
    survivor.skill,
  ]);

  return (
    <img
      src={spriteUrl}
      alt={survivor.name}
      width={size}
      height={size}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}
