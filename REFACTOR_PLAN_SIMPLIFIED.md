# CoderQuest Simplified Refactor Plan

**Last Updated:** November 27, 2025  
**Status:** ~60-65% Complete (Core systems built, UI/Mobile/Content still pending)  
**Estimated Total Effort:** 15–20 more hours  
**Target:** Two complementary modes with clean separation and responsive design

---

## Vision: Two Complementary Modes

### Game Mode (Current Phaser-based)
- 2D world exploration with WASD/arrow keys
- NPC interactions via portals
- Auto-saves progress
- Camera follows player
- Quest progression visible in-game

### Lesson Mode (New HTML/SCSS-based)
- Full-page immersive UI (not a modal)
- Sidebar navigator showing quest segments + NPC avatar
- One-question-at-a-time quiz format
- Glassmorphic design with smooth animations
- Responsive: sidebar desktop, footer mobile
- Pauses game while active
- Keyboard navigation (1-9, spacebar, Esc)

---

## Phase 1: Foundation & Responsive Game Mode

### 1.1 Install Dependencies
**File(s):** Project root  
**Action:** Install DOMPurify for HTML sanitization
```bash
npm install dompurify
```
**Effort:** 5 minutes  
**Status:** ✅ DONE (already in package.json v3.3.0)

---

### 1.2 Update Phaser Config for Responsive Design
**File:** `CoderQuest/src/game/config.js`

**Changes:**
- Add `parent: 'phaser-game-container'` to link Phaser to React container
- Add `scale` config:
  ```javascript
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    orientation: Phaser.Scale.Orientation.PORTRAIT_OR_LANDSCAPE,
    min: { width: 320, height: 240 },
    max: { width: 1920, height: 1080 }
  }
  ```
- Keep `width: 800, height: 600` as design resolution

**Symbol to update:** `gameConfig` export

**Effort:** 1–2 hours  
**Status:** ✅ DONE (config.js has all scale settings)

**Validation:**
- [x] Phaser config has parent and scale manager
- [x] Canvas initializes without errors

---

### 1.3 Add Viewport Meta Tag & CSS Container
**File(s):** `CoderQuest/index.html` and `CoderQuest/src/ui/App.scss`

**Changes:**
- Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Add CSS for `#phaser-game-container`:
  ```scss
  #phaser-game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    background: #0d1b2a;
  }
  ```

**Effort:** 30 minutes  
**Status:** ✅ DONE (viewport in index.html, CSS in App.scss)

**Validation:**
- [x] Container is centered on desktop, tablet, mobile
- [x] No unwanted scrollbars

---

### 1.4 Implement Responsive Camera in GameScene
**File:** `CoderQuest/src/game/scenes/GameScene.js`

**Changes:**
- Add `centerMap()` method that computes zoom by breakpoint:
  ```javascript
  centerMap() {
    const width = this.scale.gameSize.width;
    const map = this.tilemap;
    
    let baseZoom = 2; // Desktop default
    if (width < 768) baseZoom = 1;      // Mobile
    else if (width < 1200) baseZoom = 1.5; // Tablet
    
    const maxZoomX = this.scale.gameSize.width / map.widthInPixels;
    const maxZoomY = this.scale.gameSize.height / map.heightInPixels;
    const zoom = Math.min(baseZoom, maxZoomX, maxZoomY);
    
    this.cameras.main.setZoom(zoom);
  }
  ```
- Call `this.centerMap()` in `create()` after camera setup
- Add resize listener in `create()`:
  ```javascript
  this.scale.on('resize', () => this.centerMap());
  ```

**Symbols to update:** `create()`, add `centerMap()`

**Effort:** 3–5 hours  
**Status:** ❌ NOT STARTED (no zoom breakpoints; needs centerMap() method)

**Validation:**
- [ ] Camera zoom = 2 on desktop (1200+px)
- [ ] Camera zoom = 1.5 on tablet (768–1199px)
- [ ] Camera zoom = 1 on mobile (<768px)
- [ ] Resize works smoothly

---

## Phase 2: Game Pause/Resume System

### 2.1 Add isPaused State & Event Listeners
**File:** `CoderQuest/src/game/scenes/GameScene.js`

**Changes:**
- In `init()` or constructor: `this.isPaused = false`
- In `create()`, add listeners:
  ```javascript
  EventBus.on('game:pause', () => {
    this.isPaused = true;
    this.physics.pause();
    this.input.enabled = false;
  });
  
  EventBus.on('game:resume', () => {
    this.isPaused = false;
    this.physics.resume();
    this.input.enabled = true;
  });
  ```

**Symbols to update:** `init()`, `create()`

