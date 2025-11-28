import React, { useEffect, useState } from 'react';
import EventBus from '../../shared/EventBus';
import { EVENTS } from '../../shared/events';
import LessonSidebar from './LessonSidebar';
import LessonFooter from './LessonFooter';
import LessonHeader from './LessonHeader';
import LessonContent from './LessonContent';
import '../styles/lesson-mode.scss';

const LessonMode = ({ questData, onClose }) => {
    const [currentSegment, setCurrentSegment] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        EventBus.emit(EVENTS.GAME_PAUSE);
        
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        // Check if mobile on mount and listen to resize
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('keydown', handleKeyDown);
            EventBus.emit(EVENTS.GAME_RESUME);
        };
    }, []);

    useEffect(() => {
        // Reset to first segment when new quest data arrives
        setCurrentSegment(0);
    }, [questData]);

    const handleClose = () => {
        EventBus.emit(EVENTS.GAME_RESUME);
        onClose();
    };

    const handleSegmentClick = (index) => {
        setCurrentSegment(index);
    };

    if (!questData) {
        return (
            <div className="lesson-mode">
                <div className="lesson-container">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`lesson-mode ${isMobile ? 'mobile' : 'desktop'}`}>
            <LessonHeader 
                title={questData.title} 
                totalSegments={questData.segments?.length || 1}
                currentSegment={currentSegment}
                onClose={handleClose}
            />
            
            <div className="lesson-container">
                {!isMobile && (
                    <LessonSidebar 
                        segments={questData.segments || []}
                        currentSegment={currentSegment}
                        onSegmentClick={handleSegmentClick}
                        npcName={questData.npcName}
                        npcPortrait={questData.npcPortrait}
                    />
                )}
                
                <LessonContent
                    segment={questData.segments?.[currentSegment]}
                    questId={questId}
                    currentSegment={currentSegment}
                    totalSegments={questData.segments?.length || 1}
                    onNext={() => {
                        if (currentSegment < (questData.segments?.length || 1) - 1) {
                            setCurrentSegment(currentSegment + 1);
                        } else {
                            handleClose();
                        }
                    }}
                    onPrevious={() => {
                        if (currentSegment > 0) {
                            setCurrentSegment(currentSegment - 1);
                        }
                    }}
                />
            </div>

            {isMobile && (
                <LessonFooter 
                    segments={questData.segments || []}
                    currentSegment={currentSegment}
                    onSegmentClick={handleSegmentClick}
                    npcName={questData.npcName}
                    npcPortrait={questData.npcPortrait}
                />
            )}
        </div>
    );
};

export default LessonMode;
