import React, { useState, useEffect } from 'react';
import mockTests from '../data/mockTests.json';
import aiService from '../services/aiService';
import DynamicTestGenerator from './DynamicTestGenerator';
import PreGeneratedTestsManager from './PreGeneratedTestsManager';
import './MockTest.css';

function MockTest({ studentProgress = {} }) {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [aiHelp, setAiHelp] = useState(null);
    const [loadingAiHelp, setLoadingAiHelp] = useState(false);
    const [showDynamicGenerator, setShowDynamicGenerator] = useState(false);
    const [showPreGeneratedTests, setShowPreGeneratedTests] = useState(false);
    const [testMode, setTestMode] = useState('selection'); // 'selection', 'dynamic', 'pre-generated', 'testing'

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

    const handleStartTest = (subject, testKey) => {
        const test = mockTests[subject][testKey];
        setSelectedTest(test);
        setSelectedSubject(subject);
        setTimeRemaining(test.timeLimit * 60);
        setTestStarted(true);
        setCurrentQuestion(0);
        setAnswers({});
        setTestCompleted(false);
        setShowResults(false);
        setTestResults(null);
        setTestMode('testing');
    };

    const handleAITestGenerated = (generatedTest) => {
        setSelectedTest(generatedTest);
        setSelectedSubject(generatedTest.subject);
        setTimeRemaining(generatedTest.timeLimit * 60);
        setTestStarted(true);
        setCurrentQuestion(0);
        setAnswers({});
        setTestCompleted(false);
        setShowResults(false);
        setTestResults(null);
        setShowDynamicGenerator(false);
        setTestMode('testing');
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        if (testCompleted) return;

        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const handleSubmitTest = () => {
        if (!selectedTest) return;

        const results = calculateResults();
        setTestResults(results);
        setTestCompleted(true);
        setShowResults(true);

        // Save results to localStorage
        const testHistory = JSON.parse(localStorage.getItem('mockTestHistory') || '[]');
        testHistory.push({
            subject: selectedSubject,
            testTitle: selectedTest.title,
            date: new Date().toISOString(),
            score: results.score,
            percentage: results.percentage,
            timeUsed: selectedTest.timeLimit * 60 - timeRemaining,
            totalQuestions: selectedTest.totalQuestions
        });
        localStorage.setItem('mockTestHistory', JSON.stringify(testHistory));
    };

    const calculateResults = () => {
        let correct = 0;
        let attempted = 0;
        const questionResults = [];

        selectedTest.questions.forEach(question => {
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
                options: question.options
            });
        });

        return {
            score: correct,
            total: selectedTest.totalQuestions,
            attempted: attempted,
            percentage: Math.round((correct / selectedTest.totalQuestions) * 100),
            timeUsed: selectedTest.timeLimit * 60 - timeRemaining,
            questionResults: questionResults
        };
    };

    const getAiHelp = async (question) => {
        setLoadingAiHelp(true);
        try {
            const response = await aiService.helpWithQuestion(
                question.question,
                selectedSubject,
                question.topic,
                question.topic
            );
            if (response.success) {
                setAiHelp(response.message);
            } else {
                setAiHelp('AI help is currently unavailable. Please check your AI settings.');
            }
        } catch (error) {
            setAiHelp('AI help is currently unavailable. Please check your AI settings.');
        }
        setLoadingAiHelp(false);
    };

    const resetTest = () => {
        setSelectedSubject(null);
        setSelectedTest(null);
        setCurrentQuestion(0);
        setAnswers({});
        setTimeRemaining(0);
        setTestStarted(false);
        setTestCompleted(false);
        setShowResults(false);
        setTestResults(null);
        setShowExplanation(false);
        setAiHelp(null);
    };

    const resetToSelection = () => {
        setSelectedTest(null);
        setSelectedSubject(null);
        setTestStarted(false);
        setTestCompleted(false);
        setShowResults(false);
        setCurrentQuestion(0);
        setAnswers({});
        setTestResults(null);
        setShowDynamicGenerator(false);
        setTestMode('selection');
    };

    // Test selection view
    if (!testStarted) {
        return (
            <div className="mock-test-container">
                <div className="mock-test-header">
                    <h1>🎯 Mock Tests</h1>
                    <p>Practice under exam conditions to test your knowledge</p>
                </div>

                <div className="test-selection">
                    <div className="test-mode-selector">
                        <button
                            className={`mode-btn ${testMode === 'selection' ? 'active' : ''}`}
                            onClick={() => setTestMode('selection')}
                        >
                            📚 Standard Tests
                        </button>
                        <button
                            className={`mode-btn ${testMode === 'dynamic' ? 'active' : ''}`}
                            onClick={() => setTestMode('dynamic')}
                        >
                            🤖 AI Generated Tests
                        </button>
                        <button
                            className={`mode-btn ${testMode === 'pre-generated' ? 'active' : ''}`}
                            onClick={() => setTestMode('pre-generated')}
                        >
                            📁 Offline AI Tests
                        </button>
                    </div>

                    {testMode === 'selection' && (
                        <div className="subjects-grid">
                            {Object.keys(mockTests).map(subject => (
                                <div key={subject} className="subject-section">
                                    <h2>{subject.charAt(0).toUpperCase() + subject.slice(1)} Tests</h2>
                                    <div className="tests-grid">
                                        {Object.keys(mockTests[subject]).map(testKey => {
                                            const test = mockTests[subject][testKey];
                                            return (
                                                <div key={testKey} className="test-card">
                                                    <h3>{test.title}</h3>
                                                    <p className="test-description">{test.description}</p>
                                                    <div className="test-info">
                                                        <span className="test-questions">📝 {test.totalQuestions} questions</span>
                                                        <span className="test-time">⏱️ {test.timeLimit} minutes</span>
                                                    </div>
                                                    <button
                                                        className="start-test-btn"
                                                        onClick={() => handleStartTest(subject, testKey)}
                                                    >
                                                        Start Test
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {testMode === 'dynamic' && (
                        <DynamicTestGenerator
                            onTestGenerated={(test) => {
                                setSelectedTest(test);
                                setTimeRemaining(test.timeLimit * 60);
                                setCurrentQuestion(0);
                                setAnswers({});
                                setTestStarted(true);
                                setTestCompleted(false);
                                setShowResults(false);
                                setTestResults(null);
                                setTestMode('testing');
                            }}
                            studentProgress={studentProgress}
                        />
                    )}

                    {testMode === 'pre-generated' && (
                        <PreGeneratedTestsManager
                            onTestSelected={(test) => {
                                setSelectedTest(test);
                                setTimeRemaining(test.timeLimit * 60);
                                setCurrentQuestion(0);
                                setAnswers({});
                                setTestStarted(true);
                                setTestCompleted(false);
                                setShowResults(false);
                                setTestResults(null);
                                setTestMode('testing');
                            }}
                            studentProgress={studentProgress}
                        />
                    )}
                </div>

                <div className="test-tips">
                    <h3>💡 Test Tips</h3>
                    <ul>
                        <li>Find a quiet space and avoid distractions</li>
                        <li>Read each question carefully before answering</li>
                        <li>Keep an eye on the timer</li>
                        <li>Review your answers if time permits</li>
                        <li>Don't spend too long on difficult questions</li>
                    </ul>
                </div>
            </div>
        );
    }

    // Test completion/results view
    if (showResults) {
        return (
            <div className="mock-test-container">
                <div className="test-results">
                    <div className="results-header">
                        <h2>📊 Test Results</h2>
                        <div className="score-circle">
                            <span className="score-percentage">{testResults.percentage}%</span>
                            <span className="score-fraction">{testResults.score}/{testResults.total}</span>
                        </div>
                    </div>

                    <div className="results-summary">
                        <div className="result-stat">
                            <span className="stat-label">Questions Attempted</span>
                            <span className="stat-value">{testResults.attempted}/{testResults.total}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Time Used</span>
                            <span className="stat-value">{formatTime(testResults.timeUsed)}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Grade</span>
                            <span className="stat-value">
                                {testResults.percentage >= 80 ? 'A' :
                                    testResults.percentage >= 70 ? 'B' :
                                        testResults.percentage >= 60 ? 'C' :
                                            testResults.percentage >= 50 ? 'D' : 'F'}
                            </span>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button className="review-btn" onClick={() => setShowExplanation(true)}>
                            Review Answers
                        </button>
                        <button className="retry-btn" onClick={resetTest}>
                            Take Another Test
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="answer-review">
                            <h3>📚 Answer Review</h3>
                            {testResults.questionResults.map((result, index) => (
                                <div key={index} className={`review-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                                    <div className="review-question">
                                        <strong>Q{index + 1}:</strong> {result.question}
                                    </div>
                                    <div className="review-answers">
                                        <div className="user-answer">
                                            <strong>Your answer:</strong> {
                                                result.userAnswer !== undefined
                                                    ? result.options[result.userAnswer]
                                                    : 'Not answered'
                                            }
                                        </div>
                                        <div className="correct-answer">
                                            <strong>Correct answer:</strong> {result.options[result.correctAnswer]}
                                        </div>
                                    </div>
                                    <div className="review-explanation">
                                        <strong>Explanation:</strong> {result.explanation}
                                    </div>
                                    <div className="review-meta">
                                        <span className="topic-tag">{result.topic}</span>
                                        <span className={`difficulty-tag ${result.difficulty}`}>
                                            {result.difficulty}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Test taking view
    const currentQ = selectedTest.questions[currentQuestion];

    return (
        <div className="mock-test-container">
            <div className="test-header">
                <div className="test-info">
                    <h2>{selectedTest.title}</h2>
                    <span className="question-counter">
                        Question {currentQuestion + 1} of {selectedTest.totalQuestions}
                    </span>
                </div>
                <div className="test-timer">
                    <span className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
                        ⏱️ {formatTime(timeRemaining)}
                    </span>
                </div>
            </div>

            <div className="test-progress">
                <div
                    className="progress-bar"
                    style={{ width: `${((currentQuestion + 1) / selectedTest.totalQuestions) * 100}%` }}
                ></div>
            </div>

            <div className="test-content">
                <div className="question-section">
                    <div className="question-header">
                        <h3>Question {currentQuestion + 1}</h3>
                        <button
                            className="ai-help-btn"
                            onClick={() => getAiHelp(currentQ)}
                            disabled={loadingAiHelp}
                        >
                            {loadingAiHelp ? '⏳' : '🤖'} AI Help
                        </button>
                    </div>

                    <div className="question-text">
                        {currentQ.question}
                    </div>

                    <div className="options-container">
                        {currentQ.options.map((option, index) => (
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

                    {aiHelp && (
                        <div className="ai-help-section">
                            <div className="ai-help-header">
                                <h4>🤖 AI Tutor Help</h4>
                                <button onClick={() => setAiHelp(null)}>✕</button>
                            </div>
                            <div className="ai-help-content">{aiHelp}</div>
                        </div>
                    )}
                </div>

                <div className="navigation-section">
                    <button
                        className="nav-btn prev-btn"
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                    >
                        ← Previous
                    </button>

                    {currentQuestion === selectedTest.totalQuestions - 1 ? (
                        <button className="submit-btn" onClick={handleSubmitTest}>
                            Submit Test
                        </button>
                    ) : (
                        <button
                            className="nav-btn next-btn"
                            onClick={() => setCurrentQuestion(Math.min(selectedTest.totalQuestions - 1, currentQuestion + 1))}
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>

            <div className="test-sidebar">
                <h4>Question Navigation</h4>
                <div className="question-grid">
                    {selectedTest.questions.map((_, index) => (
                        <button
                            key={index}
                            className={`question-nav-btn ${index === currentQuestion ? 'current' : ''
                                } ${answers[selectedTest.questions[index].id] !== undefined ? 'answered' : ''}`}
                            onClick={() => setCurrentQuestion(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MockTest;
