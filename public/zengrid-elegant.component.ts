// zengrid-logo.component.ts
// Elegant Wave Ripple on Hover

import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type WavePhase = 'idle' | 'lift' | 'bloom' | 'settle';

@Component({
  selector: 'app-zengrid-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo" [class.stacked]="layout === 'stacked'" [class.dark]="variant === 'dark'">
      <div class="logo-icon">
        <div 
          *ngFor="let i of cells"
          class="cell"
          [attr.data-index]="i"
          [class.wave-lift]="wavePhases[i] === 'lift'"
          [class.wave-bloom]="wavePhases[i] === 'bloom'"
          [class.wave-settle]="wavePhases[i] === 'settle'"
          (mouseenter)="triggerWave(i)">
        </div>
      </div>
      
      <div *ngIf="showWordmark" class="wordmark">
        <span class="zen">Zen</span><span class="grid">Grid</span>
      </div>
      
      <span *ngIf="showTagline" class="tagline">Performance First</span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    
    .logo.stacked {
      flex-direction: column;
      gap: 24px;
    }
    
    .logo-icon {
      position: relative;
      width: 120px;
      height: 120px;
      cursor: pointer;
    }
    
    .cell {
      position: absolute;
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #3db892 0%, #2a9d7a 100%);
      border-radius: 5px;
      transition: 
        transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
        opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
        box-shadow 0.5s ease;
    }
    
    .dark .cell {
      background: linear-gradient(135deg, #4ecca3 0%, #3db892 100%);
      box-shadow: 0 2px 12px rgba(78, 204, 163, 0.12);
    }
    
    /* Cell positions and base styles */
    .cell[data-index="0"] { left: 0; top: 0; opacity: 0.55; border-radius: 10px 5px 5px 5px; }
    .cell[data-index="1"] { left: 43px; top: 0; opacity: 0.7; }
    .cell[data-index="2"] { left: 86px; top: 0; opacity: 0.55; border-radius: 5px 10px 5px 5px; }
    .cell[data-index="3"] { left: 0; top: 43px; opacity: 0.7; }
    .cell[data-index="4"] { left: 43px; top: 43px; opacity: 1; }
    .cell[data-index="5"] { left: 86px; top: 43px; opacity: 0.7; }
    .cell[data-index="6"] { left: 0; top: 86px; opacity: 0.45; border-radius: 5px 5px 5px 10px; }
    .cell[data-index="7"] { left: 43px; top: 86px; opacity: 0.55; }
    .cell[data-index="8"] { left: 86px; top: 86px; opacity: 0.45; border-radius: 5px 5px 10px 5px; }
    
    .dark .cell[data-index="4"] {
      box-shadow: 0 4px 20px rgba(78, 204, 163, 0.25);
    }
    
    /* Wave animation phases */
    .cell.wave-lift {
      transform: translateY(-3px) scale(0.92);
      opacity: 0.9 !important;
    }
    
    .cell.wave-bloom {
      transform: translateY(0) scale(1.04);
      opacity: 1 !important;
      box-shadow: 0 4px 16px rgba(61, 184, 146, 0.25);
    }
    
    .dark .cell.wave-bloom {
      box-shadow: 0 6px 24px rgba(78, 204, 163, 0.35);
    }
    
    .cell.wave-settle {
      transform: translateY(0) scale(1);
    }
    
    /* Wordmark */
    .wordmark {
      font-family: 'Outfit', 'SF Pro Display', system-ui, sans-serif;
      font-size: 44px;
      font-weight: 300;
      letter-spacing: 6px;
    }
    
    .wordmark .zen {
      color: #3db892;
      font-weight: 400;
    }
    
    .wordmark .grid {
      color: #1a1a2e;
    }
    
    .dark .wordmark .zen {
      color: #4ecca3;
    }
    
    .dark .wordmark .grid {
      color: #fff;
      opacity: 0.95;
    }
    
    .tagline {
      font-size: 10px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #3db892;
      opacity: 0.5;
    }
    
    .dark .tagline {
      color: #4ecca3;
    }
  `]
})
export class ZenGridLogoComponent implements OnDestroy {
  @Input() variant: 'light' | 'dark' = 'light';
  @Input() showWordmark = true;
  @Input() showTagline = false;
  @Input() layout: 'horizontal' | 'stacked' = 'horizontal';
  
  cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  wavePhases: Record<number, WavePhase> = {};
  
  private isAnimating = false;
  private timeouts: number[] = [];
  
  // Timing configuration
  private readonly STAGGER_DELAY = 90;
  private readonly LIFT_DURATION = 280;
  private readonly BLOOM_DURATION = 320;
  private readonly SETTLE_DURATION = 400;
  
  constructor() {
    this.cells.forEach(i => this.wavePhases[i] = 'idle');
  }
  
  ngOnDestroy(): void {
    this.timeouts.forEach(t => clearTimeout(t));
  }
  
  triggerWave(hoveredIndex: number): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
    
    const hoveredRow = Math.floor(hoveredIndex / 3);
    const hoveredCol = hoveredIndex % 3;
    
    let maxDistance = 0;
    this.cells.forEach(i => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const distance = Math.abs(row - hoveredRow) + Math.abs(col - hoveredCol);
      if (distance > maxDistance) maxDistance = distance;
    });
    
    this.cells.forEach((i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const distance = Math.abs(row - hoveredRow) + Math.abs(col - hoveredCol);
      const delay = distance * this.STAGGER_DELAY;
      
      // Phase 1: Lift
      this.timeouts.push(window.setTimeout(() => {
        this.setPhase(i, 'lift');
        
        // Phase 2: Bloom
        this.timeouts.push(window.setTimeout(() => {
          this.setPhase(i, 'bloom');
          
          // Phase 3: Settle
          this.timeouts.push(window.setTimeout(() => {
            this.setPhase(i, 'settle');
            
            // Reset to idle
            this.timeouts.push(window.setTimeout(() => {
              this.setPhase(i, 'idle');
              
              if (distance === maxDistance) {
                this.timeouts.push(window.setTimeout(() => {
                  this.isAnimating = false;
                }, 200));
              }
            }, this.SETTLE_DURATION));
          }, this.BLOOM_DURATION));
        }, this.LIFT_DURATION));
      }, delay));
    });
  }
  
  private setPhase(index: number, phase: WavePhase): void {
    this.wavePhases = { ...this.wavePhases, [index]: phase };
  }
}


/*
═══════════════════════════════════════════════════════════
USAGE
═══════════════════════════════════════════════════════════

// Light variant
<app-zengrid-logo></app-zengrid-logo>

// Dark variant
<app-zengrid-logo variant="dark"></app-zengrid-logo>

// With tagline
<app-zengrid-logo variant="dark" [showTagline]="true"></app-zengrid-logo>

// Stacked layout
<app-zengrid-logo layout="stacked"></app-zengrid-logo>

// Icon only
<app-zengrid-logo [showWordmark]="false"></app-zengrid-logo>

// Example in header
<header class="dark-header">
  <app-zengrid-logo variant="dark"></app-zengrid-logo>
</header>
*/
