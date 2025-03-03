import { Component, HostBinding, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-completion',
  imports: [RouterLink],
  templateUrl: './episode-completion.component.html',
  styleUrl: './episode-completion.component.scss',
})
export class EpisodeCompletionComponent {
  private readonly episodeService = inject(EpisodeService);

  @HostBinding('class.screen')
  @HostBinding('style.--screen-background-landscape')
  get backgroundImageLandscape() {
    return `url("/images/backgrounds/landscape/Table_enquete_UI.jpg")`;
  }

  @HostBinding('style.--screen-background-portrait')
  get backgroundImagePortrait() {
    return `url("/images/backgrounds/portrait/Table_enquete_UI.png")`;
  }

  @HostBinding('style.--screen-background-overlay-opacity')
  get backgroundOverlayOpacity() {
    return 0.9;
  }

  protected resetQuiz() {
    this.episodeService.resetQuiz();
  }
}
