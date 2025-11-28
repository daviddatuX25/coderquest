import React from 'react';

const QuizDisplay = ({
    quiz,
    answers,
    currentQuestion,
    onAnswerSelect,
    onSubmit,
    canSubmit
}) => {
    const question = quiz.questions[currentQuestion];

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h3>{quiz.title || 'Quiz'}</h3>
                <p className="question-count">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
            </div>

            {question && (
                <div className="question-display">
                    <div className="question-text">
                        <p>{question.questionText}</p>
                    </div>

                    <div className="options-list">
                        {question.options.map((option, index) => (
                            <label key={index} className="option-label">
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion}`}
                                    checked={answers[currentQuestion] === index}
                                    onChange={() => onAnswerSelect(currentQuestion, index)}
                                />
                                <span className="option-text">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="quiz-actions">
                <button
                    className="submit-button"
                    onClick={onSubmit}
                    disabled={!canSubmit}
                >
                    Submit Quiz
                </button>
            </div>

            <div className="progress-indicator">
                {quiz.questions.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === currentQuestion ? 'active' : ''} ${
                            answers[index] !== undefined ? 'answered' : ''
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuizDisplay;
