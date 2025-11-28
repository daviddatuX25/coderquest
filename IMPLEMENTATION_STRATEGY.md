# CoderQuest Implementation Strategy & Architecture Guide

**Document Type:** Developer Architecture Guide  
**Version:** 1.0  
**Date:** November 27, 2025  
**Audience:** Lead Developer, Architecture Review  

---

## Overview

This document provides a clear architectural strategy for implementing the 8-phase refactor plan. It covers design decisions, edge cases, data flow, integration points, and potential pitfalls for each phase. Use this as a reference guide during implementation to avoid common mistakes and ensure clean architecture.

---

## Architecture Philosophy

### Core Principles
1. **Separation of Concerns** — Game logic (Phaser) separate from UI logic (React)
2. **Event-Driven Communication** — Components communicate via EventBus, not direct refs
3. **Single Responsibility** — Each manager/component has one job
4. **Graceful Degradation** — Features degrade gracefully if dependencies fail
5. **Testability** — All logic should be independently testable

### Data Flow Architecture

```
User Input (Keyboard/Mouse)
    ↓
GameScene (Phaser - owns physics, player, NPCs)
    ↓
Interaction Handler (detects portal/NPC)
    ↓
EventBus.emit('quest:show-lesson')
    ↓
React App.jsx (listens, updates state)
    ↓
LessonMode Component (renders full-page UI)
    ↓
Game pauses via EventBus.emit('game:pause')
    ↓
GameScene (receives pause event, disables input/physics)
```

---

## Phase 1: Responsive Game Mode Configuration

### 1.1 Architecture Overview

**Goal:** Make Phaser canvas responsive across breakpoints (desktop/tablet/mobile)

**Key Components Involved:**
- `config.js` — Game configuration (Phaser Scale manager)
- `PhaserGame.jsx` — React wrapper that mounts Phaser game
- `App.scss` — Container styling
- `GameScene.js` — Scene-level camera logic

**Design Decision: Scale Manager Mode**

Choose one of three approaches:

| Approach | Mode | Pros | Cons |
|----------|------|------|------|
| **FIT** | `Phaser.Scale.FIT` | Maintains aspect ratio, predictable, less math | Potential letterboxing on extreme ratios |
| **RESIZE** | `Phaser.Scale.RESIZE` | True responsive, fills viewport | More complex zoom calculations per breakpoint |
| **FIXED** | `Phaser.Scale.NONE` | Simple, no resizing | Not responsive at all |

**Recommendation:** Use **FIT** mode (simplest, most reliable). Canvas maintains 800x600 aspect ratio but scales to fit container. Pair with `centerMap()` for camera zoom adjustments per breakpoint.

### 1.2 Edge Cases & Mitigations

#### Edge Case 1: Extreme Mobile Widths (<300px)
**Problem:** Very narrow screens might cause map to zoom out too far, making player unplayable.  
**Mitigation:** Set minimum zoom constraint in `centerMap()`:
```
const zoom = Math.max(0.5, Math.min(baseZoom, maxZoom));
```
Also consider a minimum container width in CSS:
```scss
#phaser-game-container {
  min-width: 320px;
  min-height: 240px;
}
```

#### Edge Case 2: Window Resize During Game Play
**Problem:** Player is mid-interaction when window is resized, camera suddenly shifts.  
**Mitigation:** Debounce resize handler to prevent rapid re-centering:
```javascript
let resizeTimeout;
this.scale.on('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => this.centerMap(), 150);
});
```

#### Edge Case 3: Orientation Change on Mobile (Portrait ↔ Landscape)
**Problem:** Game pauses/glitches during orientation change; viewport height changes trigger virtual keyboard issues.  
**Mitigation:**
- Listen for `orientationchange` event
- Add delay (300ms) before recomputing zoom (let browser settle)
- Ensure `expandParent: true` in Phaser config allows canvas to expand to new container size

#### Edge Case 4: Multiple Canvas Instances
**Problem:** If `PhaserGame.jsx` mounts twice, two Phaser games could be created.  
**Mitigation:** 
- Use `useRef` to store game instance
- In cleanup (useEffect return), destroy existing game before creating new one
- Guard against double-initialization

#### Edge Case 5: Player Position Outside Visible Viewport
**Problem:** Camera zoom out so far that player is tiny/hard to see, or player wanders off-camera due to zoom mismatch.  
**Mitigation:**
- In `centerMap()`, after computing zoom, ensure player position is within visible bounds
- Optionally clamp player movement to a safe zone (not at edges of map)

### 1.3 Data & State Management

**State to Track:**
```javascript
// In GameScene
this.currentZoom = 2;
this.breakpoint = 'desktop'; // 'desktop' | 'tablet' | 'mobile'
this.mapBounds = { x: 0, y: 0, width: mapWidth, height: mapHeight };
```

**Why?** For debugging, logging, and testing breakpoint-specific logic.

### 1.4 Integration Points

| Component | Integration | Expected Data |
|-----------|-----------|---|
| `config.js` | Exports scale config | `{ mode: FIT, parent: 'phaser-game-container', ... }` |
| `PhaserGame.jsx` | Uses config, mounts game | Game instance stored in useRef |
| `GameScene.js` | Calls `centerMap()` on `create()` + resize | Camera zoom adjusted |
| `App.scss` | Styles container div | Centered, responsive flex layout |

### 1.5 Testing Strategy

**Unit Tests:**
- Test `centerMap()` logic with mock camera/scale objects
- Test zoom computation for each breakpoint (desktop/tablet/mobile)

**Manual QA:**
- Test at 1920x1080 (desktop), 768x1024 (tablet), 375x667 (mobile)
- Resize browser window during gameplay
- Test orientation change on real device

**Validation Checklist:**
- [ ] Canvas appears centered on all breakpoints
- [ ] Camera zoom = 2 (desktop), 1.5 (tablet), 1 (mobile)
- [ ] Player stays visible and centered
- [ ] No scrollbars on viewport
- [ ] Resize doesn't cause visual jank

---

## Phase 2: Game Pause/Resume System

### 2.1 Architecture Overview

**Goal:** Pause game physics/input when UI (dialogs, lessons) opens; resume when closed

**Key Components Involved:**
- `GameScene.js` — Pause state management + event listeners
- `EventBus.js` — Emit/listen for pause events
- `DialogBox.jsx`, `LessonViewer.jsx`, `QuizInterface.jsx` — Emit pause on mount

