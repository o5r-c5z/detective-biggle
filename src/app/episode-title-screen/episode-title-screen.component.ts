import { Component, HostBinding, Input } from '@angular/core';
import { Episode } from '../models';

@Component({
  selector: 'app-episode-title-screen',
  imports: [],
  templateUrl: './episode-title-screen.component.html',
  styleUrl: './episode-title-screen.component.scss',
})
export class EpisodeTitleScreenComponent {
  @Input() episode!: Episode;

  @HostBinding('style.--episode-title-background')
  get backgroundImage() {
    return `url("${this.episode.titleBackground}")`;
  }
}
