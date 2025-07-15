import React, { useEffect, useState } from "react";
import aiService from '../services/aiService';
import DataVisualization from './DataVisualization';
import './LearningModule.css';

function LearningModule({ subject, category, concept, onProgress }) {
    const [module, setModule] = useState(null);
    const [currentExercise, setCurrentExercise] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [aiHelp, setAiHelp] = useState(null);
    const [loadingAiHelp, setLoadingAiHelp] = useState(false);
    const [showAiHelp, setShowAiHelp] = useState(false);

    useEffect(() => {
        // Convert concept to file name (kebab-case)
        const fileName = concept.toLowerCase()
            .replace(/\s+/g, "-")      // Replace spaces with hyphens
            .replace(/[(),.]/g, "")    // Remove parentheses, commas, periods
            .replace(/-+/g, "-")       // Replace multiple hyphens with single
            .replace(/^-|-$/g, "")     // Remove leading/trailing hyphens
            + ".json";
        import(`../data/content/${fileName}`)
            .then((mod) => {
                setModule(mod);
                setCurrentExercise(0);
                setSelectedAnswers([]);
                setFeedback(null);
                setShowFeedback(false);
                setScore(0);
                setAttempts(0);
                setCompleted(false);
            })
            .catch(() => setModule(null));
    }, [concept]);

    if (!module) return <div className="loading">Loading module...</div>;

    // Check if exercises exist and are not empty
    const hasExercises = module.exercises && module.exercises.length > 0;
    const currentEx = hasExercises ? module.exercises[currentExercise] : null;
    const isMultipleChoice = currentEx ? currentEx.type === "multiple-choice" : false;
    const isSelectAll = currentEx ? currentEx.type === "select-all" : false;

    const handleAnswerSelect = (optionIndex) => {
        if (showFeedback) return;

        if (isSelectAll) {
            setSelectedAnswers(prev =>
                prev.includes(optionIndex)
                    ? prev.filter(i => i !== optionIndex)
                    : [...prev, optionIndex]
            );
        } else {
            setSelectedAnswers([optionIndex]);
        }
    };

    const submitAnswer = () => {
        setAttempts(prev => prev + 1);

        let isCorrect = false;
        let feedbackText = "";

        if (isSelectAll) {
            // For select-all questions, compare arrays
            const correctAnswers = currentEx.correct.sort();
            const userAnswers = selectedAnswers.sort();
            isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);

            if (isCorrect) {
                feedbackText = "Excellent! You selected all the correct answers.";
                setScore(prev => prev + 1);
            } else {
                feedbackText = `Not quite right. You selected: ${selectedAnswers.map(i => currentEx.options[i]).join(', ')}. The correct answers are: ${correctAnswers.map(i => currentEx.options[i]).join(', ')}.`;
            }
        } else {
            // For multiple choice, check if selected answer is correct
            isCorrect = currentEx.correct.includes(selectedAnswers[0]);
            feedbackText = currentEx.feedback[selectedAnswers[0]];

            if (isCorrect) {
                setScore(prev => prev + 1);
            }
        }

        setFeedback({ isCorrect, text: feedbackText });
        setShowFeedback(true);
    };

    const nextExercise = () => {
        if (!hasExercises) {
            // No exercises available, just mark as completed
            setCompleted(true);
            if (onProgress) {
                onProgress(subject, category, concept, 100); // Give full score for skill-based content
            }
            return;
        }

        if (currentExercise < module.exercises.length - 1) {
            setCurrentExercise(prev => prev + 1);
            setSelectedAnswers([]);
            setFeedback(null);
            setShowFeedback(false);
        } else {
            // All exercises completed
            const finalScore = Math.round((score / module.exercises.length) * 100);
            setCompleted(true);
            if (onProgress) {
                onProgress(subject, category, concept, finalScore);
            }
        }
    };

    const resetModule = () => {
        setCurrentExercise(0);
        setSelectedAnswers([]);
        setFeedback(null);
        setShowFeedback(false);
        setScore(0);
        setAttempts(0);
        setCompleted(false);
        setAiHelp(null);
        setShowAiHelp(false);
    };

    const getAiHelp = async () => {
        setLoadingAiHelp(true);
        try {
            const response = await aiService.explainConcept(concept, subject, category);
            if (response.success) {
                setAiHelp(response.message);
                setShowAiHelp(true);
            } else {
                setAiHelp('AI help is currently unavailable. Please check your AI settings.');
                setShowAiHelp(true);
            }
        } catch (error) {
            setAiHelp('AI help is currently unavailable. Please check your AI settings.');
            setShowAiHelp(true);
        }
        setLoadingAiHelp(false);
    };

    const getQuestionHelp = async () => {
        if (!currentEx) return;

        setLoadingAiHelp(true);
        try {
            const response = await aiService.helpWithQuestion(currentEx.question, subject, category, concept);
            if (response.success) {
                setAiHelp(response.message);
                setShowAiHelp(true);
            } else {
                setAiHelp('AI help is currently unavailable. Please check your AI settings.');
                setShowAiHelp(true);
            }
        } catch (error) {
            setAiHelp('AI help is currently unavailable. Please check your AI settings.');
            setShowAiHelp(true);
        }
        setLoadingAiHelp(false);
    };

    return (
        <div className="learning-module-container">
            <div className="module-header">
                <h2>{module.concept}</h2>
                {hasExercises && (
                    <div className="module-progress">
                        Exercise {currentExercise + 1} of {module.exercises.length}
                    </div>
                )}
                {!hasExercises && (
                    <div className="module-type">
                        {module.skillType ? `${module.skillType.charAt(0).toUpperCase() + module.skillType.slice(1)} Skill` : 'Learning Module'}
                    </div>
                )}
            </div>

            <div className="concept-section">
                <div className="concept-header">
                    <h3>📚 Understanding the Concept</h3>
                    <button
                        className="ai-help-btn"
                        onClick={getAiHelp}
                        disabled={loadingAiHelp}
                        title="Get AI explanation"
                    >
                        {loadingAiHelp ? '⏳' : '🤖'} AI Help
                    </button>
                </div>
                <p>{module.explanation}</p>

                {showAiHelp && aiHelp && (
                    <div className="ai-help-section">
                        <div className="ai-help-header">
                            <h4>🤖 AI Tutor Explanation</h4>
                            <button
                                className="close-help-btn"
                                onClick={() => setShowAiHelp(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="ai-help-content">
                            {aiHelp}
                        </div>
                    </div>
                )}
            </div>

            {module.questionFormations && (
                <div className="question-formations-section">
                    <h3>🎯 Question Types & Strategies</h3>
                    <p className="question-formations-description">{module.questionFormations.description}</p>
                    <div className="question-types-grid">
                        {module.questionFormations.types && module.questionFormations.types.map((type, index) => (
                            <div key={index} className="question-type-card">
                                <h4 className="question-type-title">{type.type}</h4>
                                <div className="question-type-examples">
                                    <strong>Examples:</strong>
                                    <ul>
                                        {type.examples && type.examples.map((example, exampleIndex) => (
                                            <li key={exampleIndex}>{example}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="question-type-strategy">
                                    <strong>Strategy:</strong> {type.strategy}
                                </div>
                            </div>
                        ))}
                    </div>
                    {module.questionFormations.examTips && (
                        <div className="exam-tips">
                            <h4>📝 Exam Tips</h4>
                            <ul>
                                {module.questionFormations.examTips.map((tip, tipIndex) => (
                                    <li key={tipIndex}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {module.examinerInsights && (
                <div className="examiner-insights-section">
                    <h3>🔍 Examiner's Perspective</h3>
                    <div className="examiner-insight-card">
                        <div className="insight-header">
                            <span className="insight-icon">🎓</span>
                            <h4>How Examiners Create Questions</h4>
                        </div>
                        <p className="insight-description">{module.examinerInsights.description}</p>

                        {module.examinerInsights.questionConstruction && (
                            <div className="question-construction">
                                <h5>Question Construction Patterns:</h5>
                                <div className="construction-grid">
                                    {module.examinerInsights.questionConstruction.map((pattern, index) => (
                                        <div key={index} className="construction-pattern">
                                            <div className="pattern-title">{pattern.pattern}</div>
                                            <div className="pattern-purpose">
                                                <strong>Purpose:</strong> {pattern.purpose}
                                            </div>
                                            <div className="pattern-example">
                                                <strong>Example:</strong> {pattern.example}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {module.examinerInsights.commonTraps && (
                            <div className="common-traps">
                                <h5>⚠️ Common Traps to Avoid:</h5>
                                <ul>
                                    {module.examinerInsights.commonTraps.map((trap, index) => (
                                        <li key={index} className="trap-item">
                                            <strong>{trap.trap}:</strong> {trap.explanation}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {module.examinerInsights.timeManagement && (
                            <div className="time-management">
                                <h5>⏱️ Time Management Strategy:</h5>
                                {Array.isArray(module.examinerInsights.timeManagement) ? (
                                    <div className="time-breakdown">
                                        {module.examinerInsights.timeManagement.map((phase, index) => (
                                            <div key={index} className="time-phase">
                                                <span className="time-allocation">{phase.timeAllocation}</span>
                                                <span className="phase-description">{phase.phase}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="time-management-content">
                                        {module.examinerInsights.timeManagement.quickWins && (
                                            <div className="quick-wins">
                                                <h6>⚡ Quick Wins:</h6>
                                                <ul>
                                                    {module.examinerInsights.timeManagement.quickWins.map((win, index) => (
                                                        <li key={index}>{win}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {module.examinerInsights.timeManagement.timeAllocation && (
                                            <div className="time-allocation">
                                                <h6>⏰ Time Allocation:</h6>
                                                <p>{module.examinerInsights.timeManagement.timeAllocation}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {module.examples && module.examples.length > 0 && (
                <div className="examples-section">
                    <h3>💡 Examples</h3>
                    {module.examples.map((example, index) => (
                        <div key={index} className="example-card">
                            {example.image && (
                                <div className="example-image">
                                    <img
                                        src={`/images/geometry/${example.image}`}
                                        alt={example.imageAlt || "Geometry diagram"}
                                        className="geometry-image"
                                    />
                                </div>
                            )}
                            {example.chart && (
                                <DataVisualization
                                    data={example.chart.data}
                                    type={example.chart.type}
                                    title={example.chart.title}
                                    xKey={example.chart.xKey}
                                    yKey={example.chart.yKey}
                                />
                            )}
                            <div className="example-question">
                                <strong>Question:</strong> {example.question}
                            </div>
                            <div className="example-solution">
                                <strong>Solution:</strong> {example.solution}
                            </div>
                            {example.explanation && (
                                <div className="example-explanation">
                                    <strong>Explanation:</strong> {example.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Skill-based content for English */}
            {module.keyTechniques && (
                <div className="key-techniques-section">
                    <h3>🛠️ Key Techniques</h3>
                    <div className="techniques-grid">
                        {module.keyTechniques && module.keyTechniques.map((technique, index) => (
                            <div key={index} className="technique-card">
                                <h4 className="technique-title">{technique.technique}</h4>
                                <p className="technique-description">{technique.description}</p>
                                <div className="technique-steps">
                                    <strong>Steps:</strong>
                                    <ol>
                                        {technique.steps && technique.steps.map((step, stepIndex) => (
                                            <li key={stepIndex}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                                <div className="practical-tip">
                                    <strong>💡 Practical Tip:</strong> {technique.practicalTip}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Exam strategies for skill-based learning */}
            {module.examStrategies && (
                <div className="exam-strategies-section">
                    <h3>🎯 Exam Strategies</h3>
                    <div className="exam-strategy-card">
                        <p className="strategy-description">{module.examStrategies.description}</p>

                        {module.examStrategies.timeManagement && (
                            <div className="time-management-skill">
                                <h5>⏱️ Time Management:</h5>
                                <div className="time-grid">
                                    {Object.entries(module.examStrategies.timeManagement).map(([phase, time]) => (
                                        <div key={phase} className="time-item">
                                            <span className="time-phase">{phase.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                            <span className="time-allocation">{time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {module.examStrategies.questionTypes && (
                            <div className="question-types-strategies">
                                <h5>Question Type Strategies:</h5>
                                {module.examStrategies.questionTypes.map((questionType, index) => (
                                    <div key={index} className="question-type-strategy">
                                        <h6>{questionType.type}</h6>
                                        <div className="strategy-approach">
                                            <strong>Approach:</strong> {questionType.approach}
                                        </div>
                                        <div className="strategy-example">
                                            <strong>Example:</strong> {questionType.example}
                                        </div>
                                        <div className="strategy-warning">
                                            <strong>⚠️ Avoid:</strong> {questionType.trickToAvoid}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Practical exercises for skills */}
            {module.practicalExercises && (
                <div className="practical-exercises-section">
                    <h3>📝 Practical Exercises</h3>
                    {module.practicalExercises && module.practicalExercises.map((exercise, index) => (
                        <div key={index} className="practical-exercise-card">
                            <h4>{exercise.title}</h4>
                            <p className="exercise-instruction">{exercise.instruction}</p>
                            {exercise.text && (
                                <div className="exercise-text">
                                    <em>"{exercise.text}"</em>
                                </div>
                            )}
                            <div className="exercise-questions">
                                <strong>Questions to consider:</strong>
                                <ul>
                                    {exercise.questions && exercise.questions.map((question, qIndex) => (
                                        <li key={qIndex}>{question}</li>
                                    ))}
                                </ul>
                            </div>
                            {exercise.modelAnswer && (
                                <details className="model-answer">
                                    <summary>Show Model Answer</summary>
                                    <div className="model-answer-content">
                                        {exercise.modelAnswer && Object.entries(exercise.modelAnswer).map(([key, value]) => (
                                            <div key={key} className="answer-part">
                                                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Skill progression indicators */}
            {module.skillProgression && (
                <div className="skill-progression-section">
                    <h3>📈 Skill Progression</h3>
                    <div className="progression-levels">
                        {Object.entries(module.skillProgression).map(([level, skills]) => (
                            <div key={level} className={`progression-level ${level}`}>
                                <h4>{level.charAt(0).toUpperCase() + level.slice(1)} Level</h4>
                                <ul>
                                    {skills.map((skill, index) => (
                                        <li key={index}>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Real world connections */}
            {module.realWorldConnections && (
                <div className="real-world-section">
                    <h3>🌍 Real-World Applications</h3>
                    <div className="connections-grid">
                        {module.realWorldConnections.map((connection, index) => (
                            <div key={index} className="connection-card">
                                {connection}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completion button for skill-based modules without exercises */}
            {!completed && !hasExercises && (
                <div className="skill-completion-section">
                    <div className="completion-prompt">
                        <h3>📚 Ready to complete this module?</h3>
                        <p>You've reviewed the key concepts, strategies, and techniques. Click below to mark this skill as mastered.</p>
                        <button
                            className="complete-skill-button"
                            onClick={nextExercise}
                        >
                            Mark Skill as Mastered ✅
                        </button>
                    </div>
                </div>
            )}

            {!completed && hasExercises && currentEx && (
                <div className="exercise-section">
                    <div className="exercise-header">
                        <h3>🎯 Practice Exercise</h3>
                        <button
                            className="ai-help-btn"
                            onClick={getQuestionHelp}
                            disabled={loadingAiHelp}
                            title="Get AI help with this question"
                        >
                            {loadingAiHelp ? '⏳' : '🤖'} Help with Question
                        </button>
                    </div>
                    <div className="exercise-card">
                        {currentEx.image && (
                            <div className="exercise-image">
                                <img
                                    src={`/images/geometry/${currentEx.image}`}
                                    alt={currentEx.imageAlt || "Geometry diagram"}
                                    className="geometry-image"
                                />
                            </div>
                        )}
                        {currentEx.chart && (
                            <DataVisualization
                                data={currentEx.chart.data}
                                type={currentEx.chart.type}
                                title={currentEx.chart.title}
                                xKey={currentEx.chart.xKey}
                                yKey={currentEx.chart.yKey}
                            />
                        )}
                        <div className="exercise-question">
                            {currentEx.question}
                        </div>

                        {isSelectAll && (
                            <div className="instruction">
                                Select all correct answers:
                            </div>
                        )}

                        <div className="options-container">
                            {currentEx.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option-button ${selectedAnswers.includes(index) ? 'selected' : ''
                                        } ${showFeedback && currentEx.correct.includes(index) ? 'correct' : ''
                                        } ${showFeedback && selectedAnswers.includes(index) && !currentEx.correct.includes(index) ? 'incorrect' : ''
                                        }`}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showFeedback}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {selectedAnswers.length > 0 && !showFeedback && (
                            <button
                                className="submit-button"
                                onClick={submitAnswer}
                            >
                                Submit Answer
                            </button>
                        )}

                        {showFeedback && (
                            <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="feedback-icon">
                                    {feedback.isCorrect ? '✅' : '❌'}
                                </div>
                                <div className="feedback-text">
                                    {feedback.text}
                                </div>
                                <button
                                    className="next-button"
                                    onClick={nextExercise}
                                >
                                    {currentExercise < module.exercises.length - 1 ? 'Next Exercise' : 'Complete Module'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {completed && (
                <div className="completion-section">
                    <div className="completion-card">
                        <h3>🎉 Module Complete!</h3>
                        {hasExercises ? (
                            <div className="score-display">
                                <div className="score-circle">
                                    {Math.round((score / module.exercises.length) * 100)}%
                                </div>
                                <div className="score-details">
                                    <p>You got {score} out of {module.exercises.length} questions correct!</p>
                                    <p>Total attempts: {attempts}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="skill-completion">
                                <div className="completion-icon">✅</div>
                                <p>You've successfully completed this {module.skillType || 'learning'} module!</p>
                                <p>Key concepts and strategies have been covered.</p>
                            </div>
                        )}
                        <button
                            className="retry-button"
                            onClick={resetModule}
                        >
                            {hasExercises ? 'Try Again' : 'Review Module'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LearningModule;
