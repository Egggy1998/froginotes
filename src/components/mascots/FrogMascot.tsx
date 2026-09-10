import React from 'react';
import { MascotMood } from '../../types';

export type { MascotMood };

interface FrogMascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  alt?: string;
}

const moodFiles: Record<MascotMood, string> = {
  happy: './mascots/frog-happy.png',
  wink: './mascots/frog-wink.png',
  sleepy: './mascots/frog-sleepy.png',
  sparkle: './mascots/frog-sparkle.png',
  thinking: './mascots/frog-thinking.png',
  surprised: './mascots/frog-surprised.png',
  love: './mascots/frog-love.png',
  confident: './mascots/frog-confident.png',
  bunny: './mascots/frog-bunny.png',
  smart: './mascots/frog-smart.png',
  music: './mascots/frog-music.png',
  party: './mascots/frog-party.png',
  crown: './mascots/frog-crown.png',
  sleepcap: './mascots/frog-sleepcap.png',
};

export const FrogMascot: React.FC<FrogMascotProps> = ({
  mood = 'happy',
  size = 40,
  className = '',
  alt = 'Frogi mascot',
}) => {
  const src = moodFiles[mood] || moodFiles.happy;

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`object-contain select-none pointer-events-none ${className}`}
      draggable={false}
    />
  );
};
