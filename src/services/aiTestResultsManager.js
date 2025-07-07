// AI Test Results Export/Import Utility
class AITestResultsManager {
    constructor() {
        this.storageKey = 'aiTestResults';
        this.settingsKey = 'aiTestSettings';
    }

    // Export all AI test data
    exportAllData() {
        const data = {
            testResults: this.getAllTestResults(),
            settings: this.getAISettings(),
            statistics: this.getAIStatistics(),
            progress: this.getStudentProgress(),
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-test-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return data;
    }

    // Import AI test data
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.validateImportData(data);

                    // Import data
                    if (data.testResults) {
                        this.importTestResults(data.testResults);
                    }
                    if (data.settings) {
                        this.importAISettings(data.settings);
                    }
                    if (data.statistics) {
                        this.importAIStatistics(data.statistics);
                    }
                    if (data.progress) {
                        this.importStudentProgress(data.progress);
                    }

                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid import file: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Validate import data structure
    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }

        if (!data.exportDate || !data.appVersion) {
            throw new Error('Missing required metadata');
        }

        // Check version compatibility
        const supportedVersions = ['1.0.0'];
        if (!supportedVersions.includes(data.appVersion)) {
            console.warn(`Importing from version ${data.appVersion} may cause issues`);
        }
    }

    // Export specific test results
    exportTestResults(testIds = null) {
        const results = this.getAllTestResults();
        const filtered = testIds ? results.filter(r => testIds.includes(r.id)) : results;

        const data = {
            testResults: filtered,
            exportDate: new Date().toISOString(),
            type: 'test-results-only'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return data;
    }

    // Export AI settings
    exportAISettings() {
        const settings = this.getAISettings();

        // Remove sensitive data like API keys
        const cleanSettings = { ...settings };
        if (cleanSettings.apiKey) {
            cleanSettings.apiKey = '***REMOVED***';
        }

        const data = {
            settings: cleanSettings,
            exportDate: new Date().toISOString(),
            type: 'ai-settings-only'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return data;
    }

    // Generate analytics report
    generateAnalyticsReport() {
        const results = this.getAllTestResults();
        const stats = this.getAIStatistics();
        const progress = this.getStudentProgress();

        const report = {
            summary: {
                totalTests: results.length,
                totalQuestions: results.reduce((sum, r) => sum + (r.totalQuestions || 0), 0),
                averageScore: this.calculateAverageScore(results),
                improvementTrend: this.calculateImprovementTrend(results),
                generatedAt: new Date().toISOString()
            },
            aiUsage: {
                testsGenerated: stats.testsGenerated || 0,
                questionsCreated: stats.totalQuestions || 0,
                avgGenerationTime: stats.avgGenerationTime || 0,
                successRate: stats.successRate || 0,
                cacheHits: stats.cacheHits || 0
            },
            performance: {
                bySubject: this.analyzePerformanceBySubject(results),
                byDifficulty: this.analyzePerformanceByDifficulty(results),
                byTopic: this.analyzePerformanceByTopic(results),
                timeAnalysis: this.analyzeTimeSpent(results)
            },
            recommendations: this.generateRecommendations(results, progress)
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return report;
    }

    // Helper methods
    getAllTestResults() {
        return JSON.parse(localStorage.getItem('mockTestHistory') || '[]');
    }

    getAISettings() {
        return JSON.parse(localStorage.getItem('aiConfig') || '{}');
    }

    getAIStatistics() {
        return JSON.parse(localStorage.getItem('aiTestGeneratorStats') || '{}');
    }

    getStudentProgress() {
        return JSON.parse(localStorage.getItem('studentProgress') || '{}');
    }

    importTestResults(results) {
        const existing = this.getAllTestResults();
        const merged = [...existing, ...results];
        localStorage.setItem('mockTestHistory', JSON.stringify(merged));
    }

    importAISettings(settings) {
        // Don't import API keys for security
        const cleanSettings = { ...settings };
        delete cleanSettings.apiKey;

        const existing = this.getAISettings();
        const merged = { ...existing, ...cleanSettings };
        localStorage.setItem('aiConfig', JSON.stringify(merged));
    }

    importAIStatistics(stats) {
        const existing = this.getAIStatistics();
        const merged = { ...existing, ...stats };
        localStorage.setItem('aiTestGeneratorStats', JSON.stringify(merged));
    }

    importStudentProgress(progress) {
        const existing = this.getStudentProgress();
        const merged = { ...existing, ...progress };
        localStorage.setItem('studentProgress', JSON.stringify(merged));
    }

    calculateAverageScore(results) {
        if (!results.length) return 0;
        const total = results.reduce((sum, r) => sum + (r.percentage || 0), 0);
        return Math.round(total / results.length);
    }

    calculateImprovementTrend(results) {
        if (results.length < 2) return 0;

        const sorted = results.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recent = sorted.slice(-5);
        const older = sorted.slice(0, -5);

        if (older.length === 0) return 0;

        const recentAvg = recent.reduce((sum, r) => sum + (r.percentage || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + (r.percentage || 0), 0) / older.length;

        return Math.round(recentAvg - olderAvg);
    }

    analyzePerformanceBySubject(results) {
        const subjects = {};

        results.forEach(result => {
            const subject = result.subject || 'unknown';
            if (!subjects[subject]) {
                subjects[subject] = { tests: 0, totalScore: 0, avgScore: 0 };
            }
            subjects[subject].tests++;
            subjects[subject].totalScore += result.percentage || 0;
        });

        Object.keys(subjects).forEach(subject => {
            subjects[subject].avgScore = Math.round(subjects[subject].totalScore / subjects[subject].tests);
        });

        return subjects;
    }

    analyzePerformanceByDifficulty(results) {
        const difficulties = {};

        results.forEach(result => {
            const difficulty = result.difficulty || 'unknown';
            if (!difficulties[difficulty]) {
                difficulties[difficulty] = { tests: 0, totalScore: 0, avgScore: 0 };
            }
            difficulties[difficulty].tests++;
            difficulties[difficulty].totalScore += result.percentage || 0;
        });

        Object.keys(difficulties).forEach(difficulty => {
            difficulties[difficulty].avgScore = Math.round(difficulties[difficulty].totalScore / difficulties[difficulty].tests);
        });

        return difficulties;
    }

    analyzePerformanceByTopic(results) {
        const topics = {};

        results.forEach(result => {
            if (result.topicBreakdown) {
                Object.entries(result.topicBreakdown).forEach(([topic, score]) => {
                    if (!topics[topic]) {
                        topics[topic] = { attempts: 0, totalScore: 0, avgScore: 0 };
                    }
                    topics[topic].attempts++;
                    topics[topic].totalScore += score;
                });
            }
        });

        Object.keys(topics).forEach(topic => {
            topics[topic].avgScore = Math.round(topics[topic].totalScore / topics[topic].attempts);
        });

        return topics;
    }

    analyzeTimeSpent(results) {
        const totalTime = results.reduce((sum, r) => sum + (r.timeUsed || 0), 0);
        const avgTime = results.length > 0 ? totalTime / results.length : 0;

        return {
            totalMinutes: Math.round(totalTime / 60),
            averageMinutes: Math.round(avgTime / 60),
            totalTests: results.length
        };
    }

    generateRecommendations(results, progress) {
        const recommendations = [];

        const avgScore = this.calculateAverageScore(results);
        const improvement = this.calculateImprovementTrend(results);

        if (avgScore < 50) {
            recommendations.push("Focus on foundational concepts before attempting more tests");
        } else if (avgScore < 70) {
            recommendations.push("Continue regular practice to build confidence");
        } else if (avgScore >= 85) {
            recommendations.push("Consider more challenging test types to push your limits");
        }

        if (improvement > 10) {
            recommendations.push("Excellent progress! Keep up the current study routine");
        } else if (improvement < -5) {
            recommendations.push("Consider reviewing recent topics or adjusting study approach");
        }

        return recommendations;
    }

    // Clear all data (with confirmation)
    clearAllData(confirm = false) {
        if (!confirm) {
            throw new Error('Data clearing requires explicit confirmation');
        }

        localStorage.removeItem('mockTestHistory');
        localStorage.removeItem('aiConfig');
        localStorage.removeItem('aiTestGeneratorStats');
        localStorage.removeItem('studentProgress');

        return { success: true, message: 'All data cleared successfully' };
    }
}

export default new AITestResultsManager();