**Design Decision: Pause Implementation**

| Approach | Mechanism | Pros | Cons |
|----------|-----------|------|------|
| **Physics Only** | `this.physics.pause()` | Keeps rendering, responsive UI | Player can move via camera |
| **Physics + Input** | Physics.pause() + `input.enabled = false` | Prevents all interaction | Slightly more overhead |
| **Scene Pause** | `this.scene.pause()` | Pauses entire scene (rare) | Stops rendering, might flicker |

**Recommendation:** Use **Physics + Input** approach. Pause physics and disable input, but keep rendering so UI feedback is immediate and smooth.

### 2.2 Edge Cases & Mitigations

#### Edge Case 1: Multiple Dialogs Open Simultaneously
**Problem:** User spam-clicks, opens Dialog A, then Dialog B before A closes. Both emit pause.  
**Mitigation:**
- Track pause depth counter: `this.pauseDepth = 0`
- Increment on `game:pause`, decrement on `game:resume`
- Only actually pause when `pauseDepth > 0`
```javascript
EventBus.on('game:pause', () => {
  this.pauseDepth++;
  if (this.pauseDepth === 1) {
    this.physics.pause();
    this.input.enabled = false;
  }
});

EventBus.on('game:resume', () => {
  this.pauseDepth = Math.max(0, this.pauseDepth - 1);
  if (this.pauseDepth === 0) {
    this.physics.resume();
    this.input.enabled = true;
  }
});
```

#### Edge Case 2: Dialog Closes Before Pause Event Processed
**Problem:** Dialog emits pause on mount, then immediately unmounts and emits resume before pause was registered.  
**Mitigation:**
- Use a flag to track paused state, don't just rely on events:
```javascript
this.isPaused = false; // Actual state
EventBus.on('game:pause', () => {
  if (!this.isPaused) {
    this.isPaused = true;
    this.physics.pause();
    this.input.enabled = false;
  }
});
```

#### Edge Case 3: Game Already Paused When Pause Event Fires
**Problem:** Player manually paused (future feature), then dialog opens and tries to pause again.  
**Mitigation:** Same as Edge Case 2 — check current state before executing pause logic.

#### Edge Case 4: Input Re-enabled But Physics Still Paused
**Problem:** Bug causes physics to stay paused while input is enabled. Player moves without animation.  
**Mitigation:**
- Always enable/disable physics and input together
- Add assertion/warning if they're out of sync:
```javascript
const isPaused = !this.physics.world.isPaused;
const inputEnabled = this.input.enabled;
if (isPaused !== !inputEnabled) {
  console.warn('Physics/input pause state mismatch!');
}
```

#### Edge Case 5: Page Hidden (Tab Loses Focus)
**Problem:** Dialog pauses game, user switches tabs, comes back. Pause state unclear.  
**Mitigation:**
- Listen for `visibilitychange` event
- On return, if game is paused, verify state is still correct
- Optionally resume if tab was hidden for > 5 minutes

### 2.3 Data & State Management

**State to Track:**
```javascript
// In GameScene
this.isPaused = false;
this.pauseDepth = 0; // Prevent double-pause bug
this.pauseReason = null; // 'dialog' | 'lesson' | 'quiz' | 'manual'
```

**Event Payloads:**
```javascript
EventBus.emit('game:pause', { reason: 'dialog', component: 'DialogBox' });
EventBus.emit('game:resume', { reason: 'dialog', component: 'DialogBox' });
```

### 2.4 Integration Points

| Component | Integration | Expected Data |
|-----------|-----------|---|
| `GameScene.js` | Listens for pause/resume events | Event payload with reason |
| `DialogBox.jsx` | Emits pause on mount, resume on unmount | Basic events, no payload required |
| `LessonViewer.jsx` | Same as DialogBox | |
| `QuizInterface.jsx` | Same as DialogBox | |
| `EventBus.js` | Relays pause/resume events | Passes payloads through |

### 2.5 Testing Strategy

**Unit Tests:**
- Test pause depth counter logic (increment/decrement)
- Test pause state flags don't go out of sync

**Manual QA:**
- Open dialog → player should freeze
- Close dialog → player should move again
- Rapid open/close dialogs → no glitches
- Open Dialog A, then Dialog B without closing A → game stays paused
- Close Dialog B, Dialog A still open → game stays paused
- Close Dialog A → game resumes

**Validation Checklist:**
- [ ] Game pauses when first dialog opens
- [ ] Game resumes when last dialog closes
- [ ] Multiple dialogs don't cause double-pause
- [ ] Physics and input stay in sync

---

## Phase 3: Input Debouncing & Security

### 3.1 Architecture Overview — Input Debouncing

**Goal:** Prevent rapid interaction spam (holding E key, clicking rapid-fire)

**Key Components Involved:**
- `GameScene.js` — Interaction handler + cooldown timer

**Design Decision: Debounce vs. Throttle**

| Approach | Behavior | Pros | Cons |
|----------|----------|------|------|
| **Cooldown Timer** | Single interaction triggers, then cooldown period | Simple, predictable | User must wait between actions |
| **Throttle** | Allow interaction once per X ms | More responsive | More complex |
| **Debounce** | Wait for input to stop, then trigger | Good for UI input | Feels laggy for game interactions |

**Recommendation:** Use **Cooldown Timer**. Game interactions feel better with a simple cooldown (200–300ms).

### 3.2 Edge Cases & Mitigations — Input Debouncing

#### Edge Case 1: Player Rapidly Approaches Multiple NPCs
**Problem:** Player holds E key while walking past 3 NPCs. First NPC triggers with cooldown. Should second NPC be interactable immediately after cooldown?  
**Mitigation:**
- Cooldown is **global** (whole scene), not per-NPC
- If player walks past NPC A (cooldown triggered), then NPC B appears in range, player must wait for cooldown before interacting with B
- This is acceptable UX; prevents unintended interactions

#### Edge Case 2: Interaction During Pause
**Problem:** Game is paused (dialog open). Player rapidly presses E. When dialog closes, should stored input register?  
**Mitigation:**
- Disable input (`this.input.enabled = false`) during pause
- Interaction handler never runs, no cooldown necessary
- Clean separation: pause state controls input availability

