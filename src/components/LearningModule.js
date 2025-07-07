import React, { useEffect, useState } from "react";
import aiService from '../services/aiService';
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

    const currentEx = module.exercises[currentExercise];
    const isMultipleChoice = currentEx.type === "multiple-choice";
    const isSelectAll = currentEx.type === "select-all";

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
                <div className="module-progress">
                    Exercise {currentExercise + 1} of {module.exercises.length}
                </div>
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

            {!completed && (
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
                        <div className="score-display">
                            <div className="score-circle">
                                {Math.round((score / module.exercises.length) * 100)}%
                            </div>
                            <div className="score-details">
                                <p>You got {score} out of {module.exercises.length} questions correct!</p>
                                <p>Total attempts: {attempts}</p>
                            </div>
                        </div>
                        <button
                            className="retry-button"
                            onClick={resetModule}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LearningModule;
