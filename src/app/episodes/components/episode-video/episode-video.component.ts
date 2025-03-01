import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  inject,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Player from '@vimeo/player';
import { mergeMap, tap } from 'rxjs';
import { Episode, Video } from '../../models';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-video',
  imports: [RouterLink],
  templateUrl: './episode-video.component.html',
  styleUrl: './episode-video.component.scss',
})
export class EpisodeVideoComponent implements AfterViewInit {
  private readonly episodeService = inject(EpisodeService);
  private readonly route = inject(ActivatedRoute);
  private player?: Player;

  protected episode?: Episode;
  protected video?: Video;
  protected videoEnded = false;

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

  private initializePlayer() {
    if (!this.video) {
      return;
    }
    this.player = new Player(this.playerContainer.nativeElement, {
      url: this.video?.url,
      responsive: true,
    });
    this.player.play();
    this.player.on('ended', () => {
      this.videoEnded = true;
    });
  }

  protected restartVideo() {
    this.videoEnded = false;
    this.player?.play();
  }

  protected goToPedagogicalConcept() {
    this.videoEnded = false;
    this.player?.play();
  }
}
