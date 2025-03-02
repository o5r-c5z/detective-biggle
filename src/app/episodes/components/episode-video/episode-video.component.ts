import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import Player from '@vimeo/player';
import { mergeMap, Subscription, tap } from 'rxjs';
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
  private readonly router = inject(Router);
  private readonly audioService = inject(AudioService);
  private readonly announcementService = inject(AnnouncementService);
  private player?: Player;
  private subscription?: Subscription;

  protected episode?: Episode;
  protected video?: Video;
  protected isClueVideo = false;
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
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.player?.destroy();
    this.subscription?.unsubscribe();
  }

  private setupSubscriptions() {
    this.subscription = this.episodeService.episode$
      .pipe(
        tap((episode?: Episode) => {
          this.episode = episode;
        }),
        mergeMap(() => this.route.queryParams),
        tap((params) => {
          this.videoEnded = false;

          const videoType = params['videoType'];
          this.isClueVideo = videoType === 'clue';
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

          this.audioService.pause();
          this.announcementService.announce(
            'Musique de fond mise en pause. Nouvelle vidéo en cours de lecture.',
          );
        }),
      )
      .subscribe(() => {
        if (this.player) {
          this.destroyPlayer();
        }
        this.initializePlayer();
      });
  }

  protected restartBackgroundMusic(): void {
    this.audioService.play(true);
    this.announcementService.announce('Reprise de la musique de fond.');
  }

  private initializePlayer() {
    if (!this.video) {
      return;
    }

    const videoTitle = this.video?.title || '';

    this.audioService.pause();

    this.player = new Player(this.playerContainer.nativeElement, {
      url: this.video?.url,
      responsive: true,
    });

    this.player.on('loaded', () => {
      const iframe = this.playerContainer.nativeElement.querySelector('iframe');
      if (iframe) {
        iframe.setAttribute('title', videoTitle);
        iframe.setAttribute('aria-label', `Vidéo: ${videoTitle}`);
        iframe.focus();
      }

      this.announcementService.announce(`Vidéo chargée: ${videoTitle}`);
    });

    this.player.play();

    this.player.on('play', () => {
      this.audioService.pause();
      this.announcementService.announce(`Lecture de la vidéo: ${videoTitle}`);
    });

    this.player.on('pause', () => {
      this.announcementService.announce('Vidéo mise en pause');
    });

    this.player.on('ended', () => {
      this.onVideoEnded();
    });
  }

  private onVideoEnded() {
    if (!this.isClueVideo) {
      this.videoEnded = true;
      this.destroyPlayer();

      this.restartBackgroundMusic();
      this.announcementService.announce(
        'Vidéo terminée. Reprise de la musique de fond.',
      );

      setTimeout(() => {
        const firstButton = document.getElementById(
          'episode-video__go-to-quiz-btn',
        );
        if (firstButton) {
          firstButton.focus();
        }
      }, 100);
    } else {
      this.router.navigate(['../quiz'], { relativeTo: this.route });
    }
  }

  private destroyPlayer() {
    this.player?.destroy();
    this.player = undefined;
  }

  protected restartVideo() {
    this.videoEnded = false;
    this.initializePlayer();
    this.audioService.pause();
    this.announcementService.announce(
      'Redémarrage de la vidéo. Musique de fond mise en pause.',
    );
    this.player?.play();
  }

  protected goToPedagogicalConcept() {
    this.videoEnded = false;
    this.audioService.pause();
    this.announcementService.announce(
      'Changement vers la vidéo du concept pédagogique. Musique de fond mise en pause.',
    );
    this.player?.play();
  }
}
