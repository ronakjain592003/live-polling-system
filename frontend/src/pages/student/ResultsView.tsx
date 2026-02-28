import React from 'react';
import { PollResults, IPoll } from '../../types';
import { usePollTimer } from '../../hooks/usePollTimer';

interface ResultsViewProps {
    poll: IPoll;
    results: PollResults;
    serverRemaining: number;
    votedOptionIndex: number | null;
}

const ResultsView: React.FC<ResultsViewProps> = ({
    poll,
    results,
    serverRemaining,
    votedOptionIndex,
}) => {
     const hasVoted = votedOptionIndex !== null;

        const { formatted } = usePollTimer(
        poll.startedAt,
        poll.timeLimit,
        serverRemaining,
        hasVoted // 🔒 THIS
    );

    return (
        <div className="results-page">
            <div className="question-header">
                <span className="question-label">Question {results.questionNumber}</span>
                <span className="timer">🕐 {formatted}</span>
            </div>

            <div className="question-card">
                <div className="question-text">{results.question}</div>

                <div className="results-list">
                    {results.options.map((opt, idx) => (
                        <div
                            key={idx}
                            className={`result-row ${votedOptionIndex === idx ? 'result-row--voted' : ''}`}
                        >
                            <div className="result-bar-container">
                                <div className="result-bar-header">
                                    <span className="option-number">{idx + 1}</span>
                                    <span className="result-option-text">{opt.text}</span>
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

            <p className="waiting-text" style={{ marginTop: '24px' }}>
                Wait for the teacher to ask a new question..
            </p>

            <div className="chat-bubble" title="Chat">💬</div>
        </div>
    );
};

export default ResultsView;
