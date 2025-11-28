# Phase 8: Testing & Validation Checklist

## Manual QA: Responsive Game Mode

### Desktop (1200+px)
- [ ] Game starts, map centered
- [ ] Camera zoom = 2
- [ ] Window resize works smoothly
- [ ] No jank or stuttering
- [ ] HUD elements visible and positioned correctly
- [ ] Player movement (WASD/arrows) responsive

### Tablet (768–1199px)
- [ ] Game starts, map centered
- [ ] Camera zoom = 1.5
- [ ] UI overlays don't obscure game
- [ ] Touch controls work (if implemented)
- [ ] Sidebar not visible

### Mobile (<768px)
- [ ] Game starts, map centered
- [ ] Camera zoom = 1
- [ ] No horizontal overflow
- [ ] Portrait/landscape both work
- [ ] Footer visible on mobile
- [ ] Controls responsive to screen size

## Manual QA: Game Pause/Resume

- [ ] Open dialog → game pauses
- [ ] Close dialog → game resumes
- [ ] Open lesson → game pauses
- [ ] Close lesson → game resumes
- [ ] Open quiz → game pauses
- [ ] Submit quiz → stays paused until confirmed
- [ ] Rapid interactions don't create multiple dialogs
- [ ] Player cannot move while paused

## Manual QA: Lesson Mode

- [ ] Lesson Mode displays full-screen
- [ ] Sidebar visible on desktop (1024+px)
- [ ] Footer visible on mobile (<1024px)
- [ ] Segments navigator shows all segments
- [ ] Current segment highlighted
- [ ] Segment titles display correctly
- [ ] NPC avatar and name display
- [ ] Navigation between segments works
- [ ] Quiz displays one question at a time (if included)
- [ ] Quiz answers save to each question
- [ ] Quiz submit validates all answered
- [ ] Results show score and pass/fail status
- [ ] Close button (Esc, button click) works
- [ ] Game resumes after lesson closes
- [ ] Progress bar updates smoothly

## Manual QA: Persistence & Security

- [ ] Player position saved to localStorage
- [ ] Quiz state persists on page reload
- [ ] HTML content sanitized (no XSS visible)
- [ ] Old saves (v1) migrate to v2 without error
- [ ] DOMPurify prevents malicious HTML rendering
- [ ] No console errors on startup
- [ ] No console warnings about deprecated functions

## Manual QA: Input Handling

- [ ] Keyboard navigation works (arrows, WASD)
- [ ] Interaction cooldown prevents rapid double-triggers
- [ ] E key activates NPCs/portals correctly
- [ ] Esc key closes dialogs/lessons/quizzes
- [ ] Number keys (1-9) work in quiz choices
- [ ] Spacebar advances dialogs (where applicable)

## Manual QA: Visual Polish

- [ ] Glassmorphic effect visible (backdrop blur)
- [ ] Smooth animations on transitions
- [ ] Colors match design spec (dark teal, green accents)
- [ ] Text is readable on all backgrounds
- [ ] No overlapping UI elements
- [ ] Icons/buttons have hover states
- [ ] Loading states display correctly
- [ ] Error messages are clear

## Browser Compatibility

- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest (if applicable)
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

## Performance

- [ ] Dev console shows no errors
- [ ] Dev console shows no warnings (except expected Sass deprecations)
- [ ] No memory leaks on console (check growth over time)
- [ ] Page load time < 3 seconds
- [ ] Interactions responsive (no lag)
- [ ] Scrolling smooth in lesson mode

## Accessibility

- [ ] Keyboard navigation possible without mouse
- [ ] Text contrast sufficient (WCAG AA standard)
- [ ] Buttons have clear labels
- [ ] Focus states visible
- [ ] Error messages associated with form fields

## Test Results Summary

| Category | Status | Notes |
|----------|--------|-------|
| Responsive Game Mode | ☐ | |
| Game Pause/Resume | ☐ | |
| Lesson Mode | ☐ | |
| Persistence | ☐ | |
| Security | ☐ | |
| Input Handling | ☐ | |
| Visual Polish | ☐ | |
| Browser Compat | ☐ | |
| Performance | ☐ | |
| Accessibility | ☐ | |

## Known Issues / Follow-ups

- [ ] Phaser bundle size large (1.4MB minified) - consider code splitting
- [ ] Sass deprecation warnings - update to latest Sass best practices
- [ ] Consider adding loading screen for quest data fetching
- [ ] Mobile viewport might benefit from touch gesture support
- [ ] Consider PWA support for offline play

## Test Date: _______________
## Tested By: _______________
## Final Status: ☐ PASS / ☐ FAIL
