// Pre-generated AI Tests Loader Service
import aiMathGeneral001 from '../data/ai-tests/ai-math-general-001.json';
import aiEnglishGeneral001 from '../data/ai-tests/ai-english-general-001.json';
import aiQuickPractice001 from '../data/ai-tests/ai-quick-practice-001.json';
import aiEnglishVocab002 from '../data/ai-tests/ai-english-vocab-002.json';
import aiMathGeometry003 from '../data/ai-tests/ai-math-geometry-003.json';
import aiEnglishComprehension001 from '../data/ai-tests/ai-english-comprehension-001.json';
// Import additional test files as they are added

class PreGeneratedTestsService {
    constructor() {
        this.tests = new Map();
        this.testIndex = new Map(); // For quick searching
        this.loadTests();
    }

    loadTests() {
        // Load all available pre-generated tests
        const availableTests = [
            // Math tests
            { id: 'ai-math-general-001', data: this.safeImport(aiMathGeneral001) },
            { id: 'ai-math-geometry-003', data: this.safeImport(aiMathGeometry003) },
            // English tests  
            { id: 'ai-english-general-001', data: this.safeImport(aiEnglishGeneral001) },
            { id: 'ai-english-vocab-002', data: this.safeImport(aiEnglishVocab002) },
            { id: 'ai-english-comprehension-001', data: this.safeImport(aiEnglishComprehension001) },
            // Quick practice tests
            { id: 'ai-quick-practice-001', data: this.safeImport(aiQuickPractice001) },
            // Add more test imports here as files are created
        ];

        availableTests.forEach(test => {
            if (test.data) {
                this.tests.set(test.id, test.data);
                this.indexTest(test.data);
            }
        });

        console.log(`Loaded ${this.tests.size} pre-generated AI tests`);
    }

    safeImport(testData) {
        // Safely import test data, return null if not available
        try {
            return testData;
        } catch (error) {
            console.warn('Test file not found or invalid:', error.message);
            return null;
        }
    }

    indexTest(testData) {
        // Create searchable index
        const { subject, difficulty, topics = [], id } = testData;

        // Index by subject
        if (!this.testIndex.has(`subject:${subject}`)) {
            this.testIndex.set(`subject:${subject}`, []);
        }
        this.testIndex.get(`subject:${subject}`).push(id);

        // Index by difficulty
        if (!this.testIndex.has(`difficulty:${difficulty}`)) {
            this.testIndex.set(`difficulty:${difficulty}`, []);
        }
        this.testIndex.get(`difficulty:${difficulty}`).push(id);

        // Index by topics
        topics.forEach(topic => {
            const key = `topic:${topic}`;
            if (!this.testIndex.has(key)) {
                this.testIndex.set(key, []);
            }
            this.testIndex.get(key).push(id);
        });
    }

    // Get all available tests
    getAllTests() {
        return Array.from(this.tests.values());
    }

    // Get test by ID
    getTestById(id) {
        return this.tests.get(id);
    }

    // Search tests by criteria
    searchTests(criteria = {}) {
        const { subject, difficulty, topics = [], type } = criteria;
        let candidateIds = new Set(this.tests.keys());

        // Filter by subject
        if (subject) {
            const subjectTests = this.testIndex.get(`subject:${subject}`) || [];
            candidateIds = new Set(subjectTests.filter(id => candidateIds.has(id)));
        }

        // Filter by difficulty
        if (difficulty && difficulty !== 'mixed') {
            const difficultyTests = this.testIndex.get(`difficulty:${difficulty}`) || [];
            candidateIds = new Set(difficultyTests.filter(id => candidateIds.has(id)));
        }

        // Filter by topics
        if (topics.length > 0) {
            topics.forEach(topic => {
                const topicTests = this.testIndex.get(`topic:${topic}`) || [];
                candidateIds = new Set(topicTests.filter(id => candidateIds.has(id)));
            });
        }

        // Filter by type (adaptive, quick, etc.)
        if (type) {
            candidateIds = new Set(Array.from(candidateIds).filter(id => {
                const test = this.tests.get(id);
                switch (type) {
                    case 'adaptive': return test.isAdaptive;
                    case 'quick': return test.isQuickPractice;
                    case 'advanced': return test.isAdvanced;
                    case 'revision': return test.isRevision;
                    default: return true;
                }
            }));
        }

        // Return matching tests
        return Array.from(candidateIds).map(id => this.tests.get(id));
    }

    // Get a random test matching criteria
    getRandomTest(criteria = {}) {
        const matchingTests = this.searchTests(criteria);
        if (matchingTests.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * matchingTests.length);
        return matchingTests[randomIndex];
    }

