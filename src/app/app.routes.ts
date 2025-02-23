import { Routes } from '@angular/router';
import { EpisodeQuizComponent } from './episode-quiz/episode-quiz.component';
import { EpisodeTitleScreenComponent } from './episode-title-screen/episode-title-screen.component';
import { EpisodeVideoComponent } from './episode-video/episode-video.component';
import { EpisodeComponent } from './episode/episode.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  {
    path: ':episodeNumber',
    component: EpisodeComponent,
    children: [
      { path: 'video', component: EpisodeVideoComponent },
      { path: 'quiz', component: EpisodeQuizComponent },
      { path: '**', component: EpisodeTitleScreenComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