**Effort:** 1 hour  
**Status:** ✅ DONE (GameScene.js lines 171-182)

**Validation:**
- [x] Event listeners registered without errors
- [x] Game doesn't crash on pause/resume events

---

### 2.2 Update DialogBox to Emit Pause Events
**File:** `CoderQuest/src/ui/components/DialogBox.jsx`

**Changes:**
- Add to `useEffect`:
  ```javascript
  useEffect(() => {
    EventBus.emit('game:pause');
    return () => EventBus.emit('game:resume');
  }, []);
  ```

**Effort:** 15 minutes  
**Status:** ✅ DONE (DialogBox.jsx emits GAME_PAUSE on show, GAME_RESUME on close)

**Validation:**
- [x] Dialog emits pause on mount
- [x] Dialog emits resume on unmount

---

### 2.3 Update LessonViewer & QuizInterface Same Way
**File(s):** `CoderQuest/src/ui/components/LessonViewer.jsx`, `QuizInterface.jsx`

**Changes:** Same pause/resume emission as DialogBox

**Effort:** 30 minutes  
**Status:** ⚠️ PARTIAL (LessonMode.jsx has this; LessonViewer/QuizInterface need verification)

**Validation:**
- [x] LessonMode emits pause/resume (verified)
- [ ] LessonViewer emits pause/resume (needs check)
- [ ] QuizInterface emits pause/resume (needs check)

---

## Phase 3: Input Debouncing & Security

### 3.1 Add Interaction Cooldown
**File:** `CoderQuest/src/game/scenes/GameScene.js`

**Changes:**
- In `init()`: `this.interactionCooldown = 0`
- In `update()`:
  ```javascript
  if (this.interactionCooldown > 0) {
    this.interactionCooldown -= delta;
  }
  ```
- In `handleInteractions()` (wherever interactions are processed):
  ```javascript
  if (this.interactionCooldown > 0) return;
  // ... interaction logic ...
  this.interactionCooldown = 200; // 200ms cooldown
  ```

**Effort:** 1 hour  
**Status:** ☐ Not started

**Validation:**
- [ ] Rapid key presses don't trigger multiple interactions
- [ ] Single interactions still work normally

---

### 3.2 Add DOMPurify HTML Sanitization
**File(s):** `CoderQuest/src/ui/components/DialogBox.jsx`, `LessonViewer.jsx`, `QuizInterface.jsx`

**Changes:**
- Import: `import DOMPurify from 'dompurify';`
- Wrap `dangerouslySetInnerHTML` calls:
  ```javascript
  const sanitizedHtml = DOMPurify.sanitize(contentHtml);
  <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
  ```

**Effort:** 1–1.5 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] DOMPurify imported in all components
- [ ] Content renders correctly after sanitization
- [ ] No security warnings in console

---

## Phase 4: Quiz State Persistence

### 4.1 Extend SaveManager for Quiz State
**File:** `CoderQuest/src/game/managers/SaveManager.js`

**Changes:**
- Update `saveData` object to include:
  ```javascript
  activeQuizState: {
    questId: this.scene.questManager?.activeQuest?.id || null,
    currentQuestionIndex: 0,
    answers: [],
    timestamp: Date.now()
  }
  ```
- In `saveGame()`: capture quiz state before saving
- In `loadGame()`: restore quiz state and emit event

**Symbols to update:** `saveGame()`, `loadGame()`

**Effort:** 2–3 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] Quiz answers saved to localStorage
- [ ] Quiz state restored on page reload
- [ ] No console errors on load

---

### 4.2 Implement Save Data Version Migration
**File:** `CoderQuest/src/game/managers/SaveManager.js`

**Changes:**
- Add method:
  ```javascript
  migrate(data, fromVersion, toVersion) {
    if (fromVersion === 0 && toVersion === 1) {
      return { ...data, activeQuizState: null };
    }
    return data;
  }
  ```
- In `loadGame()`:
  ```javascript
  if (data.version < CURRENT_VERSION) {
    data = this.migrate(data, data.version, CURRENT_VERSION);
  }
  ```

**Effort:** 1–1.5 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] Old saves are migrated without error
- [ ] New fields added with defaults

---

## Phase 5: Create Lesson Mode UI

### 5.1 Create LessonMode Container Component
**File:** `CoderQuest/src/ui/components/LessonMode.jsx` (new file)

**Changes:**
- Create React component that wraps lesson/quiz in a full-page layout
- Structure:
  ```
  LessonMode
  ├── LessonHeader (title, close button)
  ├── LessonContainer
  │   ├── LessonSidebar (desktop only)
  │   │   ├── Quest segments navigator
  │   │   └── NPC avatar
  │   └── LessonContent
  │       ├── LessonViewer OR QuizInterface
  │       └── ControlButtons
  └── LessonFooter (mobile only)
  ```