    // Get tests by subject
    getTestsBySubject(subject) {
        return this.searchTests({ subject });
    }

    // Get tests by difficulty
    getTestsByDifficulty(difficulty) {
        return this.searchTests({ difficulty });
    }

    // Get quick practice tests
    getQuickTests() {
        return Array.from(this.tests.values()).filter(test => test.isQuickPractice);
    }

    // Get adaptive tests
    getAdaptiveTests() {
        return Array.from(this.tests.values()).filter(test => test.isAdaptive);
    }

    // Get advanced tests
    getAdvancedTests() {
        return Array.from(this.tests.values()).filter(test => test.isAdvanced);
    }

    // Get revision tests
    getRevisionTests() {
        return Array.from(this.tests.values()).filter(test => test.isRevision);
    }

    // Get test statistics
    getTestStatistics() {
        const tests = Array.from(this.tests.values());
        const stats = {
            total: tests.length,
            bySubject: {},
            byDifficulty: {},
            byType: {
                general: 0,
                adaptive: 0,
                quick: 0,
                advanced: 0,
                revision: 0
            },
            totalQuestions: 0,
            averageQuestions: 0
        };

        tests.forEach(test => {
            // Count by subject
            stats.bySubject[test.subject] = (stats.bySubject[test.subject] || 0) + 1;

            // Count by difficulty
            stats.byDifficulty[test.difficulty] = (stats.byDifficulty[test.difficulty] || 0) + 1;

            // Count by type
            if (test.isAdaptive) stats.byType.adaptive++;
            else if (test.isQuickPractice) stats.byType.quick++;
            else if (test.isAdvanced) stats.byType.advanced++;
            else if (test.isRevision) stats.byType.revision++;
            else stats.byType.general++;

            // Count questions
            stats.totalQuestions += test.totalQuestions || 0;
        });

        stats.averageQuestions = tests.length > 0 ?
            Math.round(stats.totalQuestions / tests.length) : 0;

        return stats;
    }

    // Validate test format
    validateTest(testData) {
        const required = ['id', 'title', 'subject', 'questions', 'totalQuestions'];
        const missing = required.filter(field => !testData.hasOwnProperty(field));

        if (missing.length > 0) {
            return { valid: false, errors: [`Missing required fields: ${missing.join(', ')}`] };
        }

        const errors = [];

        // Validate questions array
        if (!Array.isArray(testData.questions)) {
            errors.push('Questions must be an array');
        } else {
            testData.questions.forEach((question, index) => {
                if (!question.id) errors.push(`Question ${index + 1} missing id`);
                if (!question.question) errors.push(`Question ${index + 1} missing question text`);
                if (!question.options || question.options.length !== 4) {
                    errors.push(`Question ${index + 1} must have exactly 4 options`);
                }
                if (typeof question.correct !== 'number' || question.correct < 0 || question.correct > 3) {
                    errors.push(`Question ${index + 1} has invalid correct answer index`);
                }
            });
        }

        return { valid: errors.length === 0, errors };
    }

    // Add a new test (for dynamically loaded tests)
    addTest(testData) {
        const validation = this.validateTest(testData);
        if (!validation.valid) {
            throw new Error(`Invalid test data: ${validation.errors.join(', ')}`);
        }

        this.tests.set(testData.id, testData);
        this.indexTest(testData);
        return testData.id;
    }

    // Remove a test
    removeTest(testId) {
        return this.tests.delete(testId);
    }

    // Get available subjects
    getAvailableSubjects() {
        const subjects = new Set();
        this.tests.forEach(test => subjects.add(test.subject));
        return Array.from(subjects);
    }

    // Get available difficulties
    getAvailableDifficulties() {
        const difficulties = new Set();
        this.tests.forEach(test => difficulties.add(test.difficulty));
        return Array.from(difficulties);
    }

    // Get available topics
    getAvailableTopics(subject = null) {
        const topics = new Set();
        this.tests.forEach(test => {
            if (!subject || test.subject === subject) {
                if (test.topics) {
                    test.topics.forEach(topic => topics.add(topic));
                }
            }
        });
        return Array.from(topics);
    }

    // Check if tests are available
    hasTests() {
        return this.tests.size > 0;
    }

    // Get test count by criteria
    getTestCount(criteria = {}) {
        return this.searchTests(criteria).length;
    }

    // Get recent tests (by generation date)
    getRecentTests(limit = 5) {
        return Array.from(this.tests.values())
            .sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate))
            .slice(0, limit);
    }

    // Export test data for backup
    exportTests() {
        const data = {
            tests: Array.from(this.tests.values()),
            statistics: this.getTestStatistics(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pre-generated-tests-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return data;
    }
}

export default new PreGeneratedTestsService();
