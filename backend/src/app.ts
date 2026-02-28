import express from 'express';
import cors from 'cors';
import pollRoutes from './routes/pollRoutes';

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/polls', pollRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default app;
