import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Episode } from '../models';
import { EpisodeService } from '../services/episode.service';

@Component({
  selector: 'app-episode',
  imports: [RouterOutlet],
  templateUrl: './episode.component.html',
  providers: [EpisodeService],
  styleUrl: './episode.component.scss'
})
export class EpisodeComponent {
  episode!: Episode;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private episodeService = inject(EpisodeService);
  
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
    .then(episodeData => {
      this.episode = episodeData;
      this.episodeService.setEpisode(episodeData);
    })
    .catch(error => this.router.navigate(['/']));
  }
}
