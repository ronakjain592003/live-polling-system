import { Server, Socket } from 'socket.io';
import { pollService } from '../services/PollService';
import { IOption } from '../models/Poll';

// Store timeout references so they can be cleared if a new poll is created
const pollTimers = new Map<string, ReturnType<typeof setTimeout>>();

const getRemainingSeconds = (startedAt: Date, timeLimit: number): number => {
    const endTime = new Date(startedAt).getTime() + timeLimit * 1000;
    const remainingMs = endTime - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
};

export const setupSocketHandlers = (io: Server): void => {
    io.on('connection', async (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // ── State recovery: client requests current state on (re)connect ───────
        socket.on('poll:getState', async (data: { studentId?: string }) => {
            const state = await pollService.getActivePoll();
            if (!state) {
                socket.emit('poll:state', null);
                return;
            }

            let hasVoted = false;
            let votedOptionIndex: number | null = null;

            if (data?.studentId) {
                votedOptionIndex = await pollService.getStudentVote(
                    state.poll._id.toString(),
                    data.studentId
                );
                hasVoted = votedOptionIndex !== null;
            }

            //socket.emit('poll:state', { ...state, hasVoted, votedOptionIndex });
            const serverRemaining = getRemainingSeconds(
                            state.poll.startedAt,
                            state.poll.timeLimit
                        );

                        socket.emit('poll:state', {
                            ...state,
                            serverRemaining,
                            hasVoted,
                            votedOptionIndex,
                        });
        });

        // ── Teacher creates a poll ─────────────────────────────────────────────
        socket.on(
            'teacher:createPoll',
            async (data: {
                question: string;
                options: IOption[];
                timeLimit: number;
            }) => {
                try {
                    const poll = await pollService.createPoll(
                        data.question,
                        data.options,
                        data.timeLimit
                    );

                    const results = await pollService.getResults(poll._id.toString());

                    const pollPayload = {
                        _id: poll._id.toString(),
                        question: poll.question,
                        options: poll.options,
                        timeLimit: poll.timeLimit,
                        startedAt: poll.startedAt,
                        questionNumber: poll.questionNumber,
                        status: poll.status,
                    };

                    // Broadcast to everyone (teacher + all students)
                    //io.emit('poll:started', { poll: pollPayload, results });

                    const serverRemaining = getRemainingSeconds(
                            poll.startedAt!,
                            poll.timeLimit
                        );
                    
                        io.emit('poll:started', {
                            poll: pollPayload,
                            results,
                            serverRemaining,
                        });

                    // Schedule auto-end
                    const existingTimer = pollTimers.get(poll._id.toString());
                    if (existingTimer) clearTimeout(existingTimer);

                    const timer = setTimeout(async () => {
                        const active = await pollService.getActivePoll();
                        if (active && active.poll._id.toString() === poll._id.toString()) {
                            await pollService.endPoll(poll._id.toString());
                            const finalResults = await pollService.getResults(poll._id.toString());
                            io.emit('poll:ended', { results: finalResults });
                        }
                        pollTimers.delete(poll._id.toString());
                    }, data.timeLimit * 1000);

                    pollTimers.set(poll._id.toString(), timer);
                } catch (error) {
                    socket.emit('error', { message: 'Failed to create poll' });
                }
            }
        );

        // ── Student submits a vote ─────────────────────────────────────────────
        socket.on(
            'student:submitVote',
            async (data: {
                pollId: string;
                studentId: string;
                optionIndex: number;
            }) => {
                try {
                    const results = await pollService.submitVote(
                        data.pollId,
                        data.studentId,
                        data.optionIndex
                    );

                    // Confirm to this student
                    socket.emit('vote:accepted', {
                        optionIndex: data.optionIndex,
                        results,
                    });

                    // Broadcast updated results to ALL clients
                    io.emit('poll:resultsUpdated', {
                            ...results,
                            
                        });

                } catch (error: any) {
                    const isDuplicate =
                        error.code === 11000 ||
                        (error.message && error.message.includes('duplicate'));

                    if (isDuplicate) {
                        socket.emit('vote:rejected', { message: 'You have already voted' });
                    } else {
                        socket.emit('vote:rejected', {
                            message: error.message || 'Failed to submit vote',
                        });
                    }
                }
            }
        );

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
