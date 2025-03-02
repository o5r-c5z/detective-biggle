import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import Player from '@vimeo/player';
import { mergeMap, tap } from 'rxjs';
import { Episode, Video } from '../../models';
import { AnnouncementService } from '../../services/announcement.service';
import { AudioService } from '../../services/audio.service';
import { EpisodeService } from '../../services/episode.service';
@Component({
  selector: 'app-episode-video',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './episode-video.component.html',
  styleUrl: './episode-video.component.scss',
})
export class EpisodeVideoComponent implements AfterViewInit, OnDestroy {
  private readonly episodeService = inject(EpisodeService);
  private readonly route = inject(ActivatedRoute);
  private readonly audioService = inject(AudioService);
  private readonly announcementService = inject(AnnouncementService);
  private player?: Player;

  protected episode?: Episode;
  protected video?: Video;
  protected videoEnded = false;
  protected faArrowRotateLeft = faArrowRotateLeft;

  @ViewChild('playerContainer') playerContainer!: ElementRef;

  @HostBinding('class.screen')
  @HostBinding('style.--screen-background')
  get backgroundImage() {
    return !this.videoEnded
      ? `url("/images/Tableau_UI.jpg")`
      : `url("/images/Decors_Bureau 1.jpg")`;
  }

  @HostBinding('style.--screen-background-overlay-opacity')
  get backgroundOverlayOpacity() {
    return this.videoEnded ? 0.45 : 0.8;
  }

  ngAfterViewInit() {
    this.audioService.pause();
    this.announcementService.announce(
      'Background music paused. Video will start playing.',
    );

    this.episodeService.episode$
      .pipe(
        tap((episode?: Episode) => {
          this.episode = episode;
        }),
        mergeMap(() => this.route.queryParams),
        tap((params) => {
          const videoType = params['videoType'];
          switch (videoType) {
            case 'pedagogicalConcept':
              this.video = this.episode?.pedagogicalConcept;
              break;
            case 'clue':
              const clueNumber = params['clue'];
              if (clueNumber) {
                this.video = this.episode?.clues[clueNumber];
              }
              break;
            case 'resolution':
              this.video = this.episode?.resolution;
              break;
            case 'investigation':
            default:
              this.video = this.episode?.investigation;
              break;
          }
        }),
      )
      .subscribe(() => {
        this.initializePlayer();
      });
  }

  ngOnDestroy() {
    this.player?.destroy();
  }

  /**
   * Helper method to restart background music from the beginning
   */
  private restartBackgroundMusic(): void {
    this.audioService.play(true); // true = restart from beginning
    this.announcementService.announce(
      'Background music resumed from the beginning.',
    );
  }

  private initializePlayer() {
    if (!this.video) {
      return;
    }
    this.player = new Player(this.playerContainer.nativeElement, {
      url: this.video?.url,
      responsive: true,
    });

    // Add player event handlers
    this.player.on('loaded', () => {
      // Set ARIA label for the iframe for better accessibility
      const iframe = this.playerContainer.nativeElement.querySelector('iframe');
      if (iframe) {
        iframe.setAttribute(
          'aria-label',
          `Video: ${this.video?.title || 'Educational video'}`,
        );
        iframe.setAttribute('title', this.video?.title || 'Educational video');
      }

      this.announcementService.announce(
        `Video loaded: ${this.video?.title || 'Educational video'}`,
      );
    });

    this.player.play();

    this.player.on('play', () => {
      // If video starts playing again after being paused, pause the background music again
      this.audioService.pause();
      this.announcementService.announce(
        `Playing video: ${this.video?.title || 'Educational video'}`,
      );
    });

    this.player.on('pause', () => {
      this.announcementService.announce('Video paused');
    });

    this.player.on('ended', () => {
      this.videoEnded = true;
      // Restart background music when video ends
      this.restartBackgroundMusic();
      this.announcementService.announce(
        'Video ended. Background music resumed from the beginning.',
      );
    });
  }

  protected restartVideo() {
    this.videoEnded = false;
    this.audioService.pause();
    this.announcementService.announce(
      'Restarting video. Background music paused.',
    );
    this.player?.play();
  }

  protected goToPedagogicalConcept() {
    this.videoEnded = false;
    this.audioService.pause();
    this.announcementService.announce(
      'Switching to pedagogical concept video. Background music paused.',
    );
    this.player?.play();
  }
}
