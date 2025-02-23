import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Episode } from '../models';

@Injectable()
export class EpisodeService {
  private readonly episodeSubject = new BehaviorSubject<Episode | undefined>(undefined);
  
  episode$ = this.episodeSubject.asObservable();
  
  setEpisode(episode: Episode) {
    this.episodeSubject.next(episode);
  }

  getEpisode() {
    return this.episodeSubject.getValue();
  }
}
