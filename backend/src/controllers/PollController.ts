import { Request, Response } from 'express';
import { pollService } from '../services/PollService';

export const getActivePoll = async (req: Request, res: Response): Promise<void> => {
    try {
        const state = await pollService.getActivePoll();
        res.json({ success: true, data: state });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get active poll' });
    }
};

export const getPollHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const history = await pollService.getPollHistory();
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get poll history' });
    }
};

export const createPoll = async (req: Request, res: Response): Promise<void> => {
    try {
        const { question, options, timeLimit } = req.body;
        if (!question || !options || !Array.isArray(options) || options.length < 2) {
            res.status(400).json({ success: false, message: 'Invalid poll data' });
            return;
        }
        const poll = await pollService.createPoll(question, options, timeLimit || 60);
        res.status(201).json({ success: true, data: poll });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create poll' });
    }
};

export const checkStudentVote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pollId, studentId } = req.params;
        const optionIndex = await pollService.getStudentVote(pollId, studentId);
        res.json({ success: true, data: { voted: optionIndex !== null, optionIndex } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to check vote' });
    }
};
