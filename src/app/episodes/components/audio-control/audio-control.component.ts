import { CommonModule } from '@angular/common';
import {
  Component,
  HostBinding,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AnnouncementService } from '../../services/announcement.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-audio-control',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './audio-control.component.html',
  styleUrl: './audio-control.component.scss',
})
export class AudioControlComponent implements OnInit, OnDestroy {
  private readonly audioService = inject(AudioService);
  private readonly announcementService = inject(AnnouncementService);
  private audioSubscription: Subscription | undefined;

  protected volume = this.audioService.getVolume();
  protected showKeyboardHint = false;
  protected faVolumeXmark = faVolumeXmark;
  protected faVolumeHigh = faVolumeHigh;

  get isPlaying() {
    return this.audioService.isPlaying();
  }

  @HostBinding('attr.aria-label')
  get ariaLabel() {
    return 'Contrôle de la musique de fond';
  }

  @HostBinding('attr.role')
  get role() {
    return 'group';
  }

  ngOnInit(): void {
    this.showKeyboardHint = true;
    setTimeout(() => {
      this.showKeyboardHint = false;
    }, 5000);

    this.audioSubscription = this.audioService.isPlaying$.subscribe(
      (isPlaying) => {
        if (isPlaying) {
          this.announcementService.announce('Musique de fond en cours');
        } else {
          this.announcementService.announce('Musique de fond mise en pause');
        }
      },
    );
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'm':
        this.toggleAudio();
        event.preventDefault();
        break;
    }
  }

  protected toggleAudio(): void {
    this.audioService.toggle();
    this.showKeyboardHint = true;
    setTimeout(() => {
      this.showKeyboardHint = false;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.audioSubscription) {
      this.audioSubscription.unsubscribe();
    }
  }
}
