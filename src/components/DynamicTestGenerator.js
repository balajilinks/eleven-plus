import React, { useState, useEffect } from 'react';
import aiTestGenerator from '../services/aiTestGenerator';
import aiService from '../services/aiService';
import './DynamicTestGenerator.css';

function DynamicTestGenerator({ onTestGenerated, studentProgress = {} }) {
    const [testOptions, setTestOptions] = useState({
        subject: 'mathematics',
        numQuestions: 15,
        timeLimit: 30,
        difficulty: 'mixed',
        topics: [],
        testType: 'general'
    });

    const [availableTopics, setAvailableTopics] = useState({
        mathematics: [
            'Arithmetic', 'Algebra', 'Geometry', 'Statistics', 'Probability',
            'Fractions', 'Percentages', 'Time and Money', 'Problem Solving'
        ],
        english: [
            'Grammar', 'Vocabulary', 'Reading Comprehension', 'Spelling',
            'Punctuation', 'Writing Skills', 'Literature Analysis'
        ]
    });

    const [generating, setGenerating] = useState(false);
    const [aiConnected, setAiConnected] = useState(false);
    const [error, setError] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [testHistory, setTestHistory] = useState([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [studentAnalytics, setStudentAnalytics] = useState(null);
    const [generationProgress, setGenerationProgress] = useState({ stage: '', progress: 0, error: false });
    const [aiStats, setAiStats] = useState(null);
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        checkAIConnection();
        loadAIStats();
    }, []);

    useEffect(() => {
        // Load test history
        const history = JSON.parse(localStorage.getItem('mockTestHistory') || '[]');
        setTestHistory(history);

        // Generate analytics
        if (Object.keys(studentProgress).length > 0) {
            generateAnalytics();
        }
    }, [studentProgress]);

    const checkAIConnection = async () => {
        const result = await aiService.testConnection();
        setAiConnected(result.success);
    };

    const loadAIStats = () => {
        const stats = aiTestGenerator.getStats();
        setAiStats(stats);
    };

    const handleInputChange = (field, value) => {
        setTestOptions(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTopicToggle = (topic) => {
        setTestOptions(prev => ({
            ...prev,
            topics: prev.topics.includes(topic)
                ? prev.topics.filter(t => t !== topic)
                : [...prev.topics, topic]
        }));
    };

    const generateTest = async () => {
        if (!aiConnected) {
            setError('AI service is not connected. Please check your AI settings.');
            return;
        }

        setGenerating(true);
        setError(null);
        setGenerationProgress({ stage: 'Starting...', progress: 0, error: false });

        const progressCallback = (progress) => {
            setGenerationProgress(progress);
        };

        try {
            let generatedTest;

            switch (testOptions.testType) {
                case 'adaptive':
                    generatedTest = await aiTestGenerator.generateAdaptiveTest(
                        testOptions.subject,
                        studentProgress
                    );
                    break;
                case 'topic-focused':
                    if (testOptions.topics.length === 0) {
                        throw new Error('Please select at least one topic for a topic-focused test.');
                    }
                    generatedTest = await aiTestGenerator.generateRevisionTest(
                        testOptions.subject,
                        testOptions.topics,
                        testOptions.difficulty
                    );
                    break;
                case 'quick':
                    if (testOptions.topics.length === 0) {
                        throw new Error('Please select a topic for a quick test.');
                    }
                    generatedTest = await aiTestGenerator.generateQuickTest(
                        testOptions.subject,
                        testOptions.topics[0],
                        testOptions.difficulty
                    );
                    break;
                default:
                    generatedTest = await aiTestGenerator.generateDynamicTest(
                        testOptions.subject,
                        testOptions,
                        progressCallback
                    );
            }

            onTestGenerated(generatedTest);
            loadAIStats(); // Refresh statistics
        } catch (error) {
            setError(error.message);
            setGenerationProgress({ stage: 'Error occurred', progress: 0, error: true });
            loadAIStats(); // Refresh statistics even on error
        } finally {
            setGenerating(false);
            setTimeout(() => {
                setGenerationProgress({ stage: '', progress: 0, error: false });
            }, 3000);
        }
    };

    const generateProgressiveTest = async () => {
        if (!aiConnected) {
            setError('AI service is not connected. Please check your AI settings.');
            return;
        }

        setGenerating(true);
        setError(null);
        setGenerationProgress({ stage: 'Analyzing your progress...', progress: 0, error: false });

        const progressCallback = (progress) => {
            setGenerationProgress(progress);
        };

        try {
            const progressiveTest = await aiTestGenerator.generateProgressiveTest(
                testOptions.subject,
                studentProgress,
                testHistory,
                progressCallback
            );

            onTestGenerated(progressiveTest);
            loadAIStats(); // Refresh statistics
        } catch (error) {
            setError(error.message);
            setGenerationProgress({ stage: 'Error occurred', progress: 0, error: true });
            loadAIStats(); // Refresh statistics even on error
        } finally {
            setGenerating(false);
            setTimeout(() => {
                setGenerationProgress({ stage: '', progress: 0, error: false });
            }, 3000);
        }
    };

    const getRecommendedSettings = () => {
        if (!studentProgress || Object.keys(studentProgress).length === 0) {
            return {
                difficulty: 'mixed',
                topics: [],
                message: 'Complete some learning modules to get personalized recommendations!'
            };
        }

        const scores = Object.values(studentProgress).map(p => p.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        let difficulty = 'mixed';
        if (avgScore >= 80) difficulty = 'hard';
        else if (avgScore >= 60) difficulty = 'medium';
        else difficulty = 'easy';

        const weakTopics = Object.entries(studentProgress)
            .filter(([_, value]) => value.score < 70)
            .map(([key, _]) => key.split('-').pop())
            .slice(0, 3);

        return {
            difficulty,
            topics: weakTopics,
            message: `Based on your progress (${Math.round(avgScore)}% average), we recommend focusing on areas that need improvement.`
        };
    };

    const applyRecommendations = () => {
        const recommendations = getRecommendedSettings();
        setTestOptions(prev => ({
            ...prev,
            difficulty: recommendations.difficulty,
            topics: recommendations.topics,
            testType: recommendations.topics.length > 0 ? 'topic-focused' : 'adaptive'
        }));
    };

    const testTypes = [
        {
            id: 'general',
            name: 'General Test',
            description: 'Mixed questions covering various topics',
            icon: '📝'
        },
        {
            id: 'adaptive',
            name: 'Adaptive Test',
            description: 'AI adjusts difficulty based on your progress',
            icon: '🧠'
        },
        {
            id: 'topic-focused',
            name: 'Topic-Focused',
            description: 'Concentrate on specific topics you choose',
            icon: '🎯'
        },
        {
            id: 'quick',
            name: 'Quick Test',
            description: '10 questions, 20 minutes - perfect for quick practice',
            icon: '⚡'
        }
    ];

    const recommendations = getRecommendedSettings();

    return (
        <div className="dynamic-test-generator">
            <div className="generator-header">
                <h2>🤖 AI Test Generator</h2>
                <p>Create personalized tests tailored to your learning needs</p>

                <div className={`ai-status-indicator ${aiConnected ? 'connected' : 'disconnected'}`}>
                    <div className="status-dot"></div>
                    {aiConnected ? '✅ AI Connected' : '❌ AI Disconnected'}
                    {aiStats && (
                        <button
                            className="stats-toggle-btn"
                            onClick={() => setShowStats(!showStats)}
                        >
                            📊 Stats
                        </button>
                    )}
                </div>

                {showStats && aiStats && (
                    <div className="generation-stats">
                        <div className="stat-item">
                            <span className="stat-value">{aiStats.testsGenerated}</span>
                            <span className="stat-label">Tests Generated</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{aiStats.totalQuestions}</span>
                            <span className="stat-label">Questions Created</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{aiStats.avgGenerationTime}ms</span>
                            <span className="stat-label">Avg Time</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{aiStats.cacheHits}</span>
                            <span className="stat-label">Cache Hits</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{aiStats.successRate}%</span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                    </div>
                )}

                {!aiConnected && (
                    <div className="ai-warning">
                        ⚠️ AI service not connected. Please configure AI settings first.
                    </div>
                )}
            </div>

            {recommendations.topics.length > 0 && (
                <div className="recommendations-section">
                    <h3>📊 Recommended for You</h3>
                    <p>{recommendations.message}</p>
                    <div className="recommendation-details">
                        <span>Suggested difficulty: <strong>{recommendations.difficulty}</strong></span>
                        <span>Focus areas: <strong>{recommendations.topics.join(', ')}</strong></span>
                    </div>
                    <div className="recommendation-actions">
                        <button
                            className="apply-recommendations-btn"
                            onClick={applyRecommendations}
                        >
                            Apply Recommendations
                        </button>
                        <button
                            className="progressive-test-btn"
                            onClick={generateProgressiveTest}
                            disabled={generating || !aiConnected}
                        >
                            🧠 Generate Smart Test
                        </button>
                    </div>
                </div>
            )}

            {studentAnalytics && (
                <div className="analytics-section">
                    <div className="analytics-header">
                        <h3>📈 Learning Analytics</h3>
                        <button
                            className="toggle-analytics-btn"
                            onClick={() => setShowAnalytics(!showAnalytics)}
                        >
                            {showAnalytics ? 'Hide' : 'Show'} Details
                        </button>
                    </div>

                    {showAnalytics && (
                        <div className="analytics-details">
                            <div className="analytics-grid">
                                <div className="analytics-card">
                                    <h4>Current Level</h4>
                                    <span className={`level-badge ${studentAnalytics.currentLevel}`}>
                                        {studentAnalytics.currentLevel}
                                    </span>
                                </div>
                                <div className="analytics-card">
                                    <h4>Learning Velocity</h4>
                                    <span className={`velocity-badge ${studentAnalytics.learningVelocity}`}>
                                        {studentAnalytics.learningVelocity}
                                    </span>
                                </div>
                                <div className="analytics-card">
                                    <h4>Confidence Level</h4>
                                    <span className={`confidence-badge ${studentAnalytics.confidenceLevel}`}>
                                        {studentAnalytics.confidenceLevel}
                                    </span>
                                </div>
                            </div>

                            {studentAnalytics.priorityTopics.length > 0 && (
                                <div className="priority-topics">
                                    <h4>Priority Topics for Improvement</h4>
                                    <div className="topics-list">
                                        {studentAnalytics.priorityTopics.map((topic, index) => (
                                            <span key={index} className="priority-topic">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="generator-options">
                <div className="option-group">
                    <label>Subject</label>
                    <select
                        value={testOptions.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                    >
                        <option value="mathematics">Mathematics</option>
                        <option value="english">English</option>
                    </select>
                </div>

                <div className="option-group">
                    <label>Test Type</label>
                    <div className="test-type-grid">
                        {testTypes.map(type => (
                            <div
                                key={type.id}
                                className={`test-type-card ${testOptions.testType === type.id ? 'selected' : ''}`}
                                onClick={() => handleInputChange('testType', type.id)}
                            >
                                <div className="test-type-icon">{type.icon}</div>
                                <div className="test-type-name">{type.name}</div>
                                <div className="test-type-description">{type.description}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="option-row">
                    <div className="option-group">
                        <label>Number of Questions</label>
                        <select
                            value={testOptions.numQuestions}
                            onChange={(e) => handleInputChange('numQuestions', parseInt(e.target.value))}
                        >
                            <option value={10}>10 questions</option>
                            <option value={15}>15 questions</option>
                            <option value={20}>20 questions</option>
                            <option value={25}>25 questions</option>
                            <option value={30}>30 questions</option>
                        </select>
                    </div>

                    <div className="option-group">
                        <label>Time Limit</label>
                        <select
                            value={testOptions.timeLimit}
                            onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                        >
                            <option value={15}>15 minutes</option>
                            <option value={20}>20 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                    </div>

                    <div className="option-group">
                        <label>Difficulty</label>
                        <select
                            value={testOptions.difficulty}
                            onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </div>
                </div>

                {(testOptions.testType === 'topic-focused' || testOptions.testType === 'quick') && (
                    <div className="option-group">
                        <label>
                            Topics {testOptions.testType === 'quick' ? '(select one)' : '(select multiple)'}
                        </label>
                        <div className="topics-grid">
                            {availableTopics[testOptions.subject].map(topic => (
                                <button
                                    key={topic}
                                    className={`topic-btn ${testOptions.topics.includes(topic) ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (testOptions.testType === 'quick') {
                                            handleInputChange('topics', [topic]);
                                        } else {
                                            handleTopicToggle(topic);
                                        }
                                    }}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            <div className="generator-actions">
                <button
                    className="generate-btn"
                    onClick={generateTest}
                    disabled={generating || !aiConnected}
                >
                    {generating ? (
                        <>
                            <span className="loading-spinner">⏳</span>
                            Generating Test...
                        </>
                    ) : (
                        <>
                            🚀 Generate Test
                        </>
                    )}
                </button>

                <button
                    className="preview-btn"
                    onClick={() => setPreviewMode(!previewMode)}
                >
                    {previewMode ? 'Hide' : 'Show'} Preview
                </button>
            </div>

            {generating && generationProgress.stage && (
                <div className="generation-progress">
                    <div className="progress-info">
                        <span className="progress-stage">{generationProgress.stage}</span>
                        <span className="progress-percentage">{generationProgress.progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${generationProgress.error ? 'error' : ''}`}
                            style={{ width: `${generationProgress.progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {previewMode && (
                <div className="test-preview">
                    <h3>Test Preview</h3>
                    <div className="preview-details">
                        <p><strong>Subject:</strong> {testOptions.subject}</p>
                        <p><strong>Type:</strong> {testTypes.find(t => t.id === testOptions.testType)?.name}</p>
                        <p><strong>Questions:</strong> {testOptions.numQuestions}</p>
                        <p><strong>Time:</strong> {testOptions.timeLimit} minutes</p>
                        <p><strong>Difficulty:</strong> {testOptions.difficulty}</p>
                        {testOptions.topics.length > 0 && (
                            <p><strong>Topics:</strong> {testOptions.topics.join(', ')}</p>
                        )}
                    </div>
                </div>
            )}

            {showAnalytics && studentAnalytics && (
                <div className="analytics-section">
                    <h3>📈 Student Analytics</h3>
                    <pre>{JSON.stringify(studentAnalytics, null, 2)}</pre>
                </div>
            )}

            {generating && (
                <div className="generation-progress">
                    <div className="progress-stage">{generationProgress.stage}</div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${generationProgress.progress}%` }}
                        />
                    </div>
                    {generationProgress.error && (
                        <div className="progress-error">
                            ❌ Error generating test. Please try again.
                        </div>
                    )}
                </div>
            )}

            {showStats && aiStats && (
                <div className="ai-stats-section">
                    <h3>📊 AI Statistics</h3>
                    <pre>{JSON.stringify(aiStats, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default DynamicTestGenerator;
