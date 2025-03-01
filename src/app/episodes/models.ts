export interface Episode {
  title: string;
  titleBackground: string;
  investigation: Video;
  pedagogicalConcept: Video;
  clues: Video[];
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