#### Edge Case 3: Cooldown Expires, But Player Still Holding Key
**Problem:** Player holds E for 500ms. Cooldown is 200ms. Interaction fires once at 200ms, but player is still holding, might trigger twice.  
**Mitigation:**
- In interaction handler, check **both** cooldown timer **and** check if key was **just pressed** (not held):
```javascript
const isKeyJustPressed = Phaser.Input.Keyboard.JustDown(this.interactKey);
if (this.interactionCooldown > 0 || !isKeyJustPressed) return;
// Interaction logic
this.interactionCooldown = 200;
```

#### Edge Case 4: Interaction Completes During Cooldown
**Problem:** Player interacts, scene changes, quest manager shows lesson. During 200ms cooldown, scene state changes. Cooldown becomes irrelevant.  
**Mitigation:**
- Reset cooldown when scene changes: `this.interactionCooldown = 0`
- Reset when game pauses: `this.interactionCooldown = 0` (input disabled anyway)

### 3.3 Architecture Overview — XSS Security (DOMPurify)

**Goal:** Sanitize HTML content from JSON files to prevent injection attacks

**Key Components Involved:**
- `DialogBox.jsx` — Renders HTML content
- `LessonViewer.jsx` — Renders lesson HTML
- `QuizInterface.jsx` — Renders quiz descriptions
- DOMPurify library

**Design Decision: Sanitization Scope**

| Scope | What to Sanitize | Pros | Cons |
|-------|------------------|------|------|
| **Global** | All `dangerouslySetInnerHTML` at entry point | Centralized, one place to review | Might over-sanitize |
| **Component Level** | Each component sanitizes its own content | Fine-grained control | Distributed, easy to miss |
| **Hybrid** | Sanitize at load (when fetching JSON), re-sanitize at render | Defense in depth | More overhead |

**Recommendation:** Use **Hybrid approach**. Sanitize when loading content from JSON, then again at render (defense-in-depth).

### 3.4 Edge Cases & Mitigations — Security

#### Edge Case 1: Sanitization Removes Legitimate Styling
**Problem:** Lesson HTML includes `<div style="color: red">Important</div>`. DOMPurify strips `style` attribute by default, making text black.  
**Mitigation:**
- Configure DOMPurify to allow safe attributes:
```javascript
const sanitized = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'div', 'span'],
  ALLOWED_ATTR: ['class'], // Allow CSS classes, not inline styles
});
```
- Use CSS classes instead of inline styles in content JSON

#### Edge Case 2: Third-Party Content Scripts
**Problem:** Content author adds a `<script>` tag in quest JSON. DOMPurify removes it, but is there a vulnerability?  
**Mitigation:**
- DOMPurify's default config removes all scripts. Verified safe.
- Document that no JavaScript is allowed in content
- Add tests to verify scripts are always stripped

#### Edge Case 3: SVG/Image Injection
**Problem:** Content includes `<img src=x onerror="malicious()">` or SVG with script.  
**Mitigation:**
- DOMPurify removes `onerror` and script tags by default
- Disable SVG by default in config (if not needed):
```javascript
const sanitized = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['b', 'i', 'p', 'br', 'div', 'span', 'img'],
  ALLOWED_ATTR: ['src', 'alt'],
  // SVG disabled by default unless explicitly enabled
});
```

#### Edge Case 4: Performance: Sanitizing Large Content
**Problem:** Quest has 10,000 characters of HTML. Sanitizing on every render is slow.  
**Mitigation:**
- Sanitize once when content loads, cache the result:
```javascript
const sanitizedContent = useMemo(() => 
  DOMPurify.sanitize(rawContent), 
  [rawContent]
);
```
- In `useEffect`, sanitize on mount, store in state
- Only re-sanitize if content changes

#### Edge Case 5: DOMPurify Not Available (Library Fails to Load)
**Problem:** npm install succeeded, but DOMPurify fails at runtime.  
**Mitigation:**
- Wrap sanitization in try/catch:
```javascript
let sanitized;
try {
  sanitized = DOMPurify.sanitize(html);
} catch (err) {
  console.error('DOMPurify failed:', err);
  // Fallback: render plain text instead of HTML
  sanitized = escapeHtml(html); // Custom escape function
}
```

### 3.5 Data & State Management

**Input Debouncing State:**
```javascript
this.interactionCooldown = 0;
this.interactKey = this.input.keyboard.addKey('E');
```

**Security Metadata:**
```javascript
// Track what content has been sanitized
const contentCache = new Map(); // URL → sanitized HTML
contentCache.set('dialog_01.json', sanitizedHtml);
```

### 3.6 Integration Points

| Component | Integration | Expected Data |
|-----------|-----------|---|
| `GameScene.js` | Cooldown timer on interaction | Milliseconds countdown |
| `DialogBox.jsx` | DOMPurify.sanitize() on content | HTML string → sanitized HTML |
| `LessonViewer.jsx` | Same as DialogBox | |
| `QuizInterface.jsx` | Same as DialogBox | |

### 3.7 Testing Strategy

**Input Debouncing:**
- Mock cooldown timer, verify interaction fires once per cooldown period
- Test rapid key presses don't trigger multiple interactions
- Test cooldown resets on scene changes

**Security:**
- Test that scripts are stripped from HTML
- Test that CSS classes are allowed, inline styles not
- Test that images/SVGs without onerror are allowed
- Unit test DOMPurify fallback on failure
- Manual: inspect browser dev tools, confirm no malicious scripts in DOM

**Validation Checklist:**
- [ ] Rapid E presses don't trigger multiple interactions
- [ ] 200ms cooldown prevents spam
- [ ] DOMPurify sanitizes all HTML content
- [ ] Legitimate styling preserved (via CSS classes)
- [ ] No console errors for security

---

## Phase 4: Quiz State Persistence

### 4.1 Architecture Overview

**Goal:** Save quiz progress to localStorage; restore on page reload

**Key Components Involved:**
- `SaveManager.js` — Handles all save/load logic
- `QuestManager.js` — Tracks active quiz
- `QuizInterface.jsx` — Updates quiz state
- localStorage API

**Design Decision: Persistence Scope**

| Scope | What's Saved | Pros | Cons |
|-------|---|---|---|
| **Quiz Only** | Current question, answers | Minimal data, fast | Lose game context if quiz incomplete |
| **Quest Only** | Whole quest progress | Simpler | Lose quiz answer detail |
| **Full State** | Player position + quest + quiz + NPC state | Complete restore | Large data, slower |

