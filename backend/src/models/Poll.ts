import mongoose, { Document, Schema } from 'mongoose';

export interface IOption {
    text: string;
    isCorrect: boolean;
}

export interface IPoll extends Document {
    question: string;
    options: IOption[];
    timeLimit: number;
    status: 'waiting' | 'active' | 'ended';
    startedAt?: Date;
    questionNumber: number;
    createdAt: Date;
    updatedAt: Date;
}

const OptionSchema = new Schema<IOption>({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
});

const PollSchema = new Schema<IPoll>(
    {
        question: { type: String, required: true },
        options: { type: [OptionSchema], required: true },
        timeLimit: { type: Number, default: 60 },
        status: {
            type: String,
            enum: ['waiting', 'active', 'ended'],
            default: 'active',
        },
        startedAt: { type: Date },
        questionNumber: { type: Number, default: 1 },
    },
    { timestamps: true }
);

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
