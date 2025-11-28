import React from 'react';

const LessonSidebar = ({ segments, currentSegment, onSegmentClick, npcName, npcPortrait }) => {
    return (
        <aside className="lesson-sidebar">
            <div className="sidebar-header">
                {npcPortrait && (
                    <img src={npcPortrait} alt={npcName} className="npc-avatar" />
                )}
                <h3>{npcName || 'NPC'}</h3>
            </div>

            <nav className="segments-navigator">
                <div className="segments-list">
                    {segments && segments.map((segment, index) => (
                        <div
                            key={index}
                            className={`segment-item ${index === currentSegment ? 'active' : ''} ${
                                index < currentSegment ? 'completed' : ''
                            }`}
                            onClick={() => onSegmentClick(index)}
                        >
                            <div className="segment-indicator">
                                {index < currentSegment ? '✓' : index + 1}
                            </div>
                            <div className="segment-title">{segment.title || `Segment ${index + 1}`}</div>
                        </div>
                    ))}
                </div>
            </nav>
        </aside>
    );
};

export default LessonSidebar;
