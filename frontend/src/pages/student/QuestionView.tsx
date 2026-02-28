import React, { useState } from 'react';
import { IPoll, PollResults } from '../../types';
import { usePollTimer } from '../../hooks/usePollTimer';

interface QuestionViewProps {
    poll: IPoll;
    results: PollResults;
    serverRemaining: number;
    studentId: string;
    onVote: (optionIndex: number) => void;
    onExpired: () => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({
    poll,
    serverRemaining,
    studentId: _studentId,
    onVote,
    onExpired,
}) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { formatted, isExpired } = usePollTimer(poll.startedAt, poll.timeLimit, serverRemaining);

    React.useEffect(() => {
        if (isExpired) onExpired();
    }, [isExpired, onExpired]);

    const handleSubmit = () => {
        if (selected === null || submitted) return;
        setSubmitted(true);
        onVote(selected);
    };

    return (
        <div className="question-page">
            <div className="question-header">
                <span className="question-label">Question {poll.questionNumber}</span>
                <span className={`timer ${isExpired ? 'timer--expired' : ''}`}>
                    🕐 {formatted}
                </span>
            </div>

            <div className="question-card">
                <div className="question-text">{poll.question}</div>

                <div className="options-list">
                    {poll.options.map((opt, idx) => (
                        <div
                            key={idx}
                            id={`option-${idx}`}
                            className={`option-row ${selected === idx ? 'option-row--selected' : ''} ${submitted || isExpired ? 'option-row--disabled' : ''}`}
                            onClick={() => !submitted && !isExpired && setSelected(idx)}
                        >
                            <span className="option-number">{idx + 1}</span>
                            <span className="option-text">{opt.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="question-footer">
                <button
                    id="btn-submit-vote"
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={selected === null || submitted || isExpired}
                >
                    {submitted ? 'Submitted!' : 'Submit'}
                </button>
            </div>

            <div className="chat-bubble" title="Chat">💬</div>
        </div>
    );
};

export default QuestionView;
