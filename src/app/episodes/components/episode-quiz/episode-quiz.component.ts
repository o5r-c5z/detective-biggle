import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  protected episode?: Episode;
  protected quizStep?: number;

  @HostBinding('class.screen')
  @HostBinding('style.--screen-background')
  get backgroundImage() {
    return !this.isQuizComplete()
      ? `url("/images/Ecran_UI.jpg")`
      : `url("/images/Table_enquete_UI.jpg")`;
  }

  @HostBinding('style.--screen-background-overlay-opacity')
  get backgroundOverlayOpacity() {
    return !this.isQuizComplete() ? 0.8 : 0.9;
  }

  ngOnInit() {
    this.episodeService.episode$.subscribe((episode?: Episode) => {
      this.episode = episode;
    });
    this.episodeService.quizStep$.subscribe((quizStep: number) => {
      this.quizStep = quizStep;
    });
  }

  protected isQuizComplete() {
    return this.episodeService.isQuizComplete();
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
    correction?.classList.add('active');
    if (
      selectedAnswerIndex ===
      this.episode?.questions[questionIndex].correctAnswer
    ) {
      const fieldset = input.closest('fieldset');
      if (fieldset) {
        fieldset.disabled = true;
      }
      setTimeout(() => {
        this.episodeService.incrementQuizStep();
      }, 2000);
    } else {
      setTimeout(() => {
        if (correction) {
          correction.classList.remove('active');
        }
      }, 2000);
    }
  }

  protected onResetQuiz() {
    this.episodeService.resetQuiz();
  }
}