- Props: `questId`, `onClose`
- Emit `game:pause` on mount, `game:resume` on unmount

**Effort:** 3–4 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] Component renders full-page layout
- [ ] Sidebar visible on desktop
- [ ] Footer visible on mobile
- [ ] Game pauses when LessonMode opens

---

### 5.2 Create LessonSidebar Component
**File:** `CoderQuest/src/ui/components/LessonSidebar.jsx` (new file)

**Changes:**
- Display quest segments with progress indicators
- Show current milestone (highlighted)
- Display NPC avatar/name
- Responsive: hide on mobile, show on desktop

**Effort:** 2 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] Segments display correctly
- [ ] Current segment highlighted
- [ ] NPC avatar displays

---

### 5.3 Create LessonHeader & Controls
**File:** `CoderQuest/src/ui/components/LessonHeader.jsx` (new file)

**Changes:**
- Display quest title
- Show progress (e.g., "2/5 complete")
- Close button (Esc key + button click)
- Optional: Settings/help button

**Effort:** 1.5 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] Header displays quest info
- [ ] Close button works
- [ ] Esc key triggers close

---

### 5.4 Add Lesson Mode Styles (SCSS)
**File:** `CoderQuest/src/ui/styles/lesson-mode.scss` (new file)

**Changes:**
- Glassmorphic design (blurred background, glass effect)
- Dark theme: `#0b1220` background, `#2d5a4d` accents
- Smooth animations and transitions
- Responsive breakpoints: desktop (sidebar), mobile (footer)
- Example structure:
  ```scss
  .lesson-mode {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(11, 18, 32, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    z-index: 1000;
    
    @media (max-width: 768px) {
      flex-direction: column;
      
      .lesson-sidebar { display: none; }
      .lesson-footer { display: flex; }
    }
  }
  ```

**Effort:** 2–3 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] Styles compile without errors
- [ ] Responsive breakpoints work
- [ ] Glassmorphic effect visible

---

## Phase 6: Integrate Lesson Mode into App

### 6.1 Add Lesson Mode State to App
**File:** `CoderQuest/src/ui/App.jsx`

**Changes:**
- Add state: `const [showLessonMode, setShowLessonMode] = useState(false);`
- Add state: `const [lessonQuestId, setLessonQuestId] = useState(null);`
- Listen for quest events to show Lesson Mode:
  ```javascript
  useEffect(() => {
    EventBus.on('quest:show-lesson', (data) => {
      setLessonQuestId(data.questId);
      setShowLessonMode(true);
    });
  }, []);
  ```

**Effort:** 1 hour  
**Status:** ☐ Not started

**Validation:**
- [ ] State variables initialize correctly
- [ ] Event listeners registered

---

### 6.2 Render Lesson Mode Conditionally
**File:** `CoderQuest/src/ui/App.jsx`

**Changes:**
- In render, add:
  ```javascript
  {showLessonMode && (
    <LessonMode
      questId={lessonQuestId}
      onClose={() => setShowLessonMode(false)}
    />
  )}
  ```

**Effort:** 30 minutes  
**Status:** ☐ Not started

**Validation:**
- [ ] LessonMode appears when triggered
- [ ] LessonMode closes on button click

---

### 6.3 Update QuestManager to Emit Lesson Events
**File:** `CoderQuest/src/game/managers/QuestManager.js`

**Changes:**
- When a quest with lesson is started, emit:
  ```javascript
  EventBus.emit('quest:show-lesson', { questId: this.activeQuest.id });
  ```
- Keep existing logic; just add event emission

**Effort:** 30 minutes  
**Status:** ☐ Not started

**Validation:**
- [ ] Event emitted when quest with lesson starts
- [ ] Lesson Mode appears in UI

---

## Phase 7: NPC Enhancements (Optional Polish)

### 7.1 Add NPC Idle Animation Loop
**File:** `CoderQuest/src/game/scenes/GameScene.js`

**Changes:**
- In `create()`, when creating NPCs, add idle animation:
  ```javascript
  this.anims.create({
    key: 'npc-idle',
    frames: this.anims.generateFrameNumbers('npc-sprite', { start: 0, end: 3 }),
    frameRate: 6,
    repeat: -1
  });
  npc.play('npc-idle');
  ```

**Effort:** 1–2 hours  
**Status:** ☐ Not started

**Validation:**
- [ ] NPCs have idle animation
- [ ] Animation loops smoothly

---

