import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Player from '@vimeo/player';
import { mergeMap, tap } from 'rxjs';
import { Episode, Video } from '../../models';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-video',
  imports: [],
  templateUrl: './episode-video.component.html',
  styleUrl: './episode-video.component.scss',
})
export class EpisodeVideoComponent implements AfterViewInit {
  @ViewChild('playerContainer') playerContainer!: ElementRef;

  private readonly episodeService = inject(EpisodeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected episode?: Episode;
  protected video?: Video;

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
        console.log('video', this.video);
        if (!this.video) {
          return;
        }
        const player = new Player(this.playerContainer.nativeElement, {
          url: this.video?.url,
        });
        player.play();
        player.on('ended', () => {
          this.onVideoEnded();
        });
      });
  }

  private onVideoEnded() {
    this.router.navigate(['../quiz'], { relativeTo: this.route });
  }
}
