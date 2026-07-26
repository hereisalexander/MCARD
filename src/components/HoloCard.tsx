'use client';

import React, { useState, useRef } from 'react';

interface HoloCardProps {
  src: string;
  alt: string;
  rarity?: string;
  className?: string;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  src,
  alt,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles (-10deg to 10deg)
    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-[3/4] rounded-xl cursor-pointer select-none overflow-hidden transition-transform duration-200 ease-out preserve-3d ${className}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
        boxShadow: isHovered
          ? `${-rotateY * 0.6}px ${rotateX * 0.6}px 20px rgba(0, 0, 0, 0.35)`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Base Pokémon Card Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain rounded-xl select-none pointer-events-none"
        loading="lazy"
      />

      {/* Subtle Specular Sheen (No Rainbow) */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none mix-blend-soft-light transition-opacity duration-200"
          style={{
            background: `linear-gradient(
              ${135 + rotateX * 2}deg,
              rgba(255, 255, 255, 0.25) 0%,
              transparent 70%
            )`,
          }}
        />
      )}
    </div>
  );
};