### 7.2 Optional: NPC Walking Pattern
**File:** `CoderQuest/src/game/scenes/GameScene.js`

**Changes (if desired):**
- Add simple patrol pattern: NPCs walk between two points
- Example:
  ```javascript
  npc.patrol = { x1: 100, x2: 200, speed: 40, direction: 1 };
  // In update(): move NPC along patrol path
  ```

**Effort:** 2–3 hours (optional)  
**Status:** ☐ Not started

**Note:** Keep this simple — just horizontal/vertical back-and-forth

---

## Phase 8: Testing & Validation

### 8.1 Manual QA: Responsive Game Mode
**Desktop (1200+px):**
- [ ] Game starts, map centered
- [ ] Camera zoom = 2
- [ ] Window resize works smoothly
- [ ] No jank or stuttering

**Tablet (768–1199px):**
- [ ] Game starts, map centered
- [ ] Camera zoom = 1.5
- [ ] UI overlays don't obscure game

**Mobile (<768px):**
- [ ] Game starts, map centered
- [ ] Camera zoom = 1
- [ ] No horizontal overflow
- [ ] Portrait/landscape both work

**Effort:** 2–3 hours  
**Status:** ☐ Not started

---

### 8.2 Manual QA: Game Pause/Resume
- [ ] Open dialog → game pauses
- [ ] Close dialog → game resumes
- [ ] Open lesson → game pauses
- [ ] Close lesson → game resumes
- [ ] Rapid interactions don't create multiple dialogs

**Effort:** 1 hour  
**Status:** ☐ Not started

---

### 8.3 Manual QA: Lesson Mode
- [ ] Lesson Mode displays full-screen
- [ ] Sidebar visible on desktop
- [ ] Footer visible on mobile
- [ ] Segments navigator works
- [ ] Quiz displays one question at a time
- [ ] Answers save
- [ ] Close button (Esc, button) works

**Effort:** 1.5–2 hours  
**Status:** ☐ Not started

---

### 8.4 Manual QA: Persistence & Security
- [ ] Player position saved
- [ ] Quiz state persists on reload
- [ ] HTML content sanitized (no XSS)
- [ ] Old saves migrate without error
- [ ] DOMPurify prevents malicious HTML

**Effort:** 1.5 hours  
**Status:** ☐ Not started

---

## Implementation Timeline

| Phase | Tasks | Effort | Status |
|-------|-------|--------|--------|
| **0** | Foundation & Dependencies | 25 min | ☐ |
| **1** | Responsive Game Mode | 5–9 hrs | ☐ |
| **2** | Game Pause/Resume | 1.5–2 hrs | ☐ |
| **3** | Input & Security | 3–3.5 hrs | ☐ |
| **4** | Quiz Persistence | 3.5–4.5 hrs | ☐ |
| **5** | Lesson Mode UI | 10–12 hrs | ☐ |
| **6** | App Integration | 2 hrs | ☐ |
| **7** | NPC Polish | 1–3 hrs | ☐ |
| **8** | Testing & QA | 6–9 hrs | ☐ |
| | **TOTAL** | **32–45 hrs** | |

---

## Recommended Execution Path

**Week 1:** 
- Phase 0–2 (Foundation, responsive game, pause system) — 7–12 hours
- Phase 3 (Security & debouncing) — 3–3.5 hours

**Week 2:**
- Phase 4 (Persistence) — 3.5–4.5 hours
- Phase 5–6 (Lesson Mode) — 12–14 hours

**Week 3:**
- Phase 7 (NPC polish) — 1–3 hours
- Phase 8 (QA & validation) — 6–9 hours

---

## Success Criteria

✅ **Game Mode:**
- Map centered on all breakpoints
- Responsive camera zoom (desktop/tablet/mobile)
- Game pauses during UI interactions
- No input spam

✅ **Lesson Mode:**
- Full-page immersive UI
- Sidebar on desktop, footer on mobile
- One-question-at-a-time quiz
- Keyboard navigation works
- Game pauses while active

✅ **Stability:**
- Quiz state persists across page reload
- Save data versioned and migrated
- No XSS vulnerabilities
- No memory leaks

✅ **Polish:**
- Smooth animations
- Responsive design
- Accessible (keyboard nav, ARIA labels)
- No visual glitches

---

## Branch & Deployment

1. Create branch: `git checkout -b feat/game-lesson-modes`
2. Implement phases 0–8 in order
3. Test each phase before proceeding
4. Create PR when complete
5. Merge after code review
6. Deploy to production

---

**Document Version:** 2.0 (Simplified)  
**Status:** ✅ Ready for Implementation  
**Next Step:** Start Phase 0 — Install dependencies and verify file structure
