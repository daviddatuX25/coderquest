# Lesson Mode Analysis: Old Project to New CoderQuest Integration

## Executive Summary
The old Quest_level project uses a sophisticated Alpine.js-based lesson/quiz interface with a sidebar navigation, responsive design, and glassmorphic styling. The new CoderQuest is React-based with Phaser integration. This document outlines the old architecture and provides concrete recommendations for a Lesson Mode that replicates the look/feel while integrating with the modern React stack.

---

## PART 1: OLD PROJECT STRUCTURE ANALYSIS

### 1.1 HTML Layout Architecture (Quest_level/index.html)

**Overall Structure:**
- **Header**: Fixed navigation with hamburger (mobile) and collapse toggle (desktop)
- **Sidebar**: Collapsible lesson/quiz segment navigator (360px → 100px when collapsed)
- **Main Content Area**: Renders lesson topics or quiz questions
- **Controls**: Desktop controls (buttons) + mobile footer with NPC avatar + buttons
- **NPC Pin**: Avatar display (bottom of sidebar desktop, or in mobile footer)

**Key Layout Components:**

1. **Header** (`<header class="header">`)
   - Hamburger button (mobile-only)
   - Title display with dynamic quest name
   - Collapse sidebar button (desktop-only)

2. **Mobile Dropdown** (`<div class="mobile-dropdown">`)
   - Overlays entire page, closes with `@click.away`
   - Shows navigation list with segment status (locked/unlocked)
   - Replaces sidebar on screens <900px

3. **Sidebar** (`<aside class="sidebar">`)
   - Contains nav items for lesson segments
   - Active state indicator
   - Locked/unlocked styling
   - NPC avatar pinned at bottom (fixed height 170px)
   - Collapses to 100px width

4. **Main Content** (`<main class="main">`)
   - Flex column layout with gap
   - Renders three segment types:
     - **TOPIC**: `x-if="currentSegment.type==='topic'"` - displays title + HTML content
     - **QUIZ-MULTICHOICE**: Multiple choice with choice selection UI
     - **QUIZ-IDENTIFICATION/FILLBLANKS**: Text input quiz

5. **Controls**
   - **Desktop Controls**: "Go back" button + "Submit"/"Proceed" buttons
   - **Mobile Footer**: Avatar (left 50%) + stacked buttons (right 50%)

### 1.2 Segment Types & Quiz Patterns

**Topic Segments:**
```html
<h2>{{title}}</h2>
<div>{{content | html}}</div>
```
- Simple title + rich HTML content display
- No interaction required

**Quiz Multichoice:**
- Shows one question at a time (`x-show="qaIndex===qi"`)
- Choice options as clickable divs with selection state
- Submit/Next button flow
- Result feedback (correct/incorrect with answer display)

**Quiz Identification/Fillblanks:**
- Text input field
- Submission shows result with correct answer if wrong

**State Management (Alpine.js):**
- `currentIndex`: Currently selected segment
- `qaIndex`: Current question index (for one-at-a-time display)
- `userAnswers`: Map of question ID → user's answer
- `submitted`: Map of question ID → submission state
- `correctMap`: Map of question ID → correctness boolean
- `unlocked`: Array tracking which segments are unlocked

### 1.3 Styling Architecture (SCSS)

**Color Palette (_variables.scss):**
```scss
--bg: #0b1220;              // Deep blue-black
--panel: rgba(12,16,24,0.92);  // Semi-transparent panel
--muted: #9aa7bd;           // Muted gray-blue
--accent: #10b981;          // Green accent
--accent-2: #6366f1;        // Purple/indigo accent
--text: #e6eef8;            // Light text
--glass-border: rgba(148,163,184,0.10);  // Subtle border
--radius: 14px;
```

**Key SCSS Features:**
1. **Glassmorphism**: Semi-transparent panels with subtle borders
2. **Responsive Breakpoint**: `$bp-desktop: 900px`
3. **Sidebar Collapse**: Smooth transition, semantic width changes
4. **Component Modular Structure**:
   - `_buttons.scss`: Base button, primary, important, icon-btn styles
   - `_sidebar.scss`: Sidebar layout with collapse animation
   - `_content.scss`: Main content area with gradient background
   - `_quiz.scss`: Quiz choice styling, result states (correct/incorrect)
   - `_npc.scss`: Avatar styling with pixelated rendering
   - `_nav.scss`: Navigation items with active/locked states
   - `_footer.scss`: Mobile footer layout
   - `_header.scss`: Header with responsive visibility

