import React from 'react';
import { PollResults, IPoll } from '../../types';
import { usePollTimer } from '../../hooks/usePollTimer';

interface LiveResultsProps {
    poll: IPoll;
    results: PollResults;
    serverRemaining: number;
    onAskNew: () => void;
    onViewHistory: () => void;
}

const LiveResults: React.FC<LiveResultsProps> = ({
    poll,
    results,
    serverRemaining,
    onAskNew,
    onViewHistory,
}) => {
    const { formatted, isExpired } = usePollTimer(
        poll.startedAt,
        poll.timeLimit,
        serverRemaining
    );

    return (
        <div className="teacher-results-page">
            <div className="teacher-results-topbar">
                <button id="btn-view-history" className="btn-history" onClick={onViewHistory}>
                    👁 View Poll history
                </button>
            </div>

            <div className="teacher-results-body">
                {!isExpired && (
                    <div className="live-timer-row">
                        <span className="question-label">Question {results.questionNumber}</span>
                        <span className="timer">🕐 {formatted}</span>
                    </div>
                )}

                <h2 className="results-section-label">Question</h2>

                <div className="question-card">
                    <div className="question-text">{results.question}</div>

                    <div className="results-list">
                        {results.options.map((opt, idx) => (
                            <div key={idx} className="result-row">
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

                <div className="teacher-results-footer">
                    <p className="vote-count">
                        {results.totalVotes} student{results.totalVotes !== 1 ? 's' : ''} answered
                    </p>
                    {isExpired && (
                        <button
                            id="btn-ask-new"
                            className="btn-primary btn-ask-new"
                            onClick={onAskNew}
                        >
                            + Ask a new question
                        </button>
                    )}
                </div>
            </div>

            <div className="chat-bubble" title="Chat">💬</div>
        </div>
    );
};

export default LiveResults;
