import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EpisodeService } from '../../services/episode.service';
import { Video } from '../../models';

@Component({
  selector: 'app-episode-video',
  imports: [],
  templateUrl: './episode-video.component.html',
  styleUrl: './episode-video.component.scss'
})
export class EpisodeVideoComponent implements OnInit {
  private readonly episodeService = inject(EpisodeService);
  private readonly route = inject(ActivatedRoute);
  
  protected readonly episode = this.episodeService.getEpisode();
  protected video?: Video;
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const clueNumber = params['clue'];
      if (!clueNumber) {
        this.video = this.episode?.investigationVideo;
      } else {
        this.video = this.episode?.clues[clueNumber];
      }
    });
  }
}