**Recommendation:** Use **Full State** but split into separate saves: `playerState` and `quizState`. Allows granular restore.

### 4.2 Edge Cases & Mitigations

#### Edge Case 1: Quiz Abandoned Mid-Quiz
**Problem:** Player starts quiz, completes 3 of 5 questions, closes browser. On reload, should quiz state be restored?  
**Mitigation:**
- Save quiz state periodically (on every answer submission)
- On page load, check for incomplete quiz state
- Offer resume option: "Resume Quiz" vs "Start Over"
- If resume chosen, restore answers and question index

#### Edge Case 2: Quiz Content Changed (JSON Updated)
**Problem:** Quiz had 5 questions. Admin updated JSON to 8 questions. Player's saved state has only 3 answers.  
**Mitigation:**
- Store content **version** in save: `{ quizVersion: 1, answers: [...] }`
- On load, if version mismatch, discard saved quiz and start fresh
- Log warning: "Quiz content changed, starting fresh"

#### Edge Case 3: localStorage Full (Quota Exceeded)
**Problem:** Player has 50 save slots. Adding quiz state exceeds 5MB limit.  
**Mitigation:**
- Try/catch on save:
```javascript
try {
  localStorage.setItem('coderquestSave', JSON.stringify(data));
} catch (err) {
  if (err.name === 'QuotaExceededError') {
    // Delete oldest save
    this.deleteOldestSave();
    // Retry
    this.saveGame();
  }
}
```

#### Edge Case 4: Corrupted Save Data
**Problem:** localStorage has partially corrupted JSON (app crash mid-save).  
**Mitigation:**
- Validate data on load:
```javascript
try {
  const data = JSON.parse(localStorage.getItem('coderquestSave'));
  // Validate required fields
  if (!data.playerX || !data.playerY) {
    throw new Error('Incomplete save data');
  }
  return data;
} catch (err) {
  console.error('Save file corrupted:', err);
  localStorage.removeItem('coderquestSave');
  return null; // Force new game
}
```

#### Edge Case 5: Multiple Tabs/Windows
**Problem:** Player has game open in two browser tabs. Both save independently. Which one wins?  
**Mitigation:**
- Add `lastSaved` timestamp to each save
- On load, compare timestamps: newer save wins
- Consider `storage` event listener to sync between tabs (advanced)

### 4.3 Data Structure

**Recommended Schema:**
```javascript
{
  version: 1,
  playerState: {
    playerX: number,
    playerY: number,
    questsCompleted: string[],
    activeQuestId: string | null,
    lastSaved: timestamp,
  },
  quizState: {
    questId: string,
    quizVersion: number,
    currentQuestionIndex: number,
    answers: { questionId: string, answer: string }[],
    timestamp: timestamp,
  },
  metadata: {
    worldVersion: 1,
    playerName: string,
    createdAt: timestamp,
  }
}
```

### 4.4 Version Migration

**Design Decision: Migration Path**

| Version | Change | Migration Logic |
|---------|--------|---|
| 0 | Initial (no quiz state) | If v0 → v1, add empty `quizState` |
| 1 | Added quiz state | If v1 → v2, add `playerName` field |
| 2 | Added player name | Future versions... |

**Implementation:**
```javascript
const CURRENT_VERSION = 1;

migrate(data, fromVersion, toVersion) {
  if (fromVersion === 0 && toVersion === 1) {
    return {
      ...data,
      quizState: null,
    };
  }
  return data;
}

loadGame() {
  let data = JSON.parse(localStorage.getItem('coderquestSave'));
  if (data.version < CURRENT_VERSION) {
    data = this.migrate(data, data.version, CURRENT_VERSION);
    data.version = CURRENT_VERSION;
  }
  return data;
}
```

### 4.5 Integration Points

| Component | Integration | Expected Data |
|-----------|-----------|---|
| `SaveManager.js` | Persist quiz state to localStorage | `{ quizState: {...} }` |
| `QuizInterface.jsx` | Update SaveManager on answer submit | Answer object |
| `QuestManager.js` | Track active quiz ID | String ID |
| `App.jsx` (on load) | Call SaveManager.loadGame() | Restored state object |

### 4.6 Testing Strategy

**Unit Tests:**
- Test save data structure is valid JSON
- Test migration logic for version changes
- Test corrupted data detection and fallback
- Test quota exceeded fallback

**Manual QA:**
- Start quiz, complete question, reload page → quiz resumes
- Start quiz, close tab, reopen → quiz still there
- Abandon quiz mid-way, reload → resume option appears
- Edit JSON manually to corrupt it → game handles gracefully
- Fill localStorage to near capacity → game handles quota error

**Validation Checklist:**
- [ ] Quiz state saved on answer submit
- [ ] Quiz state restored on page reload
- [ ] Incomplete quiz offers resume option
- [ ] Corrupted saves don't crash game
- [ ] Version migrations work smoothly

---

## Phase 5: Lesson Mode UI Architecture

### 5.1 Architecture Overview

**Goal:** Create a full-page, immersive lesson interface separate from game mode

**Key Components Involved:**
- `LessonMode.jsx` (container)
- `LessonHeader.jsx`
- `LessonSidebar.jsx`
- `LessonContent.jsx`
- `LessonFooter.jsx` (mobile)
- Lesson mode SCSS

**Design Decision: Modal vs. Full-Page**

| Approach | Rendering | Pros | Cons |
|----------|-----------|------|------|
| **Modal (Overlay)** | Game visible behind semi-transparent overlay | Context preserved | Game world feels separate |
| **Full-Page (Replace)** | Replaces game entirely, no game visible | Immersive, cleaner | Loss of context |
| **Hybrid** | Full-page on mobile, modal on desktop | Best UX for each platform | More complex logic |

**Recommendation:** Use **Full-Page** approach. Simpler, more immersive. Game is paused anyway, so user won't notice game isn't rendering.

### 5.2 Component Hierarchy & Data Flow

