import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import QuizDisplay from './QuizDisplay';

const LessonContent = ({
    segment,
    questId,
    currentSegment,
    totalSegments,
    onNext,
    onPrevious
}) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(null);

    useEffect(() => {
        setCurrentQuestion(0);
        setAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
    }, [segment]);

    if (!segment) {
        return <div className="lesson-content">Loading...</div>;
    }

    // Handle both quiz format: segment.quiz.questions or segment.questions
    const quizData = segment.quiz || (segment.questions ? { questions: segment.questions, passingScore: segment.passingScore || 1 } : null);
    const hasQuiz = quizData && quizData.questions && quizData.questions.length > 0;
    const isLastSegment = currentSegment === totalSegments - 1;

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    };

    const handleQuizSubmit = () => {
        let score = 0;
        quizData.questions.forEach((question, index) => {
            if (answers[index] === question.correctIndex) {
                score++;
            }
        });
        setQuizScore(score);
        setQuizSubmitted(true);
    };

    const handleNextSegment = () => {
        if (hasQuiz && !quizSubmitted) {
            alert('Please complete the quiz first!');
            return;
        }
        onNext();
    };

    return (
        <main className="lesson-content">
            {segment.content && !hasQuiz && (
                <div className="content-section">
                    <div
                        className="segment-text"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(segment.content)
                        }}
                    />
                </div>
            )}

            {hasQuiz && (
                <div className="quiz-section">
                    {!quizSubmitted ? (
                        <QuizDisplay
                            quiz={quizData}
                            answers={answers}
                            currentQuestion={currentQuestion}
                            onAnswerSelect={handleAnswerSelect}
                            onSubmit={handleQuizSubmit}
                            canSubmit={Object.keys(answers).length === quizData.questions.length}
                        />
                    ) : (
                        <div className="quiz-result">
                            <h3>
                                {quizScore >= (quizData.passingScore || 0)
                                    ? '✓ Quiz Passed!'
                                    : '✗ Quiz Not Passed'}
                            </h3>
                            <p>
                                Score: {quizScore} / {quizData.questions.length}
                            </p>
                            {quizData.passingScore && (
                                <p>
                                    Passing Score: {quizData.passingScore} / {quizData.questions.length}
                                </p>
                            )}
                            <p className="result-message">
                                {quizScore >= (quizData.passingScore || quizData.questions.length)
                                    ? quizData.completionMessage || 'Great job!'
                                    : 'Please review the material and try again.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="lesson-controls">
                <button
                    className="control-button"
                    onClick={onPrevious}
                    disabled={currentSegment === 0}
                >
                    ← Previous
                </button>

                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentSegment + 1) / totalSegments) * 100}%` }} />
                </div>

                <button
                    className="control-button primary"
                    onClick={handleNextSegment}
                    disabled={quizSubmitted && quizScore < (quizData?.passingScore || 0) && hasQuiz}
                >
                    {isLastSegment ? 'Finish' : 'Next →'}
                </button>
            </div>
        </main>
    );
};

export default LessonContent;
