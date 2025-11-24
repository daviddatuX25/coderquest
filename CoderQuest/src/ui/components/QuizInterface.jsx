import React, { useState } from 'react';
import useGameEvent from '../hooks/useGameEvent';
import { EVENTS } from '../../shared/events';
import EventBus from '../../shared/EventBus';

const QuizInterface = () => {
    const [quiz, setQuiz] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [result, setResult] = useState(null);

    useGameEvent(EVENTS.QUIZ_SHOW, ({ milestone }) => {
        setQuiz(milestone);
        setIsVisible(true);
        setSelectedAnswers({});
        setResult(null);
    });

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    };

    const handleSubmit = () => {
        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctIndex) {
                score++;
            }
        });

        const passed = score >= quiz.passingScore;
        setResult({ score, passed, message: passed ? quiz.completionMessage : 'You did not pass. Please try again later.' });
    };

    const handleContinue = () => {
        if (result && result.passed) {
            EventBus.emit(EVENTS.MILESTONE_COMPLETE, { score: result.score, passed: true });
        }
        // For now, we allow continuing even on failure.
        // A more robust implementation might require a retry.
        setIsVisible(false);
        setQuiz(null);
        setResult(null);
    };

    if (!isVisible || !quiz) {
        return null;
    }

    return (
        <div className="quiz-overlay">
            <div className="quiz-interface">
                <h2>{quiz.title}</h2>

                {!result ? (
                    <>
                        <div className="questions-container">
                            {quiz.questions.map((question, qIndex) => (
                                <div key={qIndex} className="question-block">
                                    <p className="question-text">{qIndex + 1}. {question.questionText}</p>
                                    <div className="options-container">
                                        {question.options.map((option, oIndex) => (
                                            <button
                                                key={oIndex}
                                                className={`option-button ${selectedAnswers[qIndex] === oIndex ? 'selected' : ''}`}
                                                onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="quiz-actions">
                            <button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}>
                                Submit
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="quiz-result">
                        <h3>{result.passed ? 'Congratulations!' : 'Review Needed'}</h3>
                        <p>{result.message}</p>
                        <p>Your score: {result.score} / {quiz.questions.length}</p>
                        <div className="quiz-actions">
                            <button onClick={handleContinue}>Continue</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizInterface;
