import React, { useState } from 'react';
import useGameEvent from '../hooks/useGameEvent';
import { EVENTS } from '../../shared/events';
import EventBus from '../../shared/EventBus';

const LessonViewer = () => {
    const [lesson, setLesson] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useGameEvent(EVENTS.LESSON_SHOW, ({ milestone }) => {
        setLesson(milestone);
        setIsVisible(true);
    });

    const handleContinue = () => {
        setIsVisible(false);
        setLesson(null);
        EventBus.emit(EVENTS.MILESTONE_COMPLETE);
    };

    if (!isVisible || !lesson) {
        return null;
    }

    return (
        <div className="lesson-overlay">
            <div className="lesson-viewer">
                <h2>{lesson.title}</h2>
                <div 
                    className="lesson-content" 
                    dangerouslySetInnerHTML={{ __html: lesson.content }} 
                />
                <div className="lesson-actions">
                    <button onClick={handleContinue}>Continue</button>
                </div>
            </div>
        </div>
    );
};

export default LessonViewer;
