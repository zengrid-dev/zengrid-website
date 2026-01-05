import React, { useState, useCallback, useRef } from 'react';

const CELL_POSITIONS = [
  { left: 0, top: 0 },
  { left: 43, top: 0 },
  { left: 86, top: 0 },
  { left: 0, top: 43 },
  { left: 43, top: 43 },
  { left: 86, top: 43 },
  { left: 0, top: 86 },
  { left: 43, top: 86 },
  { left: 86, top: 86 }
];

const BASE_OPACITIES = [0.55, 0.7, 0.55, 0.7, 1, 0.7, 0.45, 0.55, 0.45];

const CORNER_RADII = [
  '10px 5px 5px 5px', '5px', '5px 10px 5px 5px',
  '5px', '5px', '5px',
  '5px 5px 5px 10px', '5px', '5px 5px 10px 5px'
];

// Timing configuration
const STAGGER_DELAY = 90;
const LIFT_DURATION = 280;
const BLOOM_DURATION = 320;
const SETTLE_DURATION = 400;

export default function ZenGridLogo({
  variant = 'light',
  showWordmark = true,
  showTagline = false,
  layout = 'horizontal'
}) {
  const [wavePhases, setWavePhases] = useState(Array(9).fill('idle'));
  const isAnimatingRef = useRef(false);
  const timeoutsRef = useRef([]);

  const colors = {
    light: {
      gradient: 'linear-gradient(135deg, #3db892 0%, #2a9d7a 100%)',
      zen: '#3db892',
      grid: '#1a1a2e',
      baseShadow: 'none',
      centerShadow: 'none',
      bloomShadow: '0 4px 16px rgba(61, 184, 146, 0.25)'
    },
    dark: {
      gradient: 'linear-gradient(135deg, #4ecca3 0%, #3db892 100%)',
      zen: '#4ecca3',
      grid: '#ffffff',
      baseShadow: '0 2px 12px rgba(78, 204, 163, 0.12)',
      centerShadow: '0 4px 20px rgba(78, 204, 163, 0.25)',
      bloomShadow: '0 6px 24px rgba(78, 204, 163, 0.35)'
    }
  }[variant];

  const triggerWave = useCallback((hoveredIndex) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Clear existing timeouts
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];

    const hoveredRow = Math.floor(hoveredIndex / 3);
    const hoveredCol = hoveredIndex % 3;

    // Find max distance
    let maxDistance = 0;
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const distance = Math.abs(row - hoveredRow) + Math.abs(col - hoveredCol);
      if (distance > maxDistance) maxDistance = distance;
    }

    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const distance = Math.abs(row - hoveredRow) + Math.abs(col - hoveredCol);
      const delay = distance * STAGGER_DELAY;

      // Phase 1: Lift
      timeoutsRef.current.push(
        setTimeout(() => {
          setWavePhases(prev => {
            const next = [...prev];
            next[i] = 'lift';
            return next;
          });

          // Phase 2: Bloom
          timeoutsRef.current.push(
            setTimeout(() => {
              setWavePhases(prev => {
                const next = [...prev];
                next[i] = 'bloom';
                return next;
              });

              // Phase 3: Settle
              timeoutsRef.current.push(
                setTimeout(() => {
                  setWavePhases(prev => {
                    const next = [...prev];
                    next[i] = 'settle';
                    return next;
                  });

                  // Reset to idle
                  timeoutsRef.current.push(
                    setTimeout(() => {
                      setWavePhases(prev => {
                        const next = [...prev];
                        next[i] = 'idle';
                        return next;
                      });

                      if (distance === maxDistance) {
                        setTimeout(() => {
                          isAnimatingRef.current = false;
                        }, 200);
                      }
                    }, SETTLE_DURATION)
                  );
                }, BLOOM_DURATION)
              );
            }, LIFT_DURATION)
          );
        }, delay)
      );
    }
  }, []);

  const getTransform = (phase) => {
    switch (phase) {
      case 'lift': return 'translateY(-3px) scale(0.92)';
      case 'bloom': return 'translateY(0) scale(1.04)';
      case 'settle': return 'translateY(0) scale(1)';
      default: return 'translateY(0) scale(1)';
    }
  };

  const getOpacity = (index, phase) => {
    if (phase === 'lift') return 0.9;
    if (phase === 'bloom') return 1;
    return BASE_OPACITIES[index];
  };

  const getShadow = (index, phase) => {
    if (phase === 'bloom') return colors.bloomShadow;
    if (index === 4) return colors.centerShadow;
    return colors.baseShadow;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: layout === 'stacked' ? 'column' : 'row',
      alignItems: 'center',
      gap: layout === 'stacked' ? 24 : 32
    }}>
      {/* Grid Icon */}
      <div style={{
        position: 'relative',
        width: 120,
        height: 120,
        cursor: 'pointer'
      }}>
        {CELL_POSITIONS.map((pos, i) => (
          <div
            key={i}
            onMouseEnter={() => triggerWave(i)}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              width: 34,
              height: 34,
              background: colors.gradient,
              borderRadius: CORNER_RADII[i],
              opacity: getOpacity(i, wavePhases[i]),
              transform: getTransform(wavePhases[i]),
              boxShadow: getShadow(i, wavePhases[i]),
              transition: `
                transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                box-shadow 0.5s ease
              `
            }}
          />
        ))}
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div style={{
          fontFamily: "'Outfit', 'SF Pro Display', system-ui, sans-serif",
          fontSize: 44,
          fontWeight: 300,
          letterSpacing: 6
        }}>
          <span style={{ color: colors.zen, fontWeight: 400 }}>Zen</span>
          <span style={{ color: colors.grid, opacity: variant === 'dark' ? 0.95 : 1 }}>Grid</span>
        </div>
      )}

      {/* Tagline */}
      {showTagline && (
        <span style={{
          fontSize: 10,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: colors.zen,
          opacity: 0.5
        }}>
          Performance First
        </span>
      )}
    </div>
  );
}


/*
═══════════════════════════════════════════════════════════
USAGE
═══════════════════════════════════════════════════════════

import ZenGridLogo from './ZenGridLogo';

// Light variant
<ZenGridLogo />

// Dark variant
<ZenGridLogo variant="dark" />

// With tagline
<ZenGridLogo variant="dark" showTagline />

// Stacked layout
<ZenGridLogo layout="stacked" />

// Icon only
<ZenGridLogo showWordmark={false} />

// In a dark header
<header style={{ background: '#0a0a10', padding: 24 }}>
  <ZenGridLogo variant="dark" />
</header>
*/
