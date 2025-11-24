import React, { useState, useEffect } from 'react';
import useGameEvent from '../hooks/useGameEvent';
import { EVENTS } from '../../shared/events';

const HUD = () => {
    const [activeQuest, setActiveQuest] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    useGameEvent(EVENTS.QUEST_START, ({ quest }) => {
        setActiveQuest(quest);
        setProgress({ current: 1, total: quest.milestones.length });
    });

    // This is a bit of a workaround since MILESTONE_COMPLETE doesn't carry payload
    // A better implementation would have the QuestManager manage state and emit a QUEST_PROGRESS event
    useEffect(() => {
        if (activeQuest) {
            const handleMilestoneComplete = () => {
                setProgress(prev => ({ ...prev, current: prev.current + 1 }));
            };
            
            // This relies on the fact that milestone complete is emitted *before* the quest is completed
            // and the activeQuest is cleared.
            const { MILESTONE_COMPLETE } = EVENTS;
            const eventHandler = () => handleMilestoneComplete();
            
            // We need a way to get the current milestone index from QuestManager,
            // but for now, we just increment.
            // This logic will get out of sync if loading from a save.
            // A proper state manager (like Redux/Zustand) or a more detailed event would be better.
        }
    }, [activeQuest]);


    useGameEvent(EVENTS.MILESTONE_COMPLETE, () => {
        if(activeQuest) {
             setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
    });


    useGameEvent(EVENTS.QUEST_COMPLETE, () => {
        setActiveQuest(null);
        setProgress({ current: 0, total: 0 });
    });

    if (!activeQuest) {
        return null;
    }

    return (
        <div className="hud-container">
            <div className="quest-tracker">
                <h3>{activeQuest.title}</h3>
                <p>Progress: {progress.current > progress.total ? progress.total : progress.current} / {progress.total}</p>
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar" 
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default HUD;
