import React from 'react';

const LessonFooter = ({
    segments,
    currentSegment,
    onSegmentClick,
    npcName,
    npcPortrait
}) => {
    if (!segments || segments.length === 0) {
        return null;
    }

    return (
        <div className="lesson-footer">
            <div className="npc-info">
                <img 
                    src={npcPortrait} 
                    alt={npcName}
                    className="npc-portrait-small"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <span className="npc-name">{npcName}</span>
            </div>
            
            <div className="segments-scroll">
                <div className="segments-list">
                    {segments.map((segment, index) => (
                        <button
                            key={index}
                            className={`segment-chip ${currentSegment === index ? 'active' : ''}`}
                            onClick={() => onSegmentClick(index)}
                            title={segment.title}
                        >
                            <span className="segment-number">{index + 1}</span>
                            <span className="segment-title-short">{segment.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LessonFooter;
