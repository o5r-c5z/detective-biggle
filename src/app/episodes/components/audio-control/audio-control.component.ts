import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AnnouncementService } from '../../services/announcement.service';
import { AudioService } from '../../services/audio.service';

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
  protected showKeyboardHint = false;
  protected faVolumeXmark = faVolumeXmark;
  protected faVolumeHigh = faVolumeHigh;

  ngOnInit(): void {
    this.volume = this.audioService.getVolume();

    this.showKeyboardHint = true;
    setTimeout(() => {
      this.showKeyboardHint = false;
    }, 5000);

    this.audioSubscription = this.isPlaying$.subscribe((isPlaying) => {
      if (isPlaying) {
        this.announcementService.announce('Musique de fond en cours');
      } else {
        this.announcementService.announce('Musique de fond mise en pause');
      }
    });
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
