import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Episode } from '../../models';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-title-screen',
  imports: [RouterLink],
  templateUrl: './episode-title-screen.component.html',
  styleUrl: './episode-title-screen.component.scss',
})
export class EpisodeTitleScreenComponent implements OnInit {
  private readonly episodeService = inject(EpisodeService);

  protected episode?: Episode;

  @HostBinding('class.screen')
  @HostBinding('style.--screen-background')
  get backgroundImage() {
    return `url("${this.episode?.titleBackground}")`;
  }

  ngOnInit() {
    this.episodeService.episode$.subscribe((episode?: Episode) => {
      if (episode) {
        this.episode = episode;
      }
    });
  }
}
