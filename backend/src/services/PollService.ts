import { Poll, IOption } from '../models/Poll';
import { Vote } from '../models/Vote';
import mongoose from 'mongoose';

export interface OptionResult {
    text: string;
    isCorrect: boolean;
    votes: number;
    percentage: number;
}

export interface PollResultsData {
    pollId: string;
    question: string;
    options: OptionResult[];
    totalVotes: number;
    totalStudents: number;
    status: string;
    questionNumber: number;
}

export interface ActivePollState {
    poll: {
        _id: string;
        question: string;
        options: IOption[];
        timeLimit: number;
        startedAt: Date;
        questionNumber: number;
        status: string;
    };
    results: PollResultsData;
    remainingSeconds: number;
}

class PollService {
    async createPoll(
        question: string,
        options: IOption[],
        timeLimit: number
    ): Promise<InstanceType<typeof Poll>> {
        // End all currently active polls
        await Poll.updateMany({ status: 'active' }, { $set: { status: 'ended' } });

        // Get total poll count for numbering
        const count = await Poll.countDocuments();

        const poll = new Poll({
            question,
            options,
            timeLimit,
            status: 'active',
            startedAt: new Date(),
            questionNumber: count + 1,
        });

        await poll.save();
        return poll;
    }

    async getActivePoll(): Promise<ActivePollState | null> {
        const poll = await Poll.findOne({ status: 'active' });
        if (!poll) return null;

        const elapsed = poll.startedAt
            ? Math.floor((Date.now() - new Date(poll.startedAt).getTime()) / 1000)
            : 0;

        const remainingSeconds = Math.max(0, poll.timeLimit - elapsed);

        // Auto-expire if time has passed
        if (remainingSeconds <= 0) {
            poll.status = 'ended';
            await poll.save();
            return null;
        }

        const results = await this.getResults(poll._id.toString());

        return {
            poll: {
                _id: poll._id.toString(),
                question: poll.question,
                options: poll.options,
                timeLimit: poll.timeLimit,
                startedAt: poll.startedAt!,
                questionNumber: poll.questionNumber,
                status: poll.status,
            },
            results,
            remainingSeconds,
        };
    }

    async getResults(pollId: string): Promise<PollResultsData> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');

        const votes = await Vote.find({ pollId: new mongoose.Types.ObjectId(pollId) });
        const totalVotes = votes.length;

        const optionResults: OptionResult[] = poll.options.map((opt, idx) => {
            const count = votes.filter((v) => v.optionIndex === idx).length;
            return {
                text: opt.text,
                isCorrect: opt.isCorrect,
                votes: count,
                percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
            };
        });

        return {
            pollId: poll._id.toString(),
            question: poll.question,
            options: optionResults,
            totalVotes,
            totalStudents: totalVotes,
            status: poll.status,
            questionNumber: poll.questionNumber,
        };
    }

    async submitVote(
        pollId: string,
        studentId: string,
        optionIndex: number
    ): Promise<PollResultsData> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.status !== 'active') throw new Error('Poll is not active');
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            throw new Error('Invalid option index');
        }

        // Check if time has expired
        const elapsed = poll.startedAt
            ? Math.floor((Date.now() - new Date(poll.startedAt).getTime()) / 1000)
            : 0;
        if (elapsed >= poll.timeLimit) {
            throw new Error('Poll time has expired');
        }

        // Save vote — throws MongoServerError(E11000) if duplicate
        const vote = new Vote({
            pollId: new mongoose.Types.ObjectId(pollId),
            studentId,
            optionIndex,
        });
        await vote.save();

        return this.getResults(pollId);
    }

    async endPoll(pollId: string): Promise<void> {
        await Poll.findByIdAndUpdate(pollId, { $set: { status: 'ended' } });
    }

    async hasStudentVoted(pollId: string, studentId: string): Promise<boolean> {
        const vote = await Vote.findOne({
            pollId: new mongoose.Types.ObjectId(pollId),
            studentId,
        });
        return !!vote;
    }

    async getStudentVote(
        pollId: string,
        studentId: string
    ): Promise<number | null> {
        const vote = await Vote.findOne({
            pollId: new mongoose.Types.ObjectId(pollId),
            studentId,
        });
        return vote ? vote.optionIndex : null;
    }

    async getPollHistory(): Promise<PollResultsData[]> {
        const polls = await Poll.find({ status: 'ended' }).sort({ createdAt: -1 });
        const results = await Promise.all(
            polls.map((p) => this.getResults(p._id.toString()))
        );
        return results;
    }
}

export const pollService = new PollService();
