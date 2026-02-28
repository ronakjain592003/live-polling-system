import { Router } from 'express';
import {
    getActivePoll,
    getPollHistory,
    createPoll,
    checkStudentVote,
} from '../controllers/PollController';

const router = Router();

router.get('/active', getActivePoll);
router.get('/history', getPollHistory);
router.post('/', createPoll);
router.get('/vote/:pollId/:studentId', checkStudentVote);

export default router;
