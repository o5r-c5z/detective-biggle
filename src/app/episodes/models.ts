export interface Episode {
  title: string;
  titleBackground: string;
  investigation: Video;
  pedagogicalConcept: Video;
  clues: Video[];
  quiz: QuizStep[];
}

export interface Video {
  url: string;
  title: string;
}

export interface QuizStep {
  question: string;
  answers: string[];
  correctAnswer: number;
}
