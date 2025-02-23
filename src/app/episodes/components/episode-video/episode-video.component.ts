import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, tap } from 'rxjs';
import { Episode, Video } from '../../models';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-video',
  imports: [],
  templateUrl: './episode-video.component.html',
  styleUrl: './episode-video.component.scss'
})
export class EpisodeVideoComponent implements OnInit {
  private readonly episodeService = inject(EpisodeService);
  private readonly route = inject(ActivatedRoute);
  
  protected episode?: Episode;
  protected video?: Video;
  
  ngOnInit() {
    this.episodeService.episode$.pipe(
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
      })
    ).subscribe();
  }
}
