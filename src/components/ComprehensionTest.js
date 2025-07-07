import React, { useState, useEffect } from 'react';
import './ComprehensionTest.css';

function ComprehensionTest({ testData, onComplete, onExit }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(testData.timeLimit * 60);
    const [testStarted, setTestStarted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showPassage, setShowPassage] = useState(true);
    const [currentPassageId, setCurrentPassageId] = useState(null);

    // Initialize with first passage
    useEffect(() => {
        if (testData.questions && testData.questions.length > 0) {
            setCurrentPassageId(testData.questions[0].passageId);
        }
    }, [testData]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (testStarted && timeRemaining > 0 && !testCompleted) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [testStarted, timeRemaining, testCompleted]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCurrentQuestion = () => {
        return testData.questions[currentQuestion];
    };

    const getCurrentPassage = () => {
        const question = getCurrentQuestion();
        return testData.passages?.find(p => p.id === question?.passageId);
    };

    const getQuestionsForPassage = (passageId) => {
        return testData.questions.filter(q => q.passageId === passageId);
    };

    const handleStartTest = () => {
        setTestStarted(true);
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestion < testData.questions.length - 1) {
            const nextQuestion = testData.questions[currentQuestion + 1];
            const nextPassageId = nextQuestion.passageId;

            // If moving to a different passage, show the passage again
            if (nextPassageId !== currentPassageId) {
                setCurrentPassageId(nextPassageId);
                setShowPassage(true);
            }

            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            const prevQuestion = testData.questions[currentQuestion - 1];
            const prevPassageId = prevQuestion.passageId;

            // If moving to a different passage, show the passage again
            if (prevPassageId !== currentPassageId) {
                setCurrentPassageId(prevPassageId);
                setShowPassage(true);
            }

            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitTest = () => {
        setTestCompleted(true);
        setTestStarted(false);
        const results = calculateResults();
        setShowResults(true);
        if (onComplete) {
            onComplete(results);
        }
    };

    const calculateResults = () => {
        let correct = 0;
        let attempted = 0;
        const questionResults = [];

        testData.questions.forEach(question => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct;

            if (userAnswer !== undefined) {
                attempted++;
                if (isCorrect) correct++;
            }

            questionResults.push({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correct,
                isCorrect: isCorrect,
                explanation: question.explanation,
                topic: question.topic,
                difficulty: question.difficulty,
                options: question.options,
                passageId: question.passageId
            });
        });

        return {
            score: correct,
            total: testData.totalQuestions,
            attempted: attempted,
            percentage: Math.round((correct / testData.totalQuestions) * 100),
            timeUsed: testData.timeLimit * 60 - timeRemaining,
            timeRemaining: timeRemaining,
            questionResults: questionResults
        };
    };

    const resetTest = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setTimeRemaining(testData.timeLimit * 60);
        setTestStarted(false);
        setTestCompleted(false);
        setShowResults(false);
        setShowPassage(true);
        if (testData.questions && testData.questions.length > 0) {
            setCurrentPassageId(testData.questions[0].passageId);
        }
    };

    // Pre-test instructions
    if (!testStarted && !showResults) {
        const passage = getCurrentPassage();
        const questionsForPassage = getQuestionsForPassage(currentPassageId);

        return (
            <div className="comprehension-test-container">
                <div className="test-instructions">
                    <div className="instructions-header">
                        <h2>📚 {testData.title}</h2>
                        <p>{testData.description}</p>
                    </div>

                    <div className="instructions-content">
                        <h3>📋 Instructions</h3>
                        <ul>
                            <li>Read each passage carefully before answering the questions</li>
                            <li>You can refer back to the passage while answering questions</li>
                            <li>Choose the best answer for each multiple-choice question</li>
                            <li>You have <strong>{testData.timeLimit} minutes</strong> to complete the test</li>
                            <li>There are <strong>{testData.totalQuestions} questions</strong> in total</li>
                        </ul>

                        <div className="test-overview">
                            <h4>📖 Test Overview</h4>
                            <div className="passage-overview">
                                {testData.passages?.map(passage => {
                                    const questions = getQuestionsForPassage(passage.id);
                                    return (
                                        <div key={passage.id} className="passage-summary">
                                            <strong>{passage.title}</strong>
                                            <span>({questions.length} questions)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="instructions-actions">
                        <button className="start-test-btn" onClick={handleStartTest}>
                            🚀 Start Test
                        </button>
                        <button className="exit-btn" onClick={onExit}>
                            ← Back to Tests
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Results view
    if (showResults) {
        const results = calculateResults();

        return (
            <div className="comprehension-test-container">
                <div className="test-results">
                    <div className="results-header">
                        <h2>📊 Test Results</h2>
                        <div className="score-circle">
                            <span className="score-percentage">{results.percentage}%</span>
                            <span className="score-fraction">{results.score}/{results.total}</span>
                        </div>
                    </div>

                    <div className="results-summary">
                        <div className="result-stat">
                            <span className="stat-label">Questions Attempted</span>
                            <span className="stat-value">{results.attempted}/{results.total}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Time Used</span>
                            <span className="stat-value">{formatTime(results.timeUsed)}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Grade</span>
                            <span className="stat-value">
                                {results.percentage >= 80 ? 'A' :
                                    results.percentage >= 70 ? 'B' :
                                        results.percentage >= 60 ? 'C' :
                                            results.percentage >= 50 ? 'D' : 'F'}
                            </span>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button className="retry-btn" onClick={resetTest}>
                            🔄 Retake Test
                        </button>
                        <button className="exit-btn" onClick={onExit}>
                            ← Back to Tests
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main test interface
    const currentQ = getCurrentQuestion();
    const currentPassage = getCurrentPassage();

    return (
        <div className="comprehension-test-container">
            {/* Test Header */}
            <div className="test-header">
                <div className="test-info">
                    <h2>{testData.title}</h2>
                    <span className="question-counter">
                        Question {currentQuestion + 1} of {testData.totalQuestions}
                    </span>
                </div>
                <div className="test-timer">
                    <span className="timer">⏰ {formatTime(timeRemaining)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="test-progress">
                <div
                    className="progress-bar"
                    style={{ width: `${((currentQuestion + 1) / testData.totalQuestions) * 100}%` }}
                ></div>
            </div>

            {/* Main Content */}
            <div className="test-content">
                {/* Passage Panel */}
                <div className={`passage-panel ${showPassage ? 'visible' : 'collapsed'}`}>
                    <div className="passage-header">
                        <h3>📖 {currentPassage?.title}</h3>
                        <button
                            className="toggle-passage-btn"
                            onClick={() => setShowPassage(!showPassage)}
                        >
                            {showPassage ? '👁️ Hide' : '👁️ Show'} Passage
                        </button>
                    </div>

                    {showPassage && (
                        <div className="passage-content">
                            {currentPassage?.text.split('\\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Question Panel */}
                <div className="question-panel">
                    <div className="question-header">
                        <h4>Question {currentQuestion + 1}</h4>
                        <span className="question-topic">{currentQ?.topic} • {currentQ?.difficulty}</span>
                    </div>

                    <div className="question-text">
                        {currentQ?.question}
                    </div>

                    <div className="options-container">
                        {currentQ?.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-btn ${answers[currentQ.id] === index ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQ.id, index)}
                            >
                                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="option-text">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="test-navigation">
                <div className="nav-buttons">
                    <button
                        className="nav-btn prev-btn"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestion === 0}
                    >
                        ← Previous
                    </button>

                    <div className="question-indicators">
                        {testData.questions.map((_, index) => (
                            <button
                                key={index}
                                className={`question-indicator ${index === currentQuestion ? 'current' : ''} ${answers[testData.questions[index].id] !== undefined ? 'answered' : ''}`}
                                onClick={() => setCurrentQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {currentQuestion === testData.questions.length - 1 ? (
                        <button className="submit-btn" onClick={handleSubmitTest}>
                            🎯 Submit Test
                        </button>
                    ) : (
                        <button className="nav-btn next-btn" onClick={handleNextQuestion}>
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ComprehensionTest;
