
export interface InterviewQuestion {
  question: string;
  topic: string;
  difficulty: string;
}

export interface SampleProblem {
  problem: string;
  description: string;
  solution: {
    python: string;
    java: string;
  };
}

export interface RoleInsights {
  title: string;
  skillsRequired: string[];
  hiringPattern: string;
  numberOfRounds: string;
}

export interface SampleAnswer {
  question: string;
  answer: string;
}

export interface StudyDay {
  days: string;
  topic: string;
  details: string;
}

export interface SalaryRange {
  title: string;
  entryLevel: string;
  midLevel: string;
  freshers: string;
  note: string;
}

export interface InterviewPrepData {
  companyName: string;
  interviewQuestions: {
    title: string;
    questions: InterviewQuestion[];
  };
  codingRound: {
    title: string;
    difficultyAnalysis: string;
    sampleProblems: SampleProblem[];
  };
  roleInsights: RoleInsights;
  sampleAnswers: {
    title: string;
    answers: SampleAnswer[];
  };
  studyPlan: {
    title: string;
    plan: StudyDay[];
  };
  salaryRange: SalaryRange;
}
