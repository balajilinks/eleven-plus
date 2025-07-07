import aiService from './aiService';

class AITestGenerator {
    constructor() {
        this.testCache = new Map();
        this.difficultyLevels = ['easy', 'medium', 'hard'];
        this.questionTypes = ['multiple-choice', 'true-false', 'fill-in-blank'];
        this.stats = {
            testsGenerated: 0,
            totalQuestions: 0,
            avgGenerationTime: 0,
            cacheHits: 0,
            errors: 0
        };
        this.loadStats();
    }

    async generateDynamicTest(subject, options = {}, progressCallback = null) {
        const {
            numQuestions = 20,
            timeLimit = 45,
            difficulty = 'mixed',
            topics = [],
            adaptiveLevel = null,
            studentProgress = null
        } = options;

        try {
            // Notify progress start
            if (progressCallback) {
                progressCallback({ stage: 'Initializing test generation...', progress: 10 });
            }

            // Create a unique cache key
            const cacheKey = this.createCacheKey(subject, options);

            // Check cache first
            if (this.testCache.has(cacheKey)) {
                if (progressCallback) {
                    progressCallback({ stage: 'Loading from cache...', progress: 100 });
                }
                this.stats.cacheHits++;
                return this.testCache.get(cacheKey);
            }

            // Generate test using AI
            if (progressCallback) {
                progressCallback({ stage: 'Connecting to AI service...', progress: 30 });
            }

            const test = await this.generateTestWithAI(subject, options, progressCallback);

            // Cache the result
            this.testCache.set(cacheKey, test);

            this.stats.testsGenerated++;
            this.stats.totalQuestions += test.totalQuestions || 0;

            if (progressCallback) {
                progressCallback({ stage: 'Test generated successfully!', progress: 100 });
            }

            return test;
        } catch (error) {
            console.error('Error generating dynamic test:', error);
            this.stats.errors++;
            if (progressCallback) {
                progressCallback({ stage: 'Error: ' + error.message, progress: 0, error: true });
            }
            throw new Error('Failed to generate dynamic test. Please try again.');
        }
    }

    async generateTestWithAI(subject, options, progressCallback = null) {
        if (progressCallback) {
            progressCallback({ stage: 'Creating test prompt...', progress: 40 });
        }

        const prompt = this.createTestGenerationPrompt(subject, options);

        if (progressCallback) {
            progressCallback({ stage: 'Sending request to AI...', progress: 60 });
        }

        const response = await aiService.sendMessage(prompt);

        if (!response.success) {
            throw new Error(response.error || 'AI service error');
        }

        if (progressCallback) {
            progressCallback({ stage: 'Processing AI response...', progress: 80 });
        }

        // Parse the AI response into a structured test
        const testData = this.parseAIResponse(response.message, subject, options);

        if (progressCallback) {
            progressCallback({ stage: 'Validating test data...', progress: 90 });
        }

        return testData;
    }

    createTestGenerationPrompt(subject, options) {
        const {
            numQuestions = 20,
            timeLimit = 45,
            difficulty = 'mixed',
            topics = [],
            adaptiveLevel = null,
            studentProgress = null
        } = options;

        let prompt = `Generate a ${subject} test with ${numQuestions} questions for 11+ exam preparation.

Requirements:
- Subject: ${subject}
- Number of questions: ${numQuestions}
- Time limit: ${timeLimit} minutes
- Difficulty: ${difficulty}`;

        if (topics.length > 0) {
            prompt += `\n- Focus on topics: ${topics.join(', ')}`;
        }

        if (adaptiveLevel) {
            prompt += `\n- Adaptive level: ${adaptiveLevel}`;
        }

        if (studentProgress) {
            prompt += `\n- Student progress: ${JSON.stringify(studentProgress)}`;
        }

        prompt += `

For each question, provide:
1. The question text
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (letter)
4. A clear explanation
5. The topic/concept being tested
6. Difficulty level (easy/medium/hard)

Format your response as JSON with this structure:
{
  "title": "AI Generated ${subject} Test",
  "description": "Personalized test based on your learning progress",
  "timeLimit": ${timeLimit},
  "totalQuestions": ${numQuestions},
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation here",
      "topic": "Topic name",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Important: 
- Questions should be appropriate for 11+ level (age 10-11)
- Use clear, simple language
- Include a mix of difficulty levels unless specified
- Ensure questions test understanding, not just memorization
- Make explanations educational and encouraging

Generate the test now:`;

        return prompt;
    }

