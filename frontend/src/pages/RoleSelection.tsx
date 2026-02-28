import React, { useState } from 'react';
import Badge from '../components/Badge';
import { Role } from '../types';

interface RoleSelectionProps {
    onSelect: (role: Role) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
    const [selected, setSelected] = useState<Role>(null);

    return (
        <div className="page-center">
            <Badge />
            <h1 className="page-title">
                Welcome to the <strong>Live Polling System</strong>
            </h1>
            <p className="page-subtitle">
                Please select the role that best describes you to begin using the live polling system
            </p>

            <div className="role-cards">
                <div
                    id="role-student"
                    className={`role-card ${selected === 'student' ? 'role-card--selected' : ''}`}
                    onClick={() => setSelected('student')}
                >
                    <h2>I'm a Student</h2>
                    <p>Submit answers and view live poll results in real-time.</p>
                </div>

                <div
                    id="role-teacher"
                    className={`role-card ${selected === 'teacher' ? 'role-card--selected' : ''}`}
                    onClick={() => setSelected('teacher')}
                >
                    <h2>I'm a Teacher</h2>
                    <p>Submit answers and view live poll results in real-time.</p>
                </div>
            </div>

            <button
                id="btn-continue-role"
                className="btn-primary"
                disabled={!selected}
                onClick={() => selected && onSelect(selected)}
            >
                Continue
            </button>
        </div>
    );
};

export default RoleSelection;
