import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Episode } from '../../models';
import { EpisodeService } from '../../services/episode.service';
@Component({
  selector: 'app-episode-quiz',
  imports: [RouterLink],
  templateUrl: './episode-quiz.component.html',
  styleUrl: './episode-quiz.component.scss',
})
export class EpisodeQuizComponent implements OnInit {
  private readonly episodeService = inject(EpisodeService);

  protected episode?: Episode;

  ngOnInit() {
    this.episodeService.episode$.subscribe((episode?: Episode) => {
      if (episode) {
        this.episode = episode;
      }
    });
  }
}
