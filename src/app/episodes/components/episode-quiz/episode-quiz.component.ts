import { Component, inject, OnInit } from '@angular/core';
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

  ngOnInit() {
    this.episodeService.episode$.subscribe((episode?: Episode) => {
      this.episode = episode;
    });
    this.episodeService.quizStep$.subscribe((quizStep: number) => {
      this.quizStep = quizStep;
    });
  }

  onAnswerSelected(
    $event: Event,
    questionIndex: number,
    selectedAnswerIndex: number
  ) {
    const input = $event.target as HTMLInputElement;
    const correctionId = input.getAttribute('aria-describedby');
    const correction = correctionId
      ? document.getElementById(correctionId)
      : null;
    if (correction) {
      correction.classList.add('active');
    }
    if (
      selectedAnswerIndex === this.episode?.questions[questionIndex].correctAnswer
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

  isQuizComplete() {
    return this.episodeService.isQuizComplete();
  }
}
