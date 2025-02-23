import { Routes } from '@angular/router';
import { EpisodeQuizComponent } from './episodes/components/episode-quiz/episode-quiz.component';
import { EpisodeTitleScreenComponent } from './episodes/components/episode-title-screen/episode-title-screen.component';
import { EpisodeVideoComponent } from './episodes/components/episode-video/episode-video.component';
import { EpisodeComponent } from './episodes/components/episode/episode.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  {
    path: ':episodeNumber',
    component: EpisodeComponent,
    children: [
      { path: 'video', component: EpisodeVideoComponent, data: { queryParams: ['videoType', 'clue'] } },
      { path: 'quiz', component: EpisodeQuizComponent },
      { path: '**', component: EpisodeTitleScreenComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
