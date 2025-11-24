import PhaserGame from './components/PhaserGame';
import DialogBox from './components/DialogBox';
import LessonViewer from './components/LessonViewer';
import QuizInterface from './components/QuizInterface';
import HUD from './components/HUD';
import './App.scss'

function App() {
  return (
    <div id="game-container">
      <PhaserGame />
      <DialogBox />
      <LessonViewer />
      <QuizInterface />
      <HUD />
    </div>
  )
}

export default App