```
LessonMode (container, full-page)
├── useEffect: emit 'game:pause' on mount
├── useEffect: cleanup emit 'game:resume' on unmount
├── handleClose()
├── LessonHeader
│   ├── Quest title
│   ├── Progress indicator (2/5)
│   └── Close button
├── Desktop Layout (flex row)
│   ├── LessonSidebar (360px)
│   │   ├── Quest segments list
│   │   ├── Current segment highlight
│   │   └── NPC avatar
│   └── LessonContent (flex: 1)
│       ├── LessonViewer OR QuizInterface (conditional)
│       └── ControlButtons (Next, Previous, Submit)
└── Mobile Layout (flex column, sidebar hidden)
    ├── LessonContent (full width)
    └── LessonFooter
        ├── Segment indicators (dots)
        └── Navigation buttons
```

### 5.3 Edge Cases & Mitigations

#### Edge Case 1: User Navigates Between Segments
**Problem:** User is on question 1, clicks "Next" to skip to question 5. Should allow skipping?  
**Mitigation:**
- Design decision: **Allow skipping**, but track completion separately
- Mark skipped questions differently in UI (e.g., grayed out)
- Store which questions were attempted vs. skipped
- On completion, show summary: "3 attempted, 2 skipped"

#### Edge Case 2: Browser Back Button During Lesson
**Problem:** User presses browser back button while lesson is open. Should go back to game or close lesson?  
**Mitigation:**
- Use `history.pushState()` to create history entry when lesson opens
- Listen for `popstate` event, close lesson on back button
```javascript
useEffect(() => {
  history.pushState({ lessonMode: true }, '');
  
  const handlePopState = (e) => {
    if (e.state?.lessonMode) {
      handleClose();
    }
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

#### Edge Case 3: Lesson Content Fails to Load
**Problem:** Quiz JSON fails to fetch (network error). Lesson is open but empty.  
**Mitigation:**
- Add error boundary in LessonContent
- Show error message: "Failed to load lesson. Try again?"
- Provide retry button
```javascript
<LessonContent questId={questId} onRetry={handleRetry} />
```

#### Edge Case 4: User Completes Lesson, Then Navigates Game Elsewhere
**Problem:** User completes quiz (lesson closes), but then doesn't start new quest. Confusion about what happened.  
**Mitigation:**
- Emit event on completion: `EventBus.emit('quest:completed', { questId })`
- Show brief toast/notification: "Quest complete! Next quest available."
- QuestManager advances automatically to next milestone

#### Edge Case 5: Mobile: Keyboard Opens During Lesson
**Problem:** Mobile user taps quiz answer input. Virtual keyboard pops up, covers bottom of lesson.  
**Mitigation:**
- CSS: set `position: fixed; bottom: 0;` for mobile footer
- Ensure input fields scroll into view on focus (browser default)
- Test with real mobile devices (keyboard height varies)

#### Edge Case 6: Small Tablet (600px Wide)
**Problem:** Sidebar (360px) + content (flex) = total 360+ px. With padding, exceeds 600px.  
**Mitigation:**
- Hide sidebar on tablets/mobile, show footer instead
- Media query breakpoint: `@media (max-width: 768px) { .lesson-sidebar { display: none; } }`
- Sidebar width adjusted: desktop 360px, no sidebar mobile/tablet

### 5.4 State Management

**Global State (in App.jsx):**
```javascript
const [showLessonMode, setShowLessonMode] = useState(false);
const [activeLessonQuestId, setActiveLessonQuestId] = useState(null);
```

**Local State (LessonMode.jsx):**
```javascript
const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
const [answers, setAnswers] = useState({});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
```

**Event-Driven State:**
- Listen for `'quest:show-lesson'` event to show modal
- Emit `'quest:close-lesson'` on close

### 5.5 CSS Architecture (SCSS)

**Recommended Structure:**
```scss
// lesson-mode.scss
.lesson-mode {
  // Full-page overlay
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(11, 18, 32, 0.98);
  backdrop-filter: blur(10px);
  display: flex;
  z-index: 1000;
  
  .lesson-header { /* Sticky at top */ }
  
  .lesson-container {
    display: flex;
    flex: 1;
    
    .lesson-sidebar {
      width: 360px;
      border-right: 1px solid #2d5a4d;
      overflow-y: auto;
    }
    
    .lesson-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    .lesson-sidebar { display: none; }
    .lesson-content { padding: 1rem; }
    .lesson-footer { display: flex; }
  }
}
```

### 5.6 Integration Points

| Component | Integration | Expected Data |
|-----------|-----------|---|
| `App.jsx` | Renders LessonMode conditionally | `{ showLessonMode, activeLessonQuestId }` |
| `LessonMode.jsx` | Receives questId prop, renders children | Quest object with segments |
| `EventBus` | Listens for 'quest:show-lesson' | Event payload with questId |
| `GameScene.js` | Emits 'quest:show-lesson' on interaction | Quest data |

### 5.7 Testing Strategy

**Unit Tests:**
- Test segment navigation logic
- Test answer tracking
- Test error handling

**Manual QA:**
- Desktop: sidebar visible, content takes remaining space
- Tablet: sidebar hidden, footer visible, navigation works
- Mobile portrait: full-width layout, keyboard doesn't cover inputs
- Mobile landscape: adequate space for content
- Navigate between segments: content updates correctly
- Close lesson: game resumes
- Quiz complete: lesson closes, game shows completion message

**Validation Checklist:**
- [ ] Lesson Mode displays full-page
- [ ] Sidebar visible on desktop (1200+px)
- [ ] Sidebar hidden on mobile (<768px)
- [ ] Mobile keyboard doesn't cover content
- [ ] Segment navigation works smoothly
- [ ] Close button (Esc key, button) works

---

## Phase 6: NPC Enhancements (Optional Polish)

### 6.1 Architecture Overview

**Goal:** Add NPC idle animations and optional walking patterns

**Key Components Involved:**
- `GameScene.js` — NPC creation + animation setup
- NPC sprite asset files (already exist)
- Animation configuration

**Design Decision: Animation Scope**

| Scope | Animation Type | Effort | Visual Impact |
|-------|---|---|---|
| **Idle Only** | Loop idle frame 0–3 | 1 hour | Good, shows life |
| **Idle + Walk** | Walk between two points | 3–4 hours | Better, more dynamic |
| **Full AI** | Pathfinding, state machine | 8+ hours | Complex, overkill |

**Recommendation:** Use **Idle + Simple Walk**. NPCs idle most of the time, occasionally walk to another point and idle again.

### 6.2 Edge Cases & Mitigations

#### Edge Case 1: NPC Animation Asset Missing
**Problem:** NPC sprite sheet doesn't exist or has wrong frame count.  
**Mitigation:**
- Add error handling in sprite preload:
```javascript
preload() {
  try {
    this.load.spritesheet('npc-idle', 'assets/npc-idle.png', { frameWidth: 32, frameHeight: 32 });
  } catch (err) {
    console.error('Failed to load NPC sprite:', err);
    // Fallback: use placeholder sprite
    this.load.image('npc-idle', 'assets/placeholder.png');
  }
}
```

#### Edge Case 2: Player Interacts While NPC is Walking
**Problem:** Player presses E while NPC is mid-walk animation. Dialog shows, but NPC animation continues.  
**Mitigation:**
- On pause event, stop NPC animation:
```javascript
EventBus.on('game:pause', () => {
  this.npcs.forEach(npc => npc.stop()); // Stop animation
});
EventBus.on('game:resume', () => {
  this.npcs.forEach(npc => npc.play('npc-idle')); // Resume idle
});
```

#### Edge Case 3: Multiple NPCs, Performance Impact
**Problem:** 20 NPCs with walking animations. Each has update loop. Game slows down.  
**Mitigation:**
- Simplify: only animate NPCs in camera view
- Use object pool to reuse animation instances
- Cap max NPCs with animations: `if (npcCount > 10) simplifyAnimation()`

#### Edge Case 4: NPC Walk Target Unreachable (Obstacle in Way)
**Problem:** NPC tries to walk from (100, 100) to (200, 100), but wall at (150, 100). NPC gets stuck.  
**Mitigation:**
- Keep walking simple: just move X pixels in a direction
- Don't use pathfinding (overkill)
- Example: walk 100px right, then 100px left, repeat
```javascript
npc.patrol = { 
  startX: 100, 
  distance: 100, 
  speed: 40, 
  direction: 1 
};
```

#### Edge Case 5: NPC Animation Frame Count Wrong in Code vs. Asset
**Problem:** Code says idle animation has 4 frames (0–3), but PNG has only 2 frames.  
**Mitigation:**
- Add validation/logging:
```javascript
const frameCount = Math.floor(spriteSheet.width / 32); // Calculated from image width
console.log(`NPC sprite has ${frameCount} frames`);
this.anims.create({
  key: 'npc-idle',
  frames: this.anims.generateFrameNumbers('npc-idle', { 
    start: 0, 
    end: Math.min(3, frameCount - 1) // Don't exceed actual frames
  }),
  frameRate: 6,
  repeat: -1
});
```

### 6.3 Implementation Patterns

**Simple Idle Animation:**
```javascript
// In GameScene.create()
this.anims.create({
  key: 'npc-idle',
  frames: this.anims.generateFrameNumbers('npc-idle', { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1
});

npc.play('npc-idle');
```

**Simple Walking Pattern:**
```javascript
// In GameScene.create()
npc.patrol = {
  x1: 100,        // Left boundary
  x2: 200,        // Right boundary
  speed: 40,      // pixels/sec
  direction: 1,   // 1 = right, -1 = left
  isWalking: false
};

// In GameScene.update()
npc.patrol.x1 += npc.patrol.speed * npc.patrol.direction * (delta / 1000);
if (npc.patrol.x1 >= npc.patrol.x2) {
  npc.patrol.direction = -1;
  npc.patrol.x1 = npc.patrol.x2;
} else if (npc.patrol.x1 <= npc.patrol.x1) {
  npc.patrol.direction = 1;
  npc.patrol.x1 = npc.patrol.x1;
}
```

### 6.4 Integration Points

| Component | Integration | Expected Data |
|-----------|-----------|---|
| `GameScene.js` | Create NPC sprites, animations, patrol logic | NPC objects with animation/patrol state |
| NPC asset files | Referenced in preload | PNG spritesheet files |
| `EventBus` | Listen to pause/resume to stop/resume animation | Pause/resume events |

### 6.5 Testing Strategy

**Manual QA:**
- Verify NPC idle animation plays on loop
- Verify NPC walks smoothly (no jank)
- Verify NPC walks back and forth (patrol pattern)
- Player interacts with NPC during walk → animation stops
- Player closes dialog → NPC animation resumes
- Check performance with multiple NPCs

**Validation Checklist:**
- [ ] NPC idle animation loops smoothly
- [ ] NPC walking animation is visible and smooth
- [ ] NPC doesn't get stuck on obstacles
- [ ] Animation stops on pause, resumes on resume
- [ ] No performance degradation with multiple NPCs

---

## Phase 7: Application Integration (App.jsx)

### 7.1 Architecture Overview

**Goal:** Wire Lesson Mode into main App component with proper state management and event handling

**Key Components Involved:**
- `App.jsx` — Main component, state management
- `PhaserGame.jsx` — Game wrapper
- `LessonMode.jsx` — Lesson UI
- `EventBus.js` — Inter-component communication

**Design Decision: State Location**

| Location | State Type | Pros | Cons |
|----------|---|---|---|
| **App.jsx** | Global state (showLessonMode, activeQuestId) | Centralized, easy to access | Props drilling if deep component tree |
| **Context API** | React Context provider | Clean, no drilling | Overkill for this scope |
| **EventBus** | Event-driven, no centralized state | Decoupled | Harder to debug state flow |

**Recommendation:** Use **App.jsx state** with EventBus for cross-component events. Centralized and clear.

### 7.2 State Management Flow

```
QuestManager (in Phaser)
    ↓ (detects interaction)
    ↓ emit 'quest:show-lesson'
    ↓
App.jsx (listens)
    ↓
setShowLessonMode(true)
setActiveLessonQuestId(questId)
    ↓
Render <LessonMode questId={questId} />
    ↓ (on close)
    ↓ setShowLessonMode(false)
    ↓
Emit 'game:resume'
    ↓
GameScene (listening) resumes
```

### 7.3 Edge Cases & Mitigations

#### Edge Case 1: Lesson Event Fired Before React Renders
**Problem:** QuestManager emits 'quest:show-lesson' but React hasn't mounted EventBus listener yet.  
**Mitigation:**
- EventBus is a singleton, initialized at startup
- Use `useEffect` in App.jsx with empty dependency array → runs once on mount
- Listener registered early enough

#### Edge Case 2: Multiple Quest Events Fire in Rapid Succession
**Problem:** Player rapidly interacts with multiple portals. Two 'quest:show-lesson' events fire.  
**Mitigation:**
- Check if lesson already shown before showing new one:
```javascript
const handleShowLesson = (data) => {
  if (showLessonMode) {
    console.warn('Lesson already open, ignoring new request');
    return;
  }
  setActiveLessonQuestId(data.questId);
  setShowLessonMode(true);
};
```

#### Edge Case 3: Quest Data Changed While Lesson Open
**Problem:** Admin updates quest JSON. Lesson is open with old data. User closes and reopens.  
**Mitigation:**
- Reload quest data on lesson open (don't cache)
- Timestamp quest data, invalidate after 5 minutes

#### Edge Case 4: App Unmounts/Remounts (Hot Module Replacement)
**Problem:** Developer hot-reloads app. EventBus listener still attached to old App instance.  
**Mitigation:**
- useEffect cleanup function removes listener:
```javascript
useEffect(() => {
  EventBus.on('quest:show-lesson', handleShowLesson);
  return () => EventBus.off('quest:show-lesson', handleShowLesson);
}, []);
```

#### Edge Case 5: Lesson Modal Open, User Navigates Away (SPA Route Change)
**Problem:** User navigates to different page while lesson is open.  
**Mitigation:**
- On route change, close lesson and resume game
- Use React Router lifecycle (if using routing)
- Or: App component unmounts cleanly, lesson state lost (acceptable)

### 7.4 Data & State Management

**App.jsx State:**
```javascript
const [showLessonMode, setShowLessonMode] = useState(false);
const [activeLessonQuestId, setActiveLessonQuestId] = useState(null);
const [gameStarted, setGameStarted] = useState(false);
```

**Event Payload Expectations:**
```javascript
// Emitted by QuestManager
EventBus.emit('quest:show-lesson', {
  questId: 'quest_01',
  questTitle: 'Learn Variables',
  segments: [...]
});
```

### 7.5 Integration Checklist

| Task | Component | Status |
|------|-----------|--------|
| Add state for showLessonMode | App.jsx | ☐ |
| Add state for activeLessonQuestId | App.jsx | ☐ |
| Setup EventBus listener in useEffect | App.jsx | ☐ |
| Render LessonMode conditionally | App.jsx | ☐ |
| Pass questId to LessonMode | App.jsx | ☐ |
| Handle 'quest:show-lesson' event | App.jsx | ☐ |
| Handle lesson close callback | App.jsx | ☐ |
| Cleanup EventBus listener | App.jsx | ☐ |

### 7.6 Testing Strategy

**Unit Tests:**
- Test event listener registered on mount
- Test event listener cleaned up on unmount
- Test state updates on event
- Test conditional rendering of LessonMode

**Manual QA:**
- Start game, interact with quest → Lesson Mode appears
- Close lesson → Game resumes
- Rapidly open/close lesson → No errors
- Reload page while lesson open → Graceful handling

**Validation Checklist:**
- [ ] Lesson Mode appears when event fired
- [ ] Lesson Mode closes properly
- [ ] Game pauses when lesson open
- [ ] Game resumes when lesson closes
- [ ] No console errors during transitions

---

## Phase 8: Testing & Comprehensive QA

### 8.1 Testing Strategy Matrix

| Layer | Test Type | Scope | Owner |
|-------|-----------|-------|-------|
| **Unit** | Functions, pure logic | Small, isolated | Developer |
| **Integration** | Components, event flow | Medium, multi-component | Developer |
| **Manual QA** | User workflows, breakpoints | Full feature, real device | QA / Developer |
| **Regression** | Verify old features still work | Whole app | QA |

### 8.2 Test Environments

**Desktop:**
- Chrome 1920x1080
- Firefox 1366x768
- Safari 1440x900

**Tablet:**
- iPad (768x1024 portrait, 1024x768 landscape)
- Android tablet (800x1280)

**Mobile:**
- iPhone 12 (390x844)
- Android phone (375x667)

### 8.3 Comprehensive QA Checklist

#### Category: Responsive Design
- [ ] Desktop (1200+px): game centered, zoom=2
- [ ] Tablet (768-1199px): game centered, zoom=1.5
- [ ] Mobile (<768px): game centered, zoom=1
- [ ] Window resize during gameplay: camera re-centers smoothly
- [ ] Orientation change on mobile: layout adapts
- [ ] No horizontal scrollbars on any device

#### Category: Game Pause/Resume
- [ ] Open dialog → game physics paused
- [ ] Open dialog → player can't move
- [ ] Open dialog → interaction prompt hidden
- [ ] Close dialog → game resumes
- [ ] Open dialog A, then B → game stays paused
- [ ] Close B (A still open) → game stays paused
- [ ] Close A → game resumes
- [ ] Rapid open/close → no glitches

#### Category: Lesson Mode
- [ ] Lesson Mode full-page, game not visible
- [ ] Desktop: sidebar visible, content in main area
- [ ] Tablet: sidebar hidden, content full width
- [ ] Mobile: sidebar hidden, footer visible
- [ ] Segment navigation: content updates on click
- [ ] Quiz: one question per view
- [ ] Quiz: answers display correctly
- [ ] Close button: Esc key and button both work
- [ ] Mobile keyboard: doesn't cover input fields

#### Category: Input & Security
- [ ] Rapid E key presses → only one interaction
- [ ] 200ms cooldown prevents spam
- [ ] HTML in dialogs: no visible scripts
- [ ] HTML in lessons: no visible scripts
- [ ] Styling preserved (CSS classes work)

#### Category: Persistence
- [ ] Player position saved to localStorage
- [ ] Quest progress saved
- [ ] Quiz answers saved on submit
- [ ] Reload page → player position restored
- [ ] Reload page → quest progress restored
- [ ] Incomplete quiz → resume option offered
- [ ] Quiz resume → answers displayed correctly
- [ ] Old save file → migrated without error
- [ ] Corrupted save file → game handles gracefully

#### Category: NPC Enhancements
- [ ] NPC idle animation plays
- [ ] NPC idle animation loops smoothly
- [ ] NPC walking animation visible
- [ ] NPC patrol pattern correct
- [ ] Player interacts with walking NPC → animation stops
- [ ] Dialog closes → NPC animation resumes

#### Category: Performance
- [ ] Game loads in < 3 seconds
- [ ] No lag during gameplay
- [ ] Camera resize smooth
- [ ] Multiple NPCs don't cause stutter
- [ ] Lesson Mode transition smooth

#### Category: Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Button focus visible
- [ ] ARIA labels present
- [ ] Color contrast >= 4.5:1
- [ ] No content behind modals

#### Category: Regression (Old Features)
- [ ] Player movement still works
- [ ] NPC interaction still works
- [ ] Portal interaction still works
- [ ] Dialog choices still work
- [ ] Map loading still works
- [ ] Save/load still works (if not testing new persistence)

### 8.4 Test Case Examples

**Test Case: Game Pause During Multiple Dialogs**
```
1. Start game
2. Move player (confirm movement works)
3. Open dialog A (game should pause)
4. Attempt to move player (should fail)
5. Open dialog B (game should stay paused)
6. Close dialog B (game should stay paused)
7. Close dialog A (game should resume)
8. Move player (should work)
```

**Test Case: Quiz State Persistence**
```
1. Start quiz (Question 1)
2. Answer question 1
3. Answer question 2
4. Reload page
5. Verify: quiz resumes at question 3 (or offers "resume")
6. Verify: answers to questions 1-2 are displayed
7. Complete quiz
8. Verify: quiz marked as complete in save
9. Reload page
10. Verify: quiz shows as completed
```

**Test Case: Mobile Responsive**
```
1. Load game on mobile device (375x667)
2. Verify: canvas centered
3. Verify: camera zoom = 1
4. Open keyboard (tap input)
5. Verify: input not covered by keyboard
6. Rotate to landscape (1194x668)
7. Verify: canvas adjusts
8. Verify: camera zoom recomputed
9. Rotate back to portrait
10. Verify: layout correct again
```

### 8.5 Bug Reporting Template

```
**Title:** [Concise description]

**Environment:**
- Device: [e.g., iPhone 12, Chrome Desktop]
- OS: [e.g., iOS 15, Windows 11]
- Resolution: [e.g., 390x844]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
...

**Expected:** [What should happen]

**Actual:** [What actually happened]

**Screenshots/Videos:** [If applicable]

**Severity:** [Critical / High / Medium / Low]
```

### 8.6 Sign-Off Criteria

**All phases ready for merge when:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual QA checklist 100% complete
- [ ] Regression tests pass
- [ ] No critical bugs open
- [ ] Code review approved
- [ ] Performance acceptable (< 3s load time)
- [ ] No console errors

---

## Common Pitfalls & How to Avoid Them

### 1. Event Listener Memory Leaks
**Pitfall:** EventBus.on() listener registered, never cleaned up. Accumulate over time.  
**Prevention:** Always use useEffect cleanup return to call EventBus.off()

### 2. Double Pause
**Pitfall:** Dialog A pauses, dialog B pauses again. Only B emits resume, game still paused.  
**Prevention:** Implement pause depth counter or check state before pausing

### 3. Stale Closure in useEffect
**Pitfall:** Handler captures old state from closure. User expects current state.  
**Prevention:** Include state variables in dependency array, or use useCallback

### 4. Save Data Corruption on Quota Exceeded
**Pitfall:** Try to save, quota exceeded, exception thrown, old save lost.  
**Prevention:** Try/catch, fallback to delete oldest save and retry

### 5. Zoom Never Resets on Resize
**Pitfall:** Resize listener never fires, or centerMap() never called.  
**Prevention:** Test resize explicitly, add logging to confirm listener fires

### 6. Lesson Mode Behind Game
**Pitfall:** Lesson Mode z-index less than game z-index. Game still clickable.  
**Prevention:** Set Lesson Mode z-index: 1000+, game z-index: default

### 7. NPC Animation Frame Out of Range
**Pitfall:** Code references frame 5, but sprite only has 4 frames. Animation fails.  
**Prevention:** Calculate max frame from sprite width, use Math.min()

### 8. Rapid Input Causes Multiple Interactions
**Pitfall:** Cooldown not implemented. Player holds E, multiple interactions fire.  
**Prevention:** Always implement cooldown or check "just pressed" vs. held

### 9. Quiz Content Not Sanitized
**Pitfall:** HTML from JSON file rendered directly, XSS vulnerability.  
**Prevention:** Always use DOMPurify.sanitize() on user/external content

### 10. localStorage Not Available (Incognito/Private Mode)
**Pitfall:** App crashes on save in private browsing mode.  
**Prevention:** Try/catch on localStorage.setItem, fallback to memory storage

---

## Architecture Decision Log

**Document these decisions for future reference:**

| Decision | Option A | Option B | Chosen | Reason |
|----------|----------|----------|--------|--------|
| Scale Manager | FIT | RESIZE | FIT | Simpler, predictable behavior |
| Pause Mechanism | Physics only | Physics + Input | Physics + Input | Better UX, prevents accidental input |
| Persistence | Quiz only | Full state | Full state | Complete restore, better UX |
| Lesson UI | Modal | Full-page | Full-page | Immersive, simpler logic |
| NPC Animation | Idle | Idle + Walk | Idle + Walk | Good polish, manageable effort |

---

## Rollout & Monitoring

### Pre-Launch Checklist
- [ ] All phases implemented and tested
- [ ] Code reviewed and approved
- [ ] Documentation complete and updated
- [ ] Performance baseline established
- [ ] Error logging configured
- [ ] Rollback plan tested

### Post-Launch Monitoring
- Monitor for errors in production (console errors)
- Track user session duration
- Monitor localStorage quota usage
- Check game load time
- Monitor for pause/resume issues

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|---|
| Game Load Time | < 3s | Performance tab, browser DevTools |
| No Console Errors | 0 | Browser console during QA |
| Responsive at All Breakpoints | 100% | Manual testing on 6+ devices |
| Quiz State Persists | 100% | Reload test in each phase |
| Input Spam Prevention | 100% | Rapid key test |
| XSS Vulnerability | 0 | Security audit of content |

---

## Document Control

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Nov 27, 2025 | Architecture Guide | Initial comprehensive strategy |

---

**Status:** ✅ Ready for Developer Review and Implementation

**Next Step:** Distribute to development team for Phase-by-Phase implementation, starting with Phase 1.
