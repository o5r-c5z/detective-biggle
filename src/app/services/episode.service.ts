import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Episode } from '../models';

@Injectable()
export class EpisodeService {
  private episodeSubject = new BehaviorSubject<Episode | null>(null);
  episode$ = this.episodeSubject.asObservable();

  setEpisode(episode: Episode) {
    this.episodeSubject.next(episode);
  }
}