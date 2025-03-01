import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../services/audio.service';
import { AnnouncementService } from '../../services/announcement.service';
import { CommonModule } from '@angular/common';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-audio-control',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgIf],
  template: `
    <div 
      class="audio-control" 
      [class.playing]="isPlaying$ | async"
      role="group" 
      aria-label="Background music controls"
    >
      <button 
        (click)="toggleAudio()" 
        [attr.aria-label]="(isPlaying$ | async) ? 'Pause background music' : 'Play background music'"
        [attr.aria-pressed]="(isPlaying$ | async) ? 'true' : 'false'"
      >
        <span class="icon" aria-hidden="true">
          <span *ngIf="isPlaying$ | async" class="pause-icon">⏸</span>
          <span *ngIf="!(isPlaying$ | async)" class="play-icon">▶️</span>
        </span>
      </button>
      <div class="volume-control">
        <label for="volume-slider" class="sr-only">Background music volume</label>
        <input 
          id="volume-slider"
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          [ngModel]="volume" 
          (ngModelChange)="setVolume($event)"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-valuenow]="Math.round(volume * 100)"
          [attr.aria-valuetext]="getVolumeText()"
        />
      </div>
      <span class="keyboard-hint" *ngIf="showKeyboardHint">
        Keyboard shortcuts: 'M' to mute/unmute, 'Up/Down arrows' to change volume
      </span>
    </div>
  `,
  styles: `
    .audio-control {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px;
      border-radius: 20px;
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .audio-control:hover .keyboard-hint {
      opacity: 1;
      visibility: visible;
    }
    
    button {
      background: none;
      border: none;
      cursor: pointer;
      margin-right: 8px;
      color: white;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    button:focus {
      outline: 2px solid white;
      border-radius: 50%;
    }

    .volume-control {
      display: flex;
      flex-direction: column;
    }
    
    .icon {
      font-size: 1.2rem;
    }
    
    input[type=range] {
      width: 80px;
    }

    input[type=range]:focus {
      outline: 2px solid white;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    
    .keyboard-hint {
      position: absolute;
      top: -40px;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px;
      border-radius: 5px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease;
    }
  `
})
export class AudioControlComponent implements OnInit {
  private readonly audioService = inject(AudioService);
  private readonly announcementService = inject(AnnouncementService);
  
  protected volume = 0.5;
  protected isPlaying$ = this.audioService.isPlaying$;
  protected Math = Math; // Make Math available to the template
  protected showKeyboardHint = false;
  
  ngOnInit(): void {
    // Set initial volume from service
    this.volume = this.audioService.getVolume();
    
    // Show keyboard hint for a few seconds on init
    this.showKeyboardHint = true;
    setTimeout(() => {
      this.showKeyboardHint = false;
    }, 5000);
    
    // Listen for audio state changes to announce to screen readers
    this.isPlaying$.subscribe(isPlaying => {
      if (isPlaying) {
        this.announcementService.announce('Background music started playing');
      } else {
        this.announcementService.announce('Background music paused');
      }
    });
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ignore key events when focus is on input or text area elements
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement
    ) {
      return;
    }
    
    switch (event.key.toLowerCase()) {
      case 'm': // 'M' key for mute/unmute
        this.toggleAudio();
        event.preventDefault();
        break;
      case 'arrowup': // Up arrow to increase volume
        this.adjustVolume(0.1);
        event.preventDefault();
        break;
      case 'arrowdown': // Down arrow to decrease volume
        this.adjustVolume(-0.1);
        event.preventDefault();
        break;
    }
  }
  
  protected toggleAudio(): void {
    this.audioService.toggle();
    // Show keyboard hint briefly when manually toggling
    this.showKeyboardHint = true;
    setTimeout(() => {
      this.showKeyboardHint = false;
    }, 3000);
  }
  
  protected setVolume(value: number): void {
    this.volume = value;
    this.audioService.setVolume(value);
    
    // Announce volume change to screen readers
    this.announcementService.announce(this.getVolumeText());
  }
  
  private adjustVolume(delta: number): void {
    const newVolume = Math.min(Math.max(this.volume + delta, 0), 1);
    this.setVolume(newVolume);
    
    // Show keyboard hint briefly when changing volume
    this.showKeyboardHint = true;
    setTimeout(() => {
      this.showKeyboardHint = false;
    }, 3000);
  }

  protected getVolumeText(): string {
    const percentage = Math.round(this.volume * 100);
    return `Volume ${percentage}%`;
  }
} 