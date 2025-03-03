import {
  Component,
  ElementRef,
  HostBinding,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Episode } from '../../models';
import { EpisodeService } from '../../services/episode.service';

@Component({
  selector: 'app-episode-quiz',
  imports: [RouterLink],
  templateUrl: './episode-quiz.component.html',
  styleUrl: './episode-quiz.component.scss',
})
export class EpisodeQuizComponent implements OnInit, OnDestroy {
  private readonly episodeService = inject(EpisodeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private subscription?: Subscription;

  @ViewChild('form')
  protected form!: ElementRef<HTMLFormElement>;

  protected episode?: Episode;
  protected quizStep: number = 0;

  @HostBinding('class.screen')
  @HostBinding('style.--screen-background-landscape')
  get backgroundImageLandscape() {
    return `url("/images/landscape/Ecran_UI.jpg")`;
  }

  @HostBinding('style.--screen-background-portrait')
  get backgroundImagePortrait() {
    return `url("/images/portrait/Ecran_UI.jpg")`;
  }

  @HostBinding('style.--screen-background-overlay-opacity')
  get backgroundOverlayOpacity() {
    return 0.8;
  }

  ngOnInit() {
    this.subscription = this.episodeService.episode$
      .pipe(
        tap((episode?: Episode) => {
          this.episode = episode;
        }),
        mergeMap(() => this.episodeService.quizStep$),
      )
      .subscribe((quizStep: number) => {
        this.quizStep = quizStep;
        this.focusFirstInput();
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private focusFirstInput(): void {
    setTimeout(() => {
      const firstRadioInput = this.form.nativeElement.querySelector(
        'fieldset:not([hidden]) input:first-of-type',
      ) as HTMLInputElement;
      
      if (firstRadioInput) {
        firstRadioInput.focus();
        firstRadioInput.classList.add(':focus-visible');
      }
    });
  }

  protected onValidateAnswer($event: Event) {
    const button = $event.target as HTMLButtonElement;
    const fieldset = button.closest('fieldset');
    const selectedRadio = fieldset?.querySelector(
      'input:checked',
    ) as HTMLInputElement | null;

    if (!selectedRadio) {
      return;
    }

    this.validateAnswer(selectedRadio);
  }

  private validateAnswer(input: HTMLInputElement) {
    const questionIndex = parseInt(
      input.getAttribute('data-question-index') ?? '-1',
    );
    const selectedAnswerIndex = parseInt(
      input.getAttribute('data-answer-index') ?? '-1',
    );

    if (questionIndex === -1 || selectedAnswerIndex === -1) {
      return;
    }

    const correctionId = input.getAttribute('aria-describedby');
    const correction = correctionId
      ? document.getElementById(correctionId)
      : null;
    const isCorrect =
      selectedAnswerIndex ===
      this.episode?.questions[questionIndex].correctAnswer;

    input.classList.add('active');
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
