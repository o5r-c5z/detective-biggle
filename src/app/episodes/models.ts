export interface Episode {
    title: string;
    titleBackground: string;
    investigation: Video;
    pedagogicalConcept: Video;
    clues: Video[];
    quiz: QuizQuestion[];
}

export interface Video {
    url: string;
    title: string;
}

export interface QuizQuestion {
    question: string;
    answers: string[];
    correctAnswer: number;
}
