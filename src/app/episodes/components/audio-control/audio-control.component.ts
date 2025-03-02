import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AnnouncementService } from '../../services/announcement.service';
import { AudioService } from '../../services/audio.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faVolumeXmark, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-audio-control',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgIf, FontAwesomeModule],
  templateUrl: './audio-control.component.html',
  styleUrl: './audio-control.component.scss',
})
export class AudioControlComponent implements OnInit, OnDestroy {
  private readonly audioService = inject(AudioService);
  private readonly announcementService = inject(AnnouncementService);
  private audioSubscription: Subscription | undefined;

  protected volume = 0.5;
  protected isPlaying$ = this.audioService.isPlaying$;
  protected Math = Math; // Make Math available to the template
  protected showKeyboardHint = false;
  protected faVolumeXmark = faVolumeXmark;
  protected faVolumeHigh = faVolumeHigh;

  ngOnInit(): void {
    // Set initial volume from service
    this.volume = this.audioService.getVolume();

    // Show keyboard hint for a few seconds on init
    this.showKeyboardHint = true;
    setTimeout(() => {
      this.showKeyboardHint = false;
    }, 5000);

    // Listen for audio state changes to announce to screen readers
    this.audioSubscription = this.isPlaying$.subscribe((isPlaying) => {
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

  ngOnDestroy(): void {
    if (this.audioSubscription) {
      this.audioSubscription.unsubscribe();
    }
  }
}
