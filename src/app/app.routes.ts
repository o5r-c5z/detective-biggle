import { Routes } from '@angular/router';
import { EpisodeComponent } from './episode/episode.component';

export const routes: Routes = [
  { path: ':episodeNumber', component: EpisodeComponent },
  { path: '', redirectTo: '1', pathMatch: 'full' },
];