    parseAIResponse(aiResponse, subject, options) {
        try {
            // Try multiple parsing strategies
            let testData = null;

            // Strategy 1: Look for JSON block
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    testData = JSON.parse(jsonMatch[0]);
                } catch (parseError) {
                    console.warn('Failed to parse JSON block:', parseError);
                }
            }

            // Strategy 2: Look for code block with JSON
            if (!testData) {
                const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                if (codeBlockMatch) {
                    try {
                        testData = JSON.parse(codeBlockMatch[1]);
                    } catch (parseError) {
                        console.warn('Failed to parse code block JSON:', parseError);
                    }
                }
            }

            // Strategy 3: Extract questions from structured text
            if (!testData) {
                testData = this.extractQuestionsFromText(aiResponse, subject, options);
            }

            if (!testData) {
                throw new Error('No valid test data found in AI response');
            }

            // Validate and clean the test structure
            this.validateTestStructure(testData);
            testData = this.cleanTestData(testData);

            // Add metadata
            testData.generatedAt = new Date().toISOString();
            testData.generatedBy = 'AI';
            testData.subject = subject;
            testData.options = options;

            return testData;
        } catch (error) {
            console.error('Error parsing AI response:', error);

            // Fallback: create a basic test structure
            return this.createFallbackTest(subject, options);
        }
    }

    extractQuestionsFromText(text, subject, options) {
        // Try to extract questions from unstructured text
        const questions = [];
        const lines = text.split('\n');
        let currentQuestion = null;
        let questionId = 1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for question patterns
            if (line.match(/^\d+\.\s*/) || line.match(/^Q\d+[:\.]?\s*/i)) {
                // Save previous question if exists
                if (currentQuestion && currentQuestion.question && currentQuestion.options.length >= 4) {
                    questions.push(currentQuestion);
                }

                // Start new question
                currentQuestion = {
                    id: questionId++,
                    question: line.replace(/^\d+\.\s*|^Q\d+[:\.]?\s*/i, ''),
                    type: 'multiple-choice',
                    options: [],
                    correct: 0,
                    explanation: 'Generated by AI',
                    topic: 'General',
                    difficulty: 'medium'
                };
            } else if (currentQuestion && (line.match(/^[A-D][\)\.]\s*/) || line.match(/^\d+\.\s*/))) {
                // Add option
                const optionText = line.replace(/^[A-D][\)\.]\s*|\d+\.\s*/, '');
                if (optionText) {
                    currentQuestion.options.push(optionText);
                }
            } else if (currentQuestion && line.toLowerCase().startsWith('answer:')) {
                // Extract correct answer
                const answerMatch = line.match(/answer:\s*([A-D]|\d+)/i);
                if (answerMatch) {
                    const answer = answerMatch[1].toLowerCase();
                    if (answer === 'a' || answer === '1') currentQuestion.correct = 0;
                    else if (answer === 'b' || answer === '2') currentQuestion.correct = 1;
                    else if (answer === 'c' || answer === '3') currentQuestion.correct = 2;
                    else if (answer === 'd' || answer === '4') currentQuestion.correct = 3;
                }
            } else if (currentQuestion && line.toLowerCase().startsWith('explanation:')) {
                currentQuestion.explanation = line.replace(/explanation:\s*/i, '');
            }
        }

        // Add the last question
        if (currentQuestion && currentQuestion.question && currentQuestion.options.length >= 4) {
            questions.push(currentQuestion);
        }

        if (questions.length === 0) {
            return null;
        }

        return {
            title: `AI Generated ${subject} Test`,
            description: 'Test generated from AI response',
            timeLimit: options.timeLimit || 30,
            totalQuestions: questions.length,
            questions: questions
        };
    }

    cleanTestData(testData) {
        // Clean and validate test data
        if (!testData.questions) return testData;

        testData.questions = testData.questions.map((question, index) => {
            // Ensure required fields exist
            return {
                id: question.id || (index + 1),
                question: question.question || `Question ${index + 1}`,
                type: question.type || 'multiple-choice',
                options: Array.isArray(question.options) ? question.options : [],
                correct: typeof question.correct === 'number' ? question.correct : 0,
                explanation: question.explanation || 'No explanation provided',
                topic: question.topic || 'General',
                difficulty: question.difficulty || 'medium'
            };
        }).filter(q => q.options.length >= 4);

        // Update total questions count
        testData.totalQuestions = testData.questions.length;

        return testData;
    }

    validateTestStructure(testData) {
        if (!testData.questions || !Array.isArray(testData.questions)) {
            throw new Error('Invalid test structure: questions array missing');
        }

        testData.questions.forEach((question, index) => {
            if (!question.question || !question.options || !Array.isArray(question.options)) {
                throw new Error(`Invalid question structure at index ${index}`);
            }

            if (question.options.length !== 4) {
                throw new Error(`Question ${index + 1} must have exactly 4 options`);
            }

            if (typeof question.correct !== 'number' || question.correct < 0 || question.correct > 3) {
                throw new Error(`Question ${index + 1} has invalid correct answer index`);
            }
        });
    }

    createFallbackTest(subject, options) {
        const { numQuestions = 10, timeLimit = 30 } = options;

        return {
            title: `AI Generated ${subject} Test`,
            description: 'Basic test - AI generation temporarily unavailable',
            timeLimit: timeLimit,
            totalQuestions: numQuestions,
            questions: this.createFallbackQuestions(subject, numQuestions),
            generatedAt: new Date().toISOString(),
            generatedBy: 'Fallback',
            subject: subject
        };
    }

    createFallbackQuestions(subject, numQuestions) {
        const questions = [];

        for (let i = 0; i < numQuestions; i++) {
            if (subject === 'mathematics') {
                questions.push({
                    id: i + 1,
                    question: `Sample math question ${i + 1}`,
                    type: 'multiple-choice',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct: 0,
                    explanation: 'This is a sample question. Please check AI settings.',
                    topic: 'General',
                    difficulty: 'easy'
                });
            } else {
                questions.push({
                    id: i + 1,
                    question: `Sample English question ${i + 1}`,
                    type: 'multiple-choice',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct: 0,
                    explanation: 'This is a sample question. Please check AI settings.',
                    topic: 'General',
                    difficulty: 'easy'
                });
            }
        }

        return questions;
    }

    async generateAdaptiveTest(subject, studentProgress, previousTestResults = []) {
        // Analyze student performance
        const analysis = this.analyzeStudentPerformance(studentProgress, previousTestResults);

        // Create adaptive options
        const adaptiveOptions = {
            numQuestions: 15,
            timeLimit: 30,
            difficulty: analysis.suggestedDifficulty,
            topics: analysis.weakAreas,
            adaptiveLevel: analysis.level,
            studentProgress: studentProgress
        };

        return await this.generateDynamicTest(subject, adaptiveOptions);
    }

    analyzeStudentPerformance(progress, testResults) {
        const analysis = {
            level: 'medium',
            suggestedDifficulty: 'mixed',
            weakAreas: [],
            strengths: [],
            overallScore: 0
        };

        // Analyze progress data
        if (progress && Object.keys(progress).length > 0) {
            const scores = Object.values(progress).map(p => p.score || 0);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            analysis.overallScore = avgScore;

            // Determine difficulty based on performance
            if (avgScore >= 80) {
                analysis.level = 'advanced';
                analysis.suggestedDifficulty = 'hard';
            } else if (avgScore >= 60) {
                analysis.level = 'intermediate';
                analysis.suggestedDifficulty = 'medium';
            } else {
                analysis.level = 'beginner';
                analysis.suggestedDifficulty = 'easy';
            }

            // Identify weak areas
            Object.entries(progress).forEach(([key, value]) => {
                if (value.score < 70) {
                    const topic = key.split('-').pop();
                    analysis.weakAreas.push(topic);
                }
            });
        }

        return analysis;
    }

    async generateQuickTest(subject, topic, difficulty = 'mixed') {
        const options = {
            numQuestions: 10,
            timeLimit: 20,
            difficulty: difficulty,
            topics: [topic]
        };

        return await this.generateDynamicTest(subject, options);
    }

    async generateRevisionTest(subject, topics, difficulty = 'mixed') {
        const options = {
            numQuestions: 25,
            timeLimit: 40,
            difficulty: difficulty,
            topics: topics
        };

        return await this.generateDynamicTest(subject, options);
    }

    createCacheKey(subject, options) {
        return `${subject}_${JSON.stringify(options)}`;
    }

    clearCache() {
        this.testCache.clear();
    }

    getCacheStats() {
        return {
            size: this.testCache.size,
            keys: Array.from(this.testCache.keys())
        };
    }

    async generateProgressiveTest(subject, studentData, previousTests = []) {
        // Generate a test that adapts based on detailed student progress
        const analysis = this.performAdvancedAnalysis(studentData, previousTests);

        const options = {
            numQuestions: this.calculateOptimalQuestionCount(analysis),
            timeLimit: this.calculateOptimalTimeLimit(analysis),
            difficulty: analysis.optimalDifficulty,
            topics: analysis.priorityTopics,
            adaptiveLevel: analysis.currentLevel,
            studentProgress: studentData,
            focusAreas: analysis.focusAreas
        };

        return await this.generateDynamicTest(subject, options);
    }

    performAdvancedAnalysis(studentData, previousTests) {
        const analysis = {
            currentLevel: 'intermediate',
            optimalDifficulty: 'mixed',
            priorityTopics: [],
            focusAreas: [],
            learningVelocity: 'normal',
            confidenceLevel: 'medium',
            recommendedStudyPlan: []
        };

        if (!studentData || Object.keys(studentData).length === 0) {
            return analysis;
        }

        // Analyze recent performance
        const recentScores = Object.values(studentData)
            .filter(data => data.lastAttempted)
            .sort((a, b) => new Date(b.lastAttempted) - new Date(a.lastAttempted))
            .slice(0, 10)
            .map(data => data.score || 0);

        if (recentScores.length > 0) {
            const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
            const improvement = this.calculateImprovement(recentScores);

            // Determine current level
            if (avgScore >= 85) analysis.currentLevel = 'advanced';
            else if (avgScore >= 70) analysis.currentLevel = 'intermediate';
            else if (avgScore >= 50) analysis.currentLevel = 'beginner';
            else analysis.currentLevel = 'foundation';

            // Determine optimal difficulty
            if (avgScore >= 80 && improvement > 0) analysis.optimalDifficulty = 'hard';
            else if (avgScore >= 60) analysis.optimalDifficulty = 'medium';
            else analysis.optimalDifficulty = 'easy';

            // Learning velocity
            if (improvement > 10) analysis.learningVelocity = 'fast';
            else if (improvement < -5) analysis.learningVelocity = 'slow';
            else analysis.learningVelocity = 'normal';
        }

        // Identify priority topics (areas needing improvement)
        Object.entries(studentData).forEach(([topic, data]) => {
            if (data.score < 70) {
                analysis.priorityTopics.push(topic.replace(/-/g, ' '));
            }
        });

        // Analyze test patterns from previous tests
        if (previousTests.length > 0) {
            const testAnalysis = this.analyzeTestPatterns(previousTests);
            analysis.focusAreas = testAnalysis.weakPatterns;
            analysis.confidenceLevel = testAnalysis.overallConfidence;
        }

        return analysis;
    }

    calculateImprovement(scores) {
        if (scores.length < 3) return 0;

        const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const older = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;

        return recent - older;
    }

    calculateOptimalQuestionCount(analysis) {
        const baseCount = 15;

        if (analysis.currentLevel === 'advanced') return Math.min(25, baseCount + 5);
        if (analysis.currentLevel === 'beginner') return Math.max(10, baseCount - 5);
        if (analysis.learningVelocity === 'fast') return baseCount + 3;
        if (analysis.learningVelocity === 'slow') return Math.max(8, baseCount - 3);

        return baseCount;
    }

    calculateOptimalTimeLimit(analysis) {
        const baseTime = 30;

        if (analysis.currentLevel === 'advanced') return baseTime + 10;
        if (analysis.currentLevel === 'beginner') return baseTime + 15;
        if (analysis.learningVelocity === 'slow') return baseTime + 10;

        return baseTime;
    }

    analyzeTestPatterns(tests) {
        const patterns = {
            weakPatterns: [],
            overallConfidence: 'medium',
            commonMistakes: []
        };

        // Analyze question types that are frequently missed
        const mistakes = {};

        tests.forEach(test => {
            if (test.results && test.results.incorrectQuestions) {
                test.results.incorrectQuestions.forEach(q => {
                    const topic = q.topic || 'Unknown';
                    mistakes[topic] = (mistakes[topic] || 0) + 1;
                });
            }
        });

        // Identify patterns
        Object.entries(mistakes).forEach(([topic, count]) => {
            if (count >= 2) {
                patterns.weakPatterns.push(topic);
            }
        });

        // Calculate confidence based on recent performance
        const recentTests = tests.slice(-5);
        if (recentTests.length > 0) {
            const avgScore = recentTests.reduce((sum, test) => sum + (test.percentage || 0), 0) / recentTests.length;

            if (avgScore >= 80) patterns.overallConfidence = 'high';
            else if (avgScore >= 60) patterns.overallConfidence = 'medium';
            else patterns.overallConfidence = 'low';
        }

        return patterns;
    }

    loadStats() {
        const saved = localStorage.getItem('aiTestGeneratorStats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    }

    saveStats() {
        localStorage.setItem('aiTestGeneratorStats', JSON.stringify(this.stats));
    }

    updateStats(testData, generationTime, fromCache = false) {
        if (fromCache) {
            this.stats.cacheHits++;
        } else {
            this.stats.testsGenerated++;
            this.stats.totalQuestions += testData.questions ? testData.questions.length : 0;

            // Update average generation time
            const totalTime = this.stats.avgGenerationTime * (this.stats.testsGenerated - 1) + generationTime;
            this.stats.avgGenerationTime = Math.round(totalTime / this.stats.testsGenerated);
        }

        this.saveStats();
    }

    recordError() {
        this.stats.errors++;
        this.saveStats();
    }

    getStats() {
        return {
            ...this.stats,
            cacheSize: this.testCache.size,
            successRate: this.stats.testsGenerated > 0
                ? Math.round((this.stats.testsGenerated / (this.stats.testsGenerated + this.stats.errors)) * 100)
                : 0
        };
    }

    resetStats() {
        this.stats = {
            testsGenerated: 0,
            totalQuestions: 0,
            avgGenerationTime: 0,
            cacheHits: 0,
            errors: 0
        };
        this.saveStats();
    }
}

export default new AITestGenerator();
