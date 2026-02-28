import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Role, IPoll, PollResults, IOption } from './types';

import RoleSelection from './pages/RoleSelection';
import NameEntry from './pages/student/NameEntry';
import WaitingScreen from './pages/student/WaitingScreen';
import QuestionView from './pages/student/QuestionView';
import ResultsView from './pages/student/ResultsView';
import CreatePoll from './pages/teacher/CreatePoll';
import LiveResults from './pages/teacher/LiveResults';
import PollHistory from './pages/teacher/PollHistory';

type AppView =
    | 'role'
    | 'student-name'
    | 'student-waiting'
    | 'student-question'
    | 'student-results'
    | 'teacher-create'
    | 'teacher-live'
    | 'teacher-history';

// Generate a stable unique ID per browser tab
const getStudentId = (): string => {
    let id = sessionStorage.getItem('studentId');
    if (!id) {
        id = `student_${Math.random().toString(36).slice(2)}_${Date.now()}`;
        sessionStorage.setItem('studentId', id);
    }
    return id;
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const App: React.FC = () => {
    const [role, setRole] = useState<Role>(() => {
        return (sessionStorage.getItem('role') as Role) || null;
    });
    const [studentName, setStudentName] = useState<string>(() => {
        return sessionStorage.getItem('studentName') || '';
    });
    const [view, setView] = useState<AppView>(() => {
        const savedRole = sessionStorage.getItem('role') as Role;
        if (!savedRole) return 'role';
        if (savedRole === 'teacher') return 'teacher-create';
        const savedName = sessionStorage.getItem('studentName');
        if (!savedName) return 'student-name';
        return 'student-waiting';
    });

    const [activePoll, setActivePoll] = useState<IPoll | null>(null);
    const [pollResults, setPollResults] = useState<PollResults | null>(null);
    const [serverRemaining, setServerRemaining] = useState<number>(0);
    const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const studentId = getStudentId();

    // ── Connect socket once ───────────────────────────────────────────────────
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
        });
        socketRef.current = socket;

        // State recovery: ask server for current poll state
        socket.on('connect', () => {
            socket.emit('poll:getState', { studentId });
        });

        // Receive current state on (re)connect
        socket.on('poll:state', (state: {
            poll: IPoll;
            results: PollResults;
            remainingSeconds: number;
            hasVoted: boolean;
            votedOptionIndex: number | null;
        } | null) => {
            if (!state) return;

            const savedRole = sessionStorage.getItem('role') as Role;
            setActivePoll(state.poll);
            setPollResults(state.results);
            setServerRemaining(state.remainingSeconds);

            if (savedRole === 'teacher') {
                setView('teacher-live');
            } else if (savedRole === 'student') {
                const savedName = sessionStorage.getItem('studentName');
                if (savedName) {
                    if (state.hasVoted) {
                        setVotedOptionIndex(state.votedOptionIndex ?? null);
                        setView('student-results');
                    } else {
                        setView('student-question');
                    }
                }
            }
        });

        // New poll started by teacher
        socket.on('poll:started', (data: {
            poll: IPoll;
            results: PollResults;
            serverRemaining: number;
        }) => {
            setActivePoll(data.poll);
            setPollResults(data.results);
            setServerRemaining(data.serverRemaining);
            setVotedOptionIndex(null);

            // ADD THESE LINES
            const savedRole = sessionStorage.getItem('role') as Role;
            if (savedRole === 'teacher') {
                setView('teacher-live');
            } else if (savedRole === 'student') {
                const savedName = sessionStorage.getItem('studentName');
                if (savedName) {
                    setView('student-question');
                }
            }
        });

        // Real-time vote updates
        socket.on('poll:resultsUpdated', (data) => {
            setPollResults(data);
            if (view === 'student-results') {
                setServerRemaining(0); // authoritative
            }
        });

        // Poll ended — show results to all
        socket.on('poll:ended', (data: { results: PollResults }) => {
            setPollResults(data.results);
            const savedRole = sessionStorage.getItem('role') as Role;
            if (savedRole === 'student') {
                setView('student-results');
            }
        });

        // Student's vote accepted
        socket.on('vote:accepted', (data) => {
            setVotedOptionIndex(data.optionIndex);
            setPollResults(data.results);
            setServerRemaining(0); // 🔥 CRITICAL LINE
            setView('student-results');
        });

        // Vote rejected (already voted or expired)
        socket.on('vote:rejected', (data: { message: string }) => {
            alert(data.message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // ── State recovery via REST on mount (handles hard refresh) ───────────────
    useEffect(() => {
        const savedRole = sessionStorage.getItem('role') as Role;
        const savedName = sessionStorage.getItem('studentName');
        if (!savedRole) return;

        const checkActive = async () => {
            try {
                const res = await axios.get('/api/polls/active');
                const state = res.data.data;
                if (!state) return;

                setActivePoll(state.poll);
                setPollResults(state.results);
                setServerRemaining(state.remainingSeconds);

                if (savedRole === 'teacher') {
                    setView('teacher-live');
                } else if (savedRole === 'student' && savedName) {
                    // Check if this student already voted
                    try {
                        const voteRes = await axios.get(`/api/polls/vote/${state.poll._id}/${studentId}`);
                        const { voted, optionIndex } = voteRes.data.data;
                        if (voted) {
                            setVotedOptionIndex(optionIndex);
                            setView('student-results');
                        } else {
                            setView('student-question');
                        }
                    } catch {
                        setView('student-question');
                    }
                }
            } catch {
                // No active poll — stay on current view
            }
        };

        checkActive();
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleRoleSelect = (selectedRole: Role) => {
        setRole(selectedRole);
        sessionStorage.setItem('role', selectedRole!);
        if (selectedRole === 'teacher') {
            setView('teacher-create');
        } else {
            setView('student-name');
        }
    };

    const handleNameSubmit = (name: string) => {
        setStudentName(name);
        sessionStorage.setItem('studentName', name);
        setView('student-waiting');
    };

    const handleCreatePoll = useCallback(
        (question: string, options: IOption[], timeLimit: number) => {
            socketRef.current?.emit('teacher:createPoll', { question, options, timeLimit });
        },
        []
    );

    const handleVote = useCallback(
        (optionIndex: number) => {
            if (!activePoll) return;
            socketRef.current?.emit('student:submitVote', {
                pollId: activePoll._id,
                studentId,
                optionIndex,
            });
        },
        [activePoll, studentId]
    );

    const handleTimerExpired = useCallback(() => {
        setView('student-results');
    }, []);

    const handleAskNew = () => {
        setActivePoll(null);
        setPollResults(null);
        setVotedOptionIndex(null);
        setView('teacher-create');
    };

    const handleViewHistory = () => setView('teacher-history');
    const handleBackFromHistory = () => {
        if (activePoll && pollResults) {
            setView('teacher-live');
        } else {
            setView('teacher-create');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (view === 'role') return <RoleSelection onSelect={handleRoleSelect} />;

    if (view === 'student-name') return <NameEntry onSubmit={handleNameSubmit} />;

    if (view === 'student-waiting') return <WaitingScreen />;

    if (view === 'student-question' && activePoll && pollResults) {
        return (
            <QuestionView
                poll={activePoll}
                results={pollResults}
                serverRemaining={serverRemaining}
                studentId={studentId}
                onVote={handleVote}
                onExpired={handleTimerExpired}
            />
        );
    }

    if (view === 'student-results' && activePoll && pollResults) {
        return (
            <ResultsView
                poll={activePoll}
                results={pollResults}
                serverRemaining={serverRemaining}
                votedOptionIndex={votedOptionIndex}
            />
        );
    }

    if (view === 'teacher-create') {
        return <CreatePoll onCreatePoll={handleCreatePoll} />;
    }

    if (view === 'teacher-live' && activePoll && pollResults) {
        return (
            <LiveResults
                poll={activePoll}
                results={pollResults}
                serverRemaining={serverRemaining}
                onAskNew={handleAskNew}
                onViewHistory={handleViewHistory}
            />
        );
    }

    if (view === 'teacher-history') {
        return <PollHistory onBack={handleBackFromHistory} />;
    }

    // Fallback: show waiting
    if (role === 'student') return <WaitingScreen />;
    return <CreatePoll onCreatePoll={handleCreatePoll} />;
};

export default App;
