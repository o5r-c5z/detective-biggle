import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EpisodeTitleScreenComponent } from '../episode-title-screen/episode-title-screen.component';
import { Episode } from '../models';

@Component({
  selector: 'app-episode',
  imports: [EpisodeTitleScreenComponent],
  templateUrl: './episode.component.html',
  styleUrl: './episode.component.scss'
})
export class EpisodeComponent {
  episode!: Episode;
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      const episodeNumber = params['episodeNumber'];
      if (episodeNumber) {
        this.loadEpisode(Number(episodeNumber));
      }
    });
  }
  
  private loadEpisode(episodeNumber: number) {
    fetch(`episodes/${episodeNumber}/episode.json`)
    .then(response => response.json())
    .then(episodeData => this.episode = episodeData)
    .catch(error => console.error('Error loading episode:', error));
  }
}
