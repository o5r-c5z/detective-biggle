import { Component, inject } from '@angular/core';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-quiz',
  imports: [],
  templateUrl: './episode-quiz.component.html',
  styleUrl: './episode-quiz.component.scss'
})
export class EpisodeQuizComponent {
  private readonly episodeService = inject(EpisodeService);
  protected readonly episode = this.episodeService.getEpisode();
}
