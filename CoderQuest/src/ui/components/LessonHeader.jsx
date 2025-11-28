import React from 'react';

const LessonHeader = ({ title, totalSegments, currentSegment, onClose }) => {
    return (
        <header className="lesson-header">
            <div className="header-content">
                <h1>{title}</h1>
                <div className="progress-info">
                    {currentSegment + 1} / {totalSegments} complete
                </div>
            </div>
            <button className="close-button" onClick={onClose} title="Close (Esc)">
                ✕
            </button>
        </header>
    );
};

export default LessonHeader;
