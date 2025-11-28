import React, { useState, useEffect } from 'react';
import PhaserGame from './components/PhaserGame';
import DialogBox from './components/DialogBox';
import LessonViewer from './components/LessonViewer';
import QuizInterface from './components/QuizInterface';
import LessonMode from './components/LessonMode';
import HUD from './components/HUD';
import EventBus from '../shared/EventBus';
import './App.scss'

function App() {
  const [showLessonMode, setShowLessonMode] = useState(false);
  const [lessonQuestData, setLessonQuestData] = useState(null);
  const [questManager, setQuestManager] = useState(null);

  useEffect(() => {
    const handleQuestShowLesson = (data) => {
      // Get the full quest data from QuestManager if available
      if (window.questManager && window.questManager.activeQuest) {
        setLessonQuestData(window.questManager.activeQuest);
      } else if (data.questData) {
        setLessonQuestData(data.questData);
      }
      setShowLessonMode(true);
    };

    EventBus.on('quest:show-lesson', handleQuestShowLesson);
    
    return () => {
      EventBus.off('quest:show-lesson', handleQuestShowLesson);
    };
  }, []);

  const handleLessonClose = () => {
    setShowLessonMode(false);
    setLessonQuestData(null);
  };

  return (
    <div id="game-container">
      <PhaserGame onQuestManagerReady={setQuestManager} />
      <DialogBox />
      <LessonViewer />
      <QuizInterface />
      <HUD />
      {showLessonMode && (
        <LessonMode 
          questData={lessonQuestData} 
          onClose={handleLessonClose}
        />
      )}
    </div>
  )
}

export default App
