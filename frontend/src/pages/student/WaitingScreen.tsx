import React from 'react';
import Badge from '../../components/Badge';

const WaitingScreen: React.FC = () => {
    return (
        <div className="page-center">
            <Badge />
            <div className="spinner" aria-label="Loading" />
            <p className="waiting-text">Wait for the teacher to ask questions..</p>
            <div className="chat-bubble" title="Chat">💬</div>
        </div>
    );
};

export default WaitingScreen;
