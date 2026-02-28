import React, { useState } from 'react';
import Badge from '../../components/Badge';

interface NameEntryProps {
    onSubmit: (name: string) => void;
}

const NameEntry: React.FC<NameEntryProps> = ({ onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (trimmed) onSubmit(trimmed);
    };

    return (
        <div className="page-center">
            <Badge />
            <h1 className="page-title">
                Let's <strong>Get Started</strong>
            </h1>
            <p className="page-subtitle">
                If you're a student, you'll be able to <strong>submit your answers</strong>, participate in
                live polls, and see how your responses compare with your classmates
            </p>

            <div className="name-form">
                <label className="input-label">Enter your Name</label>
                <input
                    id="input-student-name"
                    type="text"
                    className="text-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                />
                <button
                    id="btn-continue-name"
                    className="btn-primary"
                    disabled={!name.trim()}
                    onClick={handleSubmit}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default NameEntry;
