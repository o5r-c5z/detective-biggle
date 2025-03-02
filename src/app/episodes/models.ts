export interface Episode {
  title: string;
  titleBackground: string;
  investigation: Video;
  pedagogicalConcept: Video;
  clues: Video[];
  resolution: Video;
  questions: QuizQuestion[];
}

export interface Video {
  url: string;
  title: string;
}

export interface QuizQuestion {
  label: string;
  answers: string[];
  correctAnswer: number;
}

export enum VideoType {
  Investigation = 'investigation',
  PedagogicalConcept = 'pedagogicalConcept',
  Clue = 'clue',
  Resolution = 'resolution',
}
