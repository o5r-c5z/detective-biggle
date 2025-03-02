import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Episode } from '../../models';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-quiz',
  imports: [RouterLink],
  templateUrl: './episode-quiz.component.html',
  styleUrl: './episode-quiz.component.scss',
})
export class EpisodeQuizComponent implements OnInit {
  private readonly episodeService = inject(EpisodeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected episode?: Episode;
  protected quizStep?: number;

  @HostBinding('class.screen')
  @HostBinding('style.--screen-background')
  get backgroundImage() {
    return `url("/images/Ecran_UI.jpg")`;
  }

  @HostBinding('style.--screen-background-overlay-opacity')
  get backgroundOverlayOpacity() {
    return 0.8;
  }

  ngOnInit() {
    this.episodeService.episode$.subscribe((episode?: Episode) => {
      this.episode = episode;
    });
    this.episodeService.quizStep$.subscribe((quizStep: number) => {
      this.quizStep = quizStep;
    });
  }

  protected onAnswerSelected(
    $event: Event,
    questionIndex: number,
    selectedAnswerIndex: number,
  ) {
    const input = $event.target as HTMLInputElement;
    const correctionId = input.getAttribute('aria-describedby');
    const correction = correctionId
      ? document.getElementById(correctionId)
      : null;
    const isCorrect =
      selectedAnswerIndex ===
      this.episode?.questions[questionIndex].correctAnswer;

    correction?.classList.add('active');

    if (isCorrect) {
      const fieldset = input.closest('fieldset');
      if (fieldset) {
        fieldset.disabled = true;
      }
      setTimeout(() => {
        this.episodeService.incrementQuizStep();

        if (this.episodeService.isQuizComplete()) {
          this.router.navigate(['../video'], {
            queryParams: { videoType: 'resolution' },
            relativeTo: this.route,
          });
        }
      }, 2000);
    } else {
      setTimeout(() => {
        if (correction) {
          correction.classList.remove('active');
        }
      }, 2000);
    }
  }
}
