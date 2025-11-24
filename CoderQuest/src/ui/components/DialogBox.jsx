import React, { useState, useEffect } from 'react';
import useGameEvent from '../hooks/useGameEvent';
import EventBus from '../../shared/EventBus';
import { EVENTS } from '../../shared/events';

function DialogBox() {
    const [dialog, setDialog] = useState(null);
    const [currentNode, setCurrentNode] = useState('start');
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [npcName, setNpcName] = useState('');
    const [npcPortrait, setNpcPortrait] = useState('');

    useGameEvent(EVENTS.DIALOG_SHOW, async (data) => {
        // Fetch dialog data
        const dialogPath = `/content/dialogs/${data.dialogId}.json`;
        try {
            const response = await fetch(dialogPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} from ${dialogPath}`);
            }
            const dialogData = await response.json();

            setDialog(dialogData);
            setNpcName(data.npcName || 'NPC'); // Default to 'NPC' if not provided
            setNpcPortrait(data.npcPortrait || `/assets/portraits/${data.npcId || 'default'}.png`); // Default portrait
            setCurrentNode('start');
            startTypingEffect(dialogData.dialogTree.start.text);
        } catch (error) {
            console.error('Failed to load dialog:', error);
            // Optionally emit an error event or close the dialog
            closeDialog();
        }
    });

    const startTypingEffect = (text) => {
        setIsTyping(true);
        setDisplayText('');

        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayText(prev => prev + text[index]);
                index++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 30); // 30ms per character
    };

    const handleChoice = (choice) => {
        if (isTyping) { // Skip typing if still in progress
            skipTyping();
            return;
        }

        if (choice.next === 'end') {
            closeDialog();
        } else {
            const nextNode = dialog.dialogTree[choice.next];
            if (nextNode) {
                setCurrentNode(choice.next);
                startTypingEffect(nextNode.text);
            } else {
                console.warn(`Dialog node '${choice.next}' not found.`);
                closeDialog();
            }
        }
    };

    const closeDialog = () => {
        setDialog(null);
        EventBus.emit(EVENTS.GAME_RESUME);
        EventBus.emit(EVENTS.DIALOG_CLOSE, { npcId: dialog ? dialog.npcId : null, selectedChoice: currentNode });
    };

    const skipTyping = () => {
        if (isTyping && dialog) {
            const node = dialog.dialogTree[currentNode];
            setDisplayText(node.text);
            setIsTyping(false);
        }
    };

    // Keyboard navigation for choices
    useEffect(() => {
        if (!dialog || isTyping) return;

        const handleKeyDown = (e) => {
            const node = dialog.dialogTree[currentNode];
            if (!node || !node.choices) return;

            if (e.key === 'Escape') {
                closeDialog();
            } else if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (node.choices[index]) {
                    handleChoice(node.choices[index]);
                }
            }
            // Allow spacebar to skip typing or advance dialog if no choices
            if (e.key === ' ' && !node.choices.length) {
                handleChoice({ next: 'end' }); // Simulate ending dialog
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dialog, currentNode, isTyping, handleChoice, closeDialog]);


    if (!dialog) return null;

    const node = dialog.dialogTree[currentNode];
    if (!node) {
        console.error(`Current dialog node '${currentNode}' not found in dialogTree.`);
        return null;
    }

    return (
        <div className="dialog-overlay" onClick={skipTyping}>
            <div className="dialog-box">
                <div className="dialog-header">
                    {npcPortrait && <img
                        src={npcPortrait}
                        alt={npcName}
                        className="npc-portrait"
                    />}
                    <h3>{npcName}</h3>
                </div>

                <div className="dialog-text">
                    {displayText}
                    {isTyping && <span className="cursor">▼</span>}
                </div>

                {!isTyping && node.choices && node.choices.length > 0 && (
                    <div className="dialog-choices">
                        {node.choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => handleChoice(choice)}
                                className="choice-button"
                            >
                                {choice.text}
                            </button>
                        ))}
                    </div>
                )}
                {!isTyping && (!node.choices || node.choices.length === 0) && (
                    <div className="dialog-actions">
                        <button onClick={() => handleChoice({ next: 'end' })} className="choice-button">
                            (End Conversation)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DialogBox;
