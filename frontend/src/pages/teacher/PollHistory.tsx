import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PollResults } from '../../types';

interface PollHistoryProps {
    onBack: () => void;
}

const PollHistory: React.FC<PollHistoryProps> = ({ onBack }) => {
    const [history, setHistory] = useState<PollResults[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/polls/history');
                setHistory(res.data.data || []);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="history-page">
            <div className="history-header">
                <button id="btn-back-from-history" className="btn-back" onClick={onBack}>
                    ← Back
                </button>
                <h1 className="page-title">Poll History</h1>
            </div>

            {loading ? (
                <div className="page-center">
                    <div className="spinner" />
                </div>
            ) : history.length === 0 ? (
                <div className="page-center">
                    <p className="waiting-text">No polls conducted yet.</p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((poll, i) => (
                        <div key={poll.pollId} className="history-card">
                            <div className="history-card-header">
                                <span className="history-q-num">Question {i + 1}</span>
                                <span className="history-votes">{poll.totalVotes} votes</span>
                            </div>
                            <div className="question-text history-question">{poll.question}</div>
                            <div className="results-list results-list--compact">
                                {poll.options.map((opt, idx) => (
                                    <div key={idx} className={`result-row ${opt.isCorrect ? 'result-row--correct' : ''}`}>
                                        <div className="result-bar-container">
                                            <div className="result-bar-header">
                                                <span className="option-number">{idx + 1}</span>
                                                <span className="result-option-text">{opt.text}</span>
                                                {opt.isCorrect && <span className="correct-badge">✓ Correct</span>}
                                            </div>
                                            <div className="progress-track">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${opt.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="result-percent">{opt.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PollHistory;
