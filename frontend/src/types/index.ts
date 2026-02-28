export interface IOption {
    text: string;
    isCorrect: boolean;
}

export interface IPoll {
    _id: string;
    question: string;
    options: IOption[];
    timeLimit: number;
    startedAt: string;
    questionNumber: number;
    status: 'waiting' | 'active' | 'ended';
}

export interface OptionResult {
    text: string;
    isCorrect: boolean;
    votes: number;
    percentage: number;
}

export interface PollResults {
    pollId: string;
    question: string;
    options: OptionResult[];
    totalVotes: number;
    totalStudents: number;
    status: string;
    questionNumber: number;
}

export interface ActivePollState {
    poll: IPoll;
    results: PollResults;
    remainingSeconds: number;
    hasVoted?: boolean;
    votedOptionIndex?: number | null;
}

export type Role = 'student' | 'teacher' | null;
