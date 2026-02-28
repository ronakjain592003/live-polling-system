import React, { useState } from 'react';
import Badge from '../../components/Badge';
import { IOption } from '../../types';

interface CreatePollProps {
    onCreatePoll: (question: string, options: IOption[], timeLimit: number) => void;
}

const TIME_OPTIONS = [30, 60, 90, 120];

const CreatePoll: React.FC<CreatePollProps> = ({ onCreatePoll }) => {
    const [question, setQuestion] = useState('');
    const [timeLimit, setTimeLimit] = useState(60);
    const [options, setOptions] = useState<IOption[]>([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
    ]);

    const updateOption = (idx: number, text: string) => {
        setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text } : o)));
    };

    const setCorrect = (idx: number, isCorrect: boolean) => {
        setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, isCorrect } : o)));
    };

    const addOption = () => {
        setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
    };

    const removeOption = (idx: number) => {
        if (options.length <= 2) return;
        setOptions((prev) => prev.filter((_, i) => i !== idx));
    };

    const canSubmit =
        question.trim().length > 0 &&
        options.filter((o) => o.text.trim()).length >= 2;

    const handleSubmit = () => {
        if (!canSubmit) return;
        const validOptions = options.filter((o) => o.text.trim());
        onCreatePoll(question.trim(), validOptions, timeLimit);
    };

    return (
        <div className="teacher-create-page">
            <div className="teacher-header">
                <Badge />
                <h1 className="teacher-title">
                    Let's <strong>Get Started</strong>
                </h1>
                <p className="teacher-subtitle">
                    you'll have the ability to create and manage polls, ask questions, and monitor your
                    students' responses in real-time.
                </p>
            </div>

            <div className="create-poll-body">
                <div className="question-input-row">
                    <label className="input-label">Enter your question</label>
                    <select
                        id="select-timer"
                        className="timer-select"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                    >
                        {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                                {t} seconds
                            </option>
                        ))}
                    </select>
                </div>

                <textarea
                    id="input-question"
                    className="question-textarea"
                    placeholder="Type your question here..."
                    value={question}
                    maxLength={100}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <div className="char-count">{question.length}/100</div>

                <div className="options-section">
                    <div className="options-columns">
                        <span className="options-col-label">Edit Options</span>
                        <span className="options-col-label correct-label">Is it Correct?</span>
                    </div>

                    {options.map((opt, idx) => (
                        <div key={idx} className="option-edit-row">
                            <span className="option-number option-number--dark">{idx + 1}</span>
                            <input
                                id={`option-input-${idx}`}
                                type="text"
                                className="option-input"
                                placeholder={`Option ${idx + 1}`}
                                value={opt.text}
                                onChange={(e) => updateOption(idx, e.target.value)}
                            />
                            <div className="correct-radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name={`correct-${idx}`}
                                        checked={opt.isCorrect}
                                        onChange={() => setCorrect(idx, true)}
                                    />
                                    Yes
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name={`correct-${idx}`}
                                        checked={!opt.isCorrect}
                                        onChange={() => setCorrect(idx, false)}
                                    />
                                    No
                                </label>
                                {options.length > 2 && (
                                    <button
                                        className="remove-option-btn"
                                        onClick={() => removeOption(idx)}
                                        title="Remove option"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button id="btn-add-option" className="btn-add-option" onClick={addOption}>
                        + Add More option
                    </button>
                </div>
            </div>

            <div className="teacher-footer">
                <button
                    id="btn-ask-question"
                    className="btn-primary btn-ask"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                >
                    Ask Question
                </button>
            </div>
        </div>
    );
};

export default CreatePoll;