**Button Variants:**
- `.btn`: Base button with padding, radius, transitions
- `.btn.primary`: Green accent background (#10b981), dark text, bold
- `.btn.important`: Orange background (#f59e0b), dark text
- `.icon-btn`: Small 40px square buttons with subtle border

**Quiz Choice Styling:**
- Default: Transparent with subtle border
- Selected: Purple outline (rgba(99,102,241,0.18)) + semi-transparent background
- Result Correct: Green background + border (rgba(16,185,129,0.12)) with green text
- Result Incorrect: Red background (rgba(244,63,94,0.08)) with pink text

**Content Area:**
- Gradient background: `linear-gradient(180deg, rgba(255,255,255,0.02), transparent)`
- Glass border effect with `--glass-border`
- Dark theme with light text
- Auto-scrolling overflow

### 1.4 Responsive Design

**Breakpoint: 900px (max-width)**
- Sidebar: `display: none !important`
- Desktop controls: `display: none !important`
- Mobile footer: `display: block` with margin-top
- App: Gets 12px padding

**Desktop Layout (>900px):**
- Container: flex row with sidebar + main
- Sidebar: 360px (or 100px collapsed)
- Main: Flex 1, grows to fill space
- Desktop controls always visible

**Mobile Layout (<900px):**
- Sidebar: Hidden
- Mobile dropdown: Overlays from top
- Footer: Fixed position at bottom with avatar + controls
- Hamburger menu in header

### 1.5 Accessibility & UX Features

1. **Keyboard Navigation**:
   - Number keys (1-9) for quick choice selection
   - Escape to close
   - Spacebar to skip typing effects

2. **Visual Feedback**:
   - Active segment highlighting in sidebar
   - Locked segment indication (visual + disabled state)
   - Result colors (green/red) with text confirmation

3. **Animation**:
   - Sidebar collapse transition (0.22s ease)
   - Smooth state transitions
   - Mobile dropdown x-transition

4. **Progress Tracking**:
   - "Question X/Y" indicator
   - Quest progress in title
   - Unlocked segments advancement

---

## PART 2: CURRENT CODERQUEST IMPLEMENTATION ANALYSIS

### 2.1 LessonViewer Component

**Current Implementation:**
```jsx
- Event-driven: Listens for EVENTS.LESSON_SHOW
- Renders overlay modal with lesson content
- Features: Title, HTML content, Continue button
- State: lesson data, visibility flag
```

**Limitations:**
- Simple overlay modal (not full-page lesson mode)
- No navigation between lessons
- No progress tracking
- No sidebar/segment structure
- No NPC integration
- Fixed to center of screen

### 2.2 QuizInterface Component

**Current Implementation:**
```jsx
- Event-driven: Listens for EVENTS.QUIZ_SHOW
- Displays all questions on one page (OR one at a time, TBD by implementation)
- Features: Multiple choice, scoring, pass/fail, retry logic
- State: quiz data, selected answers, results
```

**Limitations:**
- All questions visible at once (not one-at-a-time like old)
- Limited visual feedback compared to old design
- No sidebar/segment navigation
- Modal-only, doesn't feel like full lesson mode
- No NPC avatar display

### 2.3 DialogBox Component

**Current Implementation:**
```jsx
- Event-driven: Listens for EVENTS.DIALOG_SHOW
- Loads dialog JSON from /content/dialogs/
- Features: NPC portrait, typing effect, choices, tree-based navigation
- State: dialog data, current node, display text, typing progress
```

**Notable Features:**
- Typing effect (30ms per character)
- Choice-based branching dialog
- Skip typing with click or spacebar
- NPC portrait display (loads from /assets/portraits/)
- Proper game pause/resume on dialog show/close

### 2.4 Current Styling Approach

**lesson.scss:**
- Full-screen dark overlay (0.8 opacity)
- 800px max-width modal in center
- Dark background (#333) with light text
- Limited color scheme

**quiz.scss:**
- Similar overlay approach
- 800px max-width modal
- Dark background (#2c3e50)
- Option buttons with hover/selected states
- Result display (pass/fail)

**Issues:**
- Both are modal-only (not full-page lesson mode)
- No glassmorphic styling like old project
- Limited responsive design
- No NPC integration
- No sidebar navigation
- Color scheme doesn't match old project's sophistication

---

## PART 3: KEY DIFFERENCES & GAP ANALYSIS

| Aspect | Old Project | New Project | Gap |
|--------|-------------|-------------|-----|
| **Layout** | Full-page with sidebar + main | Modal overlay only | Need full-page lesson mode with sidebar |
| **Navigation** | Sidebar segment list | None (linear progression) | Need quest segment navigator |
| **Quiz Display** | One question at a time | All questions visible | Should support both modes |
| **NPC Integration** | Avatar pinned in sidebar/footer | None in lessons/quiz | Need to integrate NPC display |
| **Styling** | Glassmorphic, dark theme | Basic modal styling | Need to upgrade to match design system |
| **Responsiveness** | Mobile dropdown overlay | Fixed modal | Need responsive behavior |
| **Progress Tracking** | Unlocked segments, question counter | Minimal | Need full progress display |
| **Keyboard Navigation** | Number keys, escape, spacebar | Minimal | Need full keyboard support |
| **Animation** | Sidebar collapse, transitions | Basic modal fade | Need more sophisticated animations |
| **Color Scheme** | Indigo/green/glass accents | Teal/gray/blue | Align with design tokens |

---

## PART 4: RECOMMENDED "LESSON MODE" STRUCTURE

### 4.1 Architecture Overview

**Proposed Lesson Mode = Full-page persistent interface**
- Available from game HUD (button to enter "Lesson Mode")
- Pauses game when active
- Replaces main game view (or overlays transparently)
- Contains: Sidebar navigator + main lesson/quiz area + NPC character
- Can return to game or progress through lessons sequentially

**Key Principle**: Lesson Mode is a **distinct game state** (like a pause menu) that users enter explicitly, not a modal popup.

### 4.2 Component Hierarchy

```
LessonMode (New container)
├── LessonHeader
│   ├── Title (quest title)
│   ├── Hamburger (mobile)
│   └── Collapse toggle (desktop)
├── Container (flex row)
│   ├── LessonSidebar
│   │   ├── SegmentNav
│   │   │   └── SegmentItem[] (topic, quiz, locked states)
│   │   └── NPCAvatar (pinned at bottom)
│   └── LessonMain
│       ├── LessonContent (for topics)
│       └── LessonQuiz (for quizzes)
├── LessonControls (desktop)
│   ├── Back button
│   └── Submit/Proceed buttons
└── LessonFooter (mobile)
    ├── NPCAvatar
    └── Controls (stacked buttons)
```

### 4.3 Data Structure

**LessonModeState:**
```javascript
{
  isActive: boolean,
  questId: string,
  segments: Array<{
    seg_id: string,
    seg_name: string,
    type: 'topic' | 'quiz-multichoice' | 'quiz-identification',
    title: string,
    content: string (for topics),
    quiz_data: {...} (for quizzes),
    unlocked: boolean,
    completed: boolean
  }>,
  currentSegmentIndex: number,
  npcId: string,
  npcName: string,
  npcPortrait: string,
  progress: {
    segmentsCompleted: number,
    totalSegments: number
  }
}
```

### 4.4 React Components to Create

#### 1. **LessonMode.jsx** (Main Container)
```jsx
// Replaces/augments LessonViewer & QuizInterface
// Manages state, navigation, quiz logic
// Handles game pause/resume
// Responsive layout with sidebar

State:
- segments (from quest data)
- currentSegmentIndex
- quiz state (selected answers, results)
- sidebar collapsed state
- mobile nav open state

Events:
- LESSON_MODE_START: Enter lesson mode with quest
- LESSON_MODE_EXIT: Return to game
- SEGMENT_COMPLETE: Advance to next segment
- LESSON_MODE_COMPLETE: All segments done
```

#### 2. **LessonHeader.jsx**
```jsx
// Styled similar to old project header
// Quest title in center
// Hamburger (mobile) + collapse toggle (desktop)

Props:
- title: quest title
- onToggleSidebar: collapse/expand handler
- onToggleMobileNav: mobile menu handler
- sidebarCollapsed: boolean
- isMobile: boolean
```

#### 3. **LessonSidebar.jsx**
```jsx
// Collapsible navigation sidebar
// Segment list with active/locked indicators
// NPC avatar pinned at bottom

Props:
- segments: Array of segment objects
- currentIndex: active segment
- onSelectSegment: navigation handler
- npcPortrait: URL to NPC avatar
- collapsed: boolean
- isMobile: boolean
```

#### 4. **SegmentItem.jsx**
```jsx
// Individual segment in sidebar nav list
// Shows segment type, title, locked/active state

Props:
- segment: segment data
- isActive: boolean
- isLocked: boolean
- onSelect: click handler
- index: segment index
```

#### 5. **LessonContent.jsx**
```jsx
// Renders topic segment
// Displays title + rich HTML content
// Similar to old project topic rendering

Props:
- segment: topic segment data
- onContinue: handler for next button
```

#### 6. **LessonQuizContainer.jsx**
```jsx
// Enhanced QuizInterface replacement
// Shows one question at a time OR all questions (configurable)
// Result display and scoring
// Better visual feedback

Props:
- segment: quiz segment data
- onComplete: handler when quiz finished
- onPrevious: go back handler
- mode: 'one-at-a-time' | 'all-visible'
```

#### 7. **LessonFooterMobile.jsx**
```jsx
// Mobile-only footer with avatar + controls
// Mimics old project mobile footer layout

Props:
- npcPortrait: URL
- onBack: back button handler
- onProceed: proceed button handler
```

#### 8. **LessonControls.jsx**
```jsx
// Desktop-only button bar
// Back, Submit, Proceed buttons with proper states

Props:
- onBack: handler
- onSubmit: handler
- onProceed: handler
- canBack: boolean
- canSubmit: boolean
- canProceed: boolean
- isQuiz: boolean
```

### 4.5 SCSS Structure

**New Files to Create:**

1. **lesson-mode.scss** (Main container styles)
   - Glassmorphic background + container
   - Flex layout for sidebar + main
   - Header styling
   - Responsive breakpoints

2. **lesson-sidebar.scss** (Sidebar navigation)
   - Collapsible width transitions
   - Nav item styling with active/locked states
   - NPC avatar pin at bottom

3. **lesson-content.scss** (Topic display)
   - Rich content typography
   - Code block styling
   - Spacing/padding

4. **lesson-quiz-container.scss** (Quiz display)
   - Question block styling
   - Choice button states (default, selected, result)
   - Result feedback styling (green/red)
   - Progress indicators

5. **lesson-controls.scss** (Button bars)
   - Desktop control layout
   - Mobile footer layout
   - Button spacing and states

**Color Scheme (Import from design tokens):**
```scss
// Use old project's sophisticated palette
$bg: #0b1220;
$panel: rgba(12,16,24,0.92);
$muted: #9aa7bd;
$accent: #10b981;
$accent-2: #6366f1;
$text: #e6eef8;
$glass-border: rgba(148,163,184,0.10);

// Glass effect mixins
@mixin glass-panel {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
  border: 1px solid $glass-border;
  border-radius: 14px;
  backdrop-filter: blur(10px);
}

@mixin button-base {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}
```

---

## PART 5: FEATURE SUGGESTIONS & ENHANCEMENTS

### 5.1 NPC Animations & Walking Patterns

**Current State**: NPC avatar is static image display

**Enhancement Options**:

1. **Simple Sprite Animation**
   - Store NPC sprite sheet URL
   - Use CSS animations or Phaser animation on static image
   - Idle animation loop (subtle)
   - Reaction animation on milestone completion

2. **NPC Movement in Lesson Mode**
   ```javascript
   // NPCAnimation states:
   - IDLE: Standing still, breathing animation
   - WALKING_IN: Enters from side on lesson start
   - HIGHLIGHTING: Bounces/glows on interaction
   - CELEBRATING: Jump/spin on quiz complete
   ```

3. **Phaser Integration Approach** (Best for consistency)
   - Create Phaser scene for NPC display
   - Embedded in lesson sidebar as small scene
   - Use game's sprite assets
   - Trigger animations from lesson state changes

**Implementation Recommendation:**
```jsx
<NPCCharacter 
  npcId={npcId}
  state="idle" // idle, walking_in, highlight, celebrate
  onAnimationComplete={handleNPCAnimationDone}
/>
```

### 5.2 Interactive Lesson Features

1. **Lesson Progress Indicators**
   - Visual progress bar showing segment completion
   - Milestone badges earned
   - Unlock hints for locked segments

2. **Hint System**
   - NPC provides hints during quiz
   - Limited hints per quiz (e.g., 2)
   - Penalty for using hints (reduced score)

3. **Note-Taking**
   - Sidebar collapsible notes panel
   - Users can take notes during lessons
   - Notes persist in SaveManager

4. **Lesson Review Mode**
   - After lesson complete, can review all segments
   - Can retry quizzes for better score
   - Archive learning progress

### 5.3 Mobile Enhancement Ideas

1. **Swipe Navigation**
   - Swipe left/right to go to previous/next segment
   - Mobile-friendly alternative to buttons

2. **Bottom Sheet for Quiz**
   - Quiz expands from bottom sheet
   - Swipe down to collapse
   - NPC avatar visible above quiz

3. **Simplified Mobile Layout**
   - Single column layout
   - NPC avatar collapsible
   - Larger touch targets for buttons

### 5.4 Accessibility Improvements

1. **ARIA Labels & Roles**
   - Proper semantic HTML
   - Quiz context announced to screen readers
   - Keyboard navigation fully supported

2. **High Contrast Mode**
   - Optional high-contrast color variant
   - Adjustable text size
   - Focus indicators visible

3. **Motion Preferences**
   - Respect `prefers-reduced-motion`
   - Disable animations for users who prefer
   - Essential transitions only

---

## PART 6: CONCRETE IMPLEMENTATION ROADMAP

### Phase 1: Component Structure (Week 1)
- [ ] Create LessonMode.jsx container
- [ ] Create LessonHeader, LessonSidebar, LessonContent
- [ ] Create LessonQuizContainer (enhanced QuizInterface)
- [ ] Wire up event system for LESSON_MODE_START/EXIT
- [ ] Basic responsive layout with breakpoints

### Phase 2: Styling & Polish (Week 2)
- [ ] Create lesson-mode.scss with glassmorphic design
- [ ] Migrate color scheme to match old project
- [ ] Implement sidebar collapse animation
- [ ] Mobile footer and dropdown styling
- [ ] Quiz result feedback styling

### Phase 3: Quiz Logic & State (Week 2-3)
- [ ] Enhanced quiz scoring system
- [ ] One-at-a-time question display
- [ ] Question progress tracking
- [ ] Keyboard navigation (number keys, escape)
- [ ] Result review functionality

### Phase 4: NPC & Animations (Week 3)
- [ ] NPC character display in sidebar
- [ ] Basic idle animation
- [ ] Walking-in animation on mode start
- [ ] Celebration animation on segment complete

### Phase 5: Mobile & Accessibility (Week 4)
- [ ] Test mobile layout at breakpoints
- [ ] Implement swipe navigation
- [ ] ARIA labels and semantic HTML
- [ ] Keyboard navigation complete

### Phase 6: Advanced Features (Week 4+)
- [ ] Note-taking system
- [ ] Hint system for quizzes
- [ ] Lesson review mode
- [ ] Progress persistence in SaveManager

---

## PART 7: MIGRATION CHECKLIST

**From Old Project to New Integration:**

Data Format:
- [ ] Ensure quest JSON in `/public/content/quest_*.json` matches segment structure
- [ ] Segment objects have: seg_id, seg_name, type, title, content/quiz_data, unlocked
- [ ] Quiz data includes: questions[], questions[i] has: questionText, options[], correctIndex, answerDisplay

Components:
- [ ] Remove old LessonViewer (replace with LessonMode)
- [ ] Remove old QuizInterface (enhance into LessonQuizContainer)
- [ ] Keep DialogBox (can coexist with LessonMode)
- [ ] Deprecate simple modal approach

Styling:
- [ ] Import glassmorphic design tokens
- [ ] Create lesson-*.scss files with modular structure
- [ ] Use old project color palette
- [ ] Match responsive breakpoints (900px)

Events:
- [ ] Create LESSON_MODE_START event
- [ ] Create LESSON_MODE_EXIT event
- [ ] Ensure SEGMENT_COMPLETE fires correctly
- [ ] Hook SaveManager for progress persistence

Testing:
- [ ] Desktop layout (>900px) with sidebar, controls
- [ ] Mobile layout (<900px) with dropdown, footer
- [ ] Sidebar collapse/expand animation
- [ ] Quiz navigation and scoring
- [ ] Keyboard shortcuts (number keys, escape)
- [ ] NPC animations trigger correctly

---

## PART 8: CODE EXAMPLE SNIPPETS

### LessonMode.jsx (Skeleton)
```jsx
import React, { useState } from 'react';
import useGameEvent from '../hooks/useGameEvent';
import { EVENTS } from '../../shared/events';
import EventBus from '../../shared/EventBus';
import LessonHeader from './LessonHeader';
import LessonSidebar from './LessonSidebar';
import LessonContent from './LessonContent';
import LessonQuizContainer from './LessonQuizContainer';
import LessonControls from './LessonControls';
import LessonFooterMobile from './LessonFooterMobile';

const LessonMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [segments, setSegments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [npcData, setNpcData] = useState(null);
  const [quizState, setQuizState] = useState(null);

  useGameEvent(EVENTS.LESSON_MODE_START, ({ quest, npc }) => {
    setSegments(quest.segments);
    setCurrentIndex(0);
    setNpcData(npc);
    setIsActive(true);
    EventBus.emit(EVENTS.GAME_PAUSE);
  });

  const handleExit = () => {
    setIsActive(false);
    EventBus.emit(EVENTS.GAME_RESUME);
  };

  const handleSegmentComplete = () => {
    if (currentIndex < segments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      EventBus.emit(EVENTS.LESSON_MODE_COMPLETE);
      handleExit();
    }
  };

  if (!isActive) return null;

  const currentSegment = segments[currentIndex];

  return (
    <div className="lesson-mode">
      <LessonHeader 
        title="Active Quest"
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
      />

      {mobileNavOpen && <LessonMobileDropdown 
        segments={segments}
        currentIndex={currentIndex}
        onSelect={(idx) => { setCurrentIndex(idx); setMobileNavOpen(false); }}
      />}

      <div className="lesson-container">
        {!isMobile && <LessonSidebar
          segments={segments}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
          npcPortrait={npcData?.portrait}
          collapsed={sidebarCollapsed}
        />}

        <main className="lesson-main">
          <section className="lesson-content-area">
            {currentSegment?.type === 'topic' && (
              <LessonContent segment={currentSegment} />
            )}
            {currentSegment?.type.includes('quiz') && (
              <LessonQuizContainer 
                segment={currentSegment}
                onComplete={handleSegmentComplete}
              />
            )}
          </section>

          {!isMobile && <LessonControls
            onBack={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            onProceed={handleSegmentComplete}
            canBack={currentIndex > 0}
            canProceed={true}
            isQuiz={currentSegment?.type.includes('quiz')}
          />}
        </main>
      </div>

      {isMobile && <LessonFooterMobile
        npcPortrait={npcData?.portrait}
        onBack={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
        onProceed={handleSegmentComplete}
      />}
    </div>
  );
};

export default LessonMode;
```

### lesson-mode.scss (Skeleton)
```scss
@use '../styles/variables' as *;

.lesson-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $bg 0%, darken($bg, 10%) 100%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: $text;
  font-family: $font-family-base;
}

.lesson-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(12, 16, 24, 0.95);
  border-bottom: 1px solid $glass-border;
  flex-shrink: 0;
  height: 70px;
}

.lesson-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 12px;
  padding: 12px;
}

.lesson-sidebar {
  width: 360px;
  transition: width 0.22s ease;
  flex-shrink: 0;
  
  &.collapsed {
    width: 100px;
  }
}

.lesson-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.lesson-content-area {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
  border: 1px solid $glass-border;
}

/* Mobile layout */
@media (max-width: 900px) {
  .lesson-container {
    flex-direction: column;
  }
  
  .lesson-sidebar {
    display: none;
  }
  
  .lesson-main {
    width: 100%;
  }
  
  .lesson-footer-mobile {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-top: 1px solid $glass-border;
    background: rgba(12, 16, 24, 0.95);
    margin-top: auto;
  }
}

@media (min-width: 901px) {
  .lesson-footer-mobile {
    display: none;
  }
}
```

---

## Summary

**Old Project Architecture:**
- Full-page lesson interface with sidebar navigation
- Glassmorphic dark theme with sophisticated color palette
- Responsive layout switching to mobile dropdown at 900px breakpoint
- NPC avatar display in sidebar/footer
- One-at-a-time quiz questions with result feedback
- Keyboard navigation support

**Current CoderQuest Gaps:**
- Modal-only lesson/quiz display (not full-page)
- Missing sidebar navigation
- Limited styling sophistication
- No NPC integration
- No progress tracking UI

**Recommended Lesson Mode:**
- Full-page container that pauses game
- Sidebar + main content layout matching old project design
- Enhanced quiz with one-at-a-time display
- NPC character with animations
- Complete responsive behavior
- Glassmorphic styling with old project's color tokens

**Next Steps:**
- Implement component hierarchy in phases
- Migrate color scheme and styling approach
- Integrate with event system and SaveManager
- Add NPC animations and interactive features
- Test mobile responsiveness and accessibility

