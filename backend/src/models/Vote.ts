import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentId: string;
    optionIndex: number;
    submittedAt: Date;
}

const VoteSchema = new Schema<IVote>({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    studentId: { type: String, required: true },
    optionIndex: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
});

// Unique index prevents double voting at the database level
VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);
