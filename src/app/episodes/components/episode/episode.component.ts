import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Episode } from '../../models';
import { AudioService } from '../../services/audio.service';
import { EpisodeService } from '../../services/episode.service';
import { AudioControlComponent } from '../audio-control/audio-control.component';

@Component({
  selector: 'app-episode',
  imports: [RouterOutlet, AudioControlComponent],
  templateUrl: './episode.component.html',
  providers: [],
  styleUrl: './episode.component.scss',
})
export class EpisodeComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly episodeService = inject(EpisodeService);
  private readonly audioService = inject(AudioService);
  private subscriptions = new Subscription();

  protected episode?: Episode;

  ngOnInit() {
    // Initialize background music
    this.audioService.initBackgroundMusic(
      '/audio/Dark Comedy Ident - Main.mp3',
    );

    // Start playing music initially
    this.audioService.play();

    // Monitor route changes to control audio playback between screens
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          const url = event.url;
          const isVideoScreen = url.includes('/video');

          if (!isVideoScreen) {
            // When navigating between non-video screens,
            // ensure audio is playing but don't restart
            if (!this.audioService.isPlaying()) {
              this.audioService.play(false); // Continue from where it left off
            }
          }
          // Audio behavior for video screens is now handled entirely by the video component
        }),
    );

    // Subscribe to episode params
    this.subscriptions.add(
      this.route.params.subscribe((params) => {
        const episodeNumber = params['episodeNumber'];
        if (episodeNumber) {
          this.loadEpisode(Number(episodeNumber));
        }
      }),
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();

    // Pause audio when leaving the episode component completely
    this.audioService.pause();
  }

  private loadEpisode(episodeNumber: number) {
    fetch(`episodes/${episodeNumber}/episode.json`)
      .then((response) => response.json())
      .then((episodeData) => {
        this.episode = episodeData;
        this.episodeService.setEpisode(episodeData);
      })
      .catch((error) => this.router.navigate(['/']));
  }
}
