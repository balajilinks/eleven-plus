import React, { useState, useEffect } from 'react';
import preGeneratedTestsService from '../services/preGeneratedTestsService';
import './PreGeneratedTestsManager.css';

function PreGeneratedTestsManager({ onTestSelected, studentProgress = {} }) {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [filters, setFilters] = useState({
        subject: '',
        difficulty: '',
        type: '',
        search: ''
    });
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        loadTests();
        loadStatistics();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tests, filters]);

    const loadTests = () => {
        const allTests = preGeneratedTestsService.getAllTests();
        setTests(allTests);
        setFilteredTests(allTests);
    };

    const loadStatistics = () => {
        const stats = preGeneratedTestsService.getTestStatistics();
        setStatistics(stats);
    };

    const applyFilters = () => {
        let filtered = [...tests];

        // Apply subject filter
        if (filters.subject) {
            filtered = filtered.filter(test => test.subject === filters.subject);
        }

        // Apply difficulty filter
        if (filters.difficulty) {
            filtered = filtered.filter(test => test.difficulty === filters.difficulty);
        }

        // Apply type filter
        if (filters.type) {
            switch (filters.type) {
                case 'quick':
                    filtered = filtered.filter(test => test.isQuickPractice);
                    break;
                case 'adaptive':
                    filtered = filtered.filter(test => test.isAdaptive);
                    break;
                case 'advanced':
                    filtered = filtered.filter(test => test.isAdvanced);
                    break;
                case 'revision':
                    filtered = filtered.filter(test => test.isRevision);
                    break;
                default:
                    break;
            }
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(test =>
                test.title.toLowerCase().includes(searchLower) ||
                test.description.toLowerCase().includes(searchLower) ||
                test.topics.some(topic => topic.toLowerCase().includes(searchLower))
            );
        }

        setFilteredTests(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            subject: '',
            difficulty: '',
            type: '',
            search: ''
        });
    };

    const handleTestSelect = (test) => {
        onTestSelected(test);
    };

    const getRecommendedTests = () => {
        if (!studentProgress || Object.keys(studentProgress).length === 0) {
            return preGeneratedTestsService.getQuickTests().slice(0, 3);
        }

        // Simple recommendation based on performance
        const scores = Object.values(studentProgress).map(p => p.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        if (avgScore >= 80) {
            return preGeneratedTestsService.getAdvancedTests().slice(0, 3);
        } else if (avgScore >= 60) {
            return preGeneratedTestsService.searchTests({ difficulty: 'medium' }).slice(0, 3);
        } else {
            return preGeneratedTestsService.searchTests({ difficulty: 'easy' }).slice(0, 3);
        }
    };

    const getTestTypeIcon = (test) => {
        if (test.isQuickPractice) return '⚡';
        if (test.isAdaptive) return '🧠';
        if (test.isAdvanced) return '🎯';
        if (test.isRevision) return '📚';
        return '📝';
    };

    const getTestTypeLabel = (test) => {
        if (test.isQuickPractice) return 'Quick Practice';
        if (test.isAdaptive) return 'Adaptive';
        if (test.isAdvanced) return 'Advanced';
        if (test.isRevision) return 'Revision';
        return 'General';
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return '#28a745';
            case 'medium': return '#ffc107';
            case 'hard': return '#dc3545';
            case 'mixed': return '#6f42c1';
            default: return '#6c757d';
        }
    };

    const recommendedTests = getRecommendedTests();

    return (
        <div className="pre-generated-tests-manager">
            <div className="manager-header">
                <h2>📚 Pre-Generated AI Tests</h2>
                <p>High-quality tests generated offline and ready to use</p>

                <div className="header-actions">
                    <button
                        className="stats-btn"
                        onClick={() => setShowStats(!showStats)}
                    >
                        📊 {showStats ? 'Hide' : 'Show'} Statistics
                    </button>
                </div>
            </div>

            {showStats && statistics && (
                <div className="statistics-panel">
                    <h3>📈 Test Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{statistics.total}</span>
                            <span className="stat-label">Total Tests</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{statistics.totalQuestions}</span>
                            <span className="stat-label">Total Questions</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{statistics.averageQuestions}</span>
                            <span className="stat-label">Avg Questions/Test</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{Object.keys(statistics.bySubject).length}</span>
                            <span className="stat-label">Subjects</span>
                        </div>
                    </div>

                    <div className="stats-breakdown">
                        <div className="breakdown-section">
                            <h4>By Subject</h4>
                            {Object.entries(statistics.bySubject).map(([subject, count]) => (
                                <div key={subject} className="breakdown-item">
                                    <span>{subject}</span>
                                    <span>{count} tests</span>
                                </div>
                            ))}
                        </div>
                        <div className="breakdown-section">
                            <h4>By Type</h4>
                            {Object.entries(statistics.byType).map(([type, count]) => (
                                <div key={type} className="breakdown-item">
                                    <span>{type}</span>
                                    <span>{count} tests</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {recommendedTests.length > 0 && (
                <div className="recommended-section">
                    <h3>⭐ Recommended for You</h3>
                    <div className="recommended-tests">
                        {recommendedTests.map(test => (
                            <div key={test.id} className="recommended-test-card">
                                <div className="test-icon">{getTestTypeIcon(test)}</div>
                                <div className="test-info">
                                    <h4>{test.title}</h4>
                                    <p>{test.description}</p>
                                </div>
                                <button
                                    className="select-test-btn"
                                    onClick={() => handleTestSelect(test)}
                                >
                                    Start Test
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="filters-section">
                <h3>🔍 Find Tests</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Subject</label>
                        <select
                            value={filters.subject}
                            onChange={(e) => handleFilterChange('subject', e.target.value)}
                        >
                            <option value="">All Subjects</option>
                            <option value="mathematics">Mathematics</option>
                            <option value="english">English</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Difficulty</label>
                        <select
                            value={filters.difficulty}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        >
                            <option value="">All Levels</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="quick">Quick Practice</option>
                            <option value="adaptive">Adaptive</option>
                            <option value="advanced">Advanced</option>
                            <option value="revision">Revision</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-actions">
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        Clear Filters
                    </button>
                    <span className="results-count">
                        {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found
                    </span>
                </div>
            </div>

            <div className="tests-grid">
                {filteredTests.map(test => (
                    <div key={test.id} className="test-card">
                        <div className="test-header">
                            <div className="test-icon-large">{getTestTypeIcon(test)}</div>
                            <div className="test-meta">
                                <span className="test-type">{getTestTypeLabel(test)}</span>
                                <span
                                    className="test-difficulty"
                                    style={{ backgroundColor: getDifficultyColor(test.difficulty) }}
                                >
                                    {test.difficulty}
                                </span>
                            </div>
                        </div>

                        <div className="test-content">
                            <h3>{test.title}</h3>
                            <p>{test.description}</p>

                            <div className="test-details">
                                <div className="detail-item">
                                    <span className="detail-label">Subject:</span>
                                    <span className="detail-value">{test.subject}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Questions:</span>
                                    <span className="detail-value">{test.totalQuestions}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Time:</span>
                                    <span className="detail-value">{test.timeLimit} min</span>
                                </div>
                            </div>

                            {test.topics && test.topics.length > 0 && (
                                <div className="test-topics">
                                    {test.topics.slice(0, 3).map(topic => (
                                        <span key={topic} className="topic-tag">
                                            {topic}
                                        </span>
                                    ))}
                                    {test.topics.length > 3 && (
                                        <span className="topic-more">+{test.topics.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="test-actions">
                            <button
                                className="start-test-btn"
                                onClick={() => handleTestSelect(test)}
                            >
                                🚀 Start Test
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTests.length === 0 && (
                <div className="no-tests-message">
                    <h3>No tests found</h3>
                    <p>Try adjusting your filters or add more test files to the ai-tests folder.</p>
                </div>
            )}
        </div>
    );
}

export default PreGeneratedTestsManager;
