1-DAY SPRINT: Ultra-Detailed Task Orchestration Checklist
Team: 3-person (Developer, Asset Creator, Content Creator)
Timeline: 8 hours
Reference: coderquest.md architecture document

🎯 ORCHESTRATION STRUCTURE
Each task follows:

[Hour.Task] Task Name
Role | Time | Doc Reference | Keywords
Quick Goal (1 sentence)
Done When (checklist)
⚠️ Blocked? → Where to deep dive in the doc


HOUR 0-1: FOUNDATION SETUP
[0.1] Project Scaffolding & Folder Structure
👤 Role: Developer | ⏱️ 15min
📚 Doc: Section 8 - Phase 1, Iteration 1.1 | 🔍 "folder structure", "Vite setup", "scaffolding"
Goal: Get blank Vite + Phaser project running
Done When:

 Vite project created with React template
 Phaser installed via npm
 Folder structure matches Section 8 structure diagram
 npm run dev runs without errors
 Browser shows blank page at localhost:5173

⚠️ Blocked? → See Section 3.1 Core Technologies for exact versions and Section 8 Iteration 1.1 for complete folder tree

[0.2] Minimum Viable Assets
👤 Role: Asset Creator | ⏱️ 30min
📚 Doc: Section 6.2 - Asset Specifications | 🔍 "sprite requirements", "32x32", "PNG format"
Goal: Create 4 essential sprites and 1 tileset
Done When:

 player.png exists in /public/assets/sprites/ (32x32, meets Section 6.2 specs)
 npc.png exists (32x32, static sprite)
 portal.png exists (32x32)
 tiles.png tileset exists in /public/assets/tilesets/ (grid-aligned per Section 6.2)
 All files are PNG format with proper transparency

⚠️ Blocked on specs? → Section 6.2 has exact pixel dimensions, naming conventions, and format requirements

[0.3] First Tiled Map
👤 Role: Asset Creator | ⏱️ 15min
📚 Doc: Section 5.2 - World Data Model, Section 9.3 - Tiled↔Phaser Integration | 🔍 "Tiled", "object properties", "collision layer"
Goal: Create world_01 map with spawn, NPC, and portal
Done When:

 Tiled map exported as JSON to /public/maps/world_01.json
 Has "Ground" layer (visible tiles)
 Has "Walls" layer with collision property set (see Section 9.3)
 Has "Objects" layer with:

 1 spawn point object (name="spawn")
 1 NPC object (type="npc", properties per Section 5.2: npcId, dialogId)
 1 Portal object (type="portal", properties: questId)


 JSON file is valid (test with JSON validator)

⚠️ Blocked on object properties? → Section 9.3 shows exact property format Phaser expects
⚠️ Blocked on layer structure? → Section 5.2 World Data Model defines required layers

[0.4] Educational Content Files
👤 Role: Content Creator | ⏱️ 30min
📚 Doc: Section 5.1 - Quest Data Model, Section 7.1 - Content Types | 🔍 "quest JSON", "milestone structure", "dialog tree"
Goal: Create quest_01 and dialog_intro JSON files
Done When:

 /public/content/quest_01.json exists
 Quest file matches Section 5.1 schema (questId, milestones array)
 Has 1 lesson milestone (type: "lesson") with HTML content
 Has 1 quiz milestone (type: "quiz") with 1-3 questions matching Section 5.1 format
 /public/content/dialog_intro.json exists
 Dialog matches Section 7.1 dialog tree structure (start node, choices array)
 Both files validate as proper JSON

⚠️ Blocked on schema? → Section 5.1 has complete Quest Data Model with required fields
⚠️ Blocked on dialog format? → Section 7.1 Content Types shows dialog tree structure

HOUR 1-2: CORE GAME SYSTEMS
[1.1] Phaser Game Config + Scene Setup
👤 Role: Developer | ⏱️ 30min
📚 Doc: Section 4.1.1 - Scene Architecture, Section 3.1 - Core Technologies | 🔍 "Phaser config", "scene creation", "game instance"
Goal: Get Phaser game rendering with one scene
Done When:

 src/game/config.js created with game config (reference Section 3.1 for settings)
 GameScene created in src/game/scenes/
 Game initialized in src/main.jsx
 Canvas visible in browser (800x600 per Section 4.1.1)
 Console shows Phaser version log, no errors
 Verify: Open DevTools → window.game exists

⚠️ Blocked? → Section 4.1.1 Scene Architecture has initialization order and config structure
⚠️ Canvas not showing? → Check Section 9.1 Phaser↔React Integration for parent container setup

[1.2] Load Tilemap + Render Map
👤 Role: Developer | ⏱️ 20min
📚 Doc: Section 9.3 - Tiled↔Phaser Integration, Section 6.3 - Asset Loading | 🔍 "tilemap loading", "layer rendering", "tileset integration"
Goal: Display the Tiled map in game
Done When:

 Assets loaded in preload() (tileset image, map JSON)
 Map created with this.make.tilemap() in create()
 Ground layer renders visually
 Walls layer renders visually
 Camera bounds set to map size (Section 9.3)
 Verify: Walk around visible map area

⚠️ Map not showing? → Section 9.3 has tileset name matching requirements and coordinate system notes
⚠️ Layers wrong? → Check Section 5.2 for layer naming conventions

[1.3] Player Spawn + Movement
👤 Role: Developer | ⏱️ 25min
📚 Doc: Section 4.1.2 - Game Objects (Player), Section 2.2 - Layer Responsibilities | 🔍 "player entity", "arcade physics", "keyboard input"
Goal: Player sprite moves with arrow keys/WASD
Done When:

 Player sprite spawned at spawn point from map
 Arrow keys control movement (4 directions)
 Player collides with walls layer
 Camera follows player (Section 4.1.2)
 Player stays within map bounds
 Verify: Walk to all 4 edges, hit walls, movement smooth

⚠️ Collision not working? → Section 4.1.2 covers collision body setup and physics properties
⚠️ Spawn point not found? → Section 9.3 shows how to parse map objects

[1.4] Parse NPCs + Portals from Map
👤 Role: Developer | ⏱️ 25min
📚 Doc: Section 4.1.2 - Game Objects (NPC, Portal), Section 9.3 - Custom Objects | 🔍 "object parsing", "custom properties", "NPC spawn"
Goal: NPCs and portals appear on map at correct positions
Done When:

 Code parses Objects layer from Tiled map
 NPCs spawn at correct X,Y (visible in game)
 Portals spawn at correct X,Y
 Custom properties (npcId, dialogId, questId) stored on objects
 Verify: Open DevTools, inspect NPC/Portal game objects have correct data

⚠️ Objects not parsing? → Section 9.3 has exact custom property extraction pattern
⚠️ Properties missing? → Check Section 5.2 for required property names

HOUR 2-3: EVENT SYSTEM + UI INTEGRATION
[2.1] Event Bus Implementation
👤 Role: Developer | ⏱️ 30min
📚 Doc: Section 4.3 - Event Bus Integration | 🔍 "EventBus singleton", "emit", "on", "cross-layer communication"
Goal: Event bus connects Phaser and React
Done When:

 src/shared/EventBus.js created (Section 4.3.2 pattern)
 Has emit(), on(), off() methods
 Event constants defined in src/shared/events.js (Section 4.3.1 core events)
 Test: Emit test event from console, listener receives it
 Verify: window.EventBus.emit('test', {data: 1}) works

⚠️ Blocked? → Section 4.3.2 has complete implementation pattern
⚠️ Memory leaks? → Section 4.3 notes cleanup and off() usage

[2.2] React UI Container + Phaser Mount
👤 Role: Developer | ⏱️ 20min
📚 Doc: Section 4.2 - React UI Module, Section 9.1 - Phaser↔React Integration | 🔍 "component hierarchy", "game container", "UI overlay"
Goal: React overlays can appear over Phaser game
Done When:

 src/ui/App.jsx has game container structure (Section 4.2.1)
 Phaser mounts inside React component
 UI overlay div positioned above game (z-index check)
 Test: Add test <div> over game, verify it's clickable
 Game still runs when React re-renders

⚠️ Blocked? → Section 9.1 shows exact integration pattern and z-index management
⚠️ Game destroyed on re-render? → Check cleanup in Section 9.1

[2.3] Dialog System UI
👤 Role: Developer | ⏱️ 30min
📚 Doc: Section 4.2.2 - DialogSystem Component, Section 7.1 - Dialog Format | 🔍 "dialog component", "conversation display", "choice selection"
Goal: Dialog box appears when player presses E near NPC
Done When:

 DialogBox component created (Section 4.2.2 structure)
 Listens to dialog:show event from EventBus
 Fetches dialog JSON from /public/content/
 Displays NPC text and choice buttons
 Clicking choice navigates dialog tree (Section 7.1)
 Emits dialog:close when done
 Game pauses during dialog (Section 4.3.1)
 Test: Talk to NPC, select choices, dialog closes

⚠️ Dialog tree not working? → Section 7.1 has tree structure and navigation logic
⚠️ Game not pausing? → Section 4.3.1 shows game:pause event pattern

[2.4] NPC Interaction Trigger
👤 Role: Developer | ⏱️ 20min
📚 Doc: Section 4.1.2 - NPC Entity, Section 4.3.1 - Core Events | 🔍 "interaction radius", "E key", "dialog trigger"
Goal: Pressing E near NPC shows dialog
Done When:

 NPC checks distance to player every frame
 Shows "Press E" prompt when player nearby (< 50 pixels per Section 4.1.2)
 E key press emits dialog:show event with dialogId
 Dialog UI receives event and displays
 Test: Walk to NPC → see prompt → press E → dialog appears

⚠️ Distance check not working? → Section 4.1.2 has interaction range logic
⚠️ Event not firing? → Check Section 4.3.1 for event payload structure

HOUR 3-4: QUEST SYSTEM
[3.1] Quest Manager Core
👤 Role: Developer | ⏱️ 35min
📚 Doc: Section 4.1.3 - Quest Manager, Section 5.1 - Quest Data Model | 🔍 "quest state machine", "milestone progression", "quest manager"
Goal: Quest Manager loads and tracks quest progress
Done When:

 src/game/managers/QuestManager.js created
 Loads quest JSON files (Section 5.1 format)
 Tracks active quest and current milestone
 Has startQuest(questId) method
 Has completeMilestone() method
 Emits events per Section 4.3.1 (quest:start, milestone:show)
 Test: Call startQuest('quest_01'), verify event emitted

⚠️ Blocked? → Section 4.1.3 has manager interface and Section 5.1 has data structure
⚠️ State tracking broken? → Review Section 4.1.3 quest state machine

[3.2] Portal Interaction → Start Quest
👤 Role: Developer | ⏱️ 20min
📚 Doc: Section 4.1.2 - Portal Entity, Section 4.3.1 - Events | 🔍 "portal activation", "quest trigger"
Goal: Press E at portal starts quest
Done When:

 Portal checks distance to player
 Shows "Press E" prompt when nearby
 E key triggers portal:activate event
 QuestManager receives event and starts quest
 First milestone event emitted
 Test: Walk to portal → press E → quest starts

⚠️ Portal not triggering? → Section 4.1.2 has activation logic pattern

[3.3] Lesson Viewer Component
👤 Role: Developer | ⏱️ 30min
📚 Doc: Section 4.2.2 - LessonViewer, Section 5.1 - Lesson Content | 🔍 "lesson rendering", "HTML content", "milestone completion"
Goal: Lesson appears as overlay when milestone is lesson type
Done When:

 LessonViewer component created
 Listens to lesson:show event
 Displays lesson title and HTML content (Section 5.1)
 Has "Continue" button
 Button emits milestone:complete event
 Component unmounts after continue
 Test: Start quest → see lesson → click continue → next milestone

⚠️ HTML not rendering? → Section 4.2.2 covers content rendering and Section 5.1 has format
⚠️ Event flow broken? → Trace events through Section 4.3.1

[3.4] Quiz Interface Component
👤 Role: Developer | ⏱️ 35min
📚 Doc: Section 4.2.2 - QuizInterface, Section 5.1 - Quiz Format | 🔍 "quiz questions", "answer validation", "score calculation"
Goal: Quiz appears, validates answers, shows results
Done When:

 QuizInterface component created
 Listens to quiz:show event
 Renders questions and multiple choice options (Section 5.1 format)
 Tracks selected answers
 Validates answers on submit
 Calculates score (Section 5.1 has correctIndex)
 Shows pass/fail based on passing score
 Emits milestone:complete with score
 Test: Take quiz → select answers → submit → see result → continues

⚠️ Validation not working? → Section 5.1 has quiz data structure with correctIndex
⚠️ Score calculation off? → Check Section 4.2.2 for calculation logic

HOUR 4-5: PERSISTENCE + POLISH
[4.1] Save Manager Implementation
👤 Role: Developer | ⏱️ 30min
📚 Doc: Section 4.1.3 - Save Manager, Section 5.3 - Save Data Model | 🔍 "localStorage", "save state", "serialization"
Goal: Progress saves to localStorage
Done When:

 src/game/managers/SaveManager.js created
 Has saveGame() method (Section 5.3 data format)
 Has loadGame() method
 Saves: player position, completed quests, quest progress
 Auto-saves every 30 seconds (Section 4.1.3)
 Saves on quest completion
 Test: Complete quest → refresh page → progress restored

⚠️ Save format wrong? → Section 5.3 has complete Save Data Model schema
⚠️ Load failing? → Check Section 4.1.3 for error handling patterns

[4.2] Load Game on Start
👤 Role: Developer | ⏱️ 20min
📚 Doc: Section 4.1.3 - Save Manager, Section 8 - Phase 2 Iteration 2.2 | 🔍 "game loading", "continue game", "save restoration"
Goal: Game loads saved progress on start
Done When:

 Check localStorage for save on game boot
 If save exists, show "Continue" option
 Load restores player position
 Load restores completed quests
 Load restores active quest state
 Test: Save → close → reopen → continue → everything restored

⚠️ State not restoring? → Section 5.3 shows what data to save/load
⚠️ Quest state broken? → Check Section 4.1.3 for state restoration

[4.3] Basic HUD Display
👤 Role: Developer | ⏱️ 25min
📚 Doc: Section 4.2.2 - HUD Component, Section 8 - Phase 3 Iteration 3.2 | 🔍 "quest tracker", "HUD overlay", "progress display"
Goal: HUD shows current quest and progress
Done When:

 HUD component created (Section 4.2.2)
 Shows current quest title
 Shows milestone progress (e.g., "2/3 milestones")
 Updates in real-time via events
 Positioned at bottom of screen
 Test: Start quest → HUD updates → complete milestone → HUD updates

⚠️ HUD not updating? → Check event listeners in Section 4.2.2
⚠️ Layout broken? → Section 4.2.2 has styling notes

[4.4] Audio System (if time permits)
👤 Role: Developer | ⏱️ 25min
📚 Doc: Section 4.1.3 - Audio Manager, Section 8 - Phase 3 Iteration 3.2 (Audio) | 🔍 "sound effects", "background music", "audio playback"
Goal: Basic sound effects play
Done When:

 AudioManager created (Section 4.1.3 pattern)
 Quest complete SFX plays
 Dialog open SFX plays
 Volume controls work
 Settings persist in localStorage
 Test: Complete quest → hear sound

⚠️ Audio not playing? → Section 4.1.3 has loading and playback patterns
⚠️ Volume not saving? → Check Section 4.1.3 for settings persistence

HOUR 5-6: CONTENT EXPANSION
[5.1] Create 2 More Quests
👤 Role: Content Creator | ⏱️ 40min
📚 Doc: Section 5.1 - Quest Data Model, Section 7.2 - Content Creation Workflow | 🔍 "quest design", "difficulty progression", "educational content"
Goal: 3 total quests with progressive difficulty
Done When:

 quest_02.json created (intermediate difficulty)
 quest_03.json created (harder difficulty)
 Each has 2-3 milestones (mix of lessons and quizzes)
 Educational content is accurate (Section 7.2)
 Follows difficulty curve guidelines (Section 7.2)
 All JSON files validate

⚠️ Difficulty unclear? → Section 7.2 has content creation workflow and progression guidance
⚠️ Schema issues? → Reference Section 5.1 for required fields

[5.2] Additional NPC Dialogs
👤 Role: Content Creator | ⏱️ 20min
📚 Doc: Section 7.1 - Dialog Types, Section 8 - Phase 2 Iteration 2.2 (NPC Dialogs) | 🔍 "dialog writing", "conversation trees", "NPC personality"
Goal: 2-3 more NPC dialogs
Done When:

 dialog_helper.json created (gives hints)
 dialog_quest_giver.json created (introduces quest 02/03)
 Each has start node and at least 2 choices
 Dialog trees work without dead ends
 Personality distinct per NPC (Section 7.1)

⚠️ Tree structure broken? → Section 7.1 shows dialog tree format
⚠️ Writing quality? → See Section 7.2 for content guidelines

[5.3] Place New NPCs + Portals in Tiled
👤 Role: Asset Creator | ⏱️ 20min
📚 Doc: Section 5.2 - World Data Model, Section 9.3 - Object Properties | 🔍 "NPC placement", "quest portals", "map objects"
Goal: Map has 3 quest portals and 3 NPCs
Done When:

 2 more NPCs added to map Objects layer
 Each NPC has correct properties (npcId, dialogId per Section 5.2)
 2 more portals added (one for quest_02, one for quest_03)
 Portals have questId properties
 NPCs positioned logically (not overlapping)
 Test: Load map in game, all objects appear

⚠️ Properties not working? → Section 9.3 has exact property format
⚠️ Objects not spawning? → Check Section 5.2 for naming requirements

[5.4] Visual Polish on Map
👤 Role: Asset Creator | ⏱️ 20min
📚 Doc: Section 6.1 - Asset Categories, Section 7.3 - Level Design | 🔍 "decorations", "environmental storytelling", "map aesthetics"
Goal: Map looks more interesting
Done When:

 Decorations layer added (trees, rocks, etc.)
 Visual variety in terrain
 Clear paths guide player to objectives
 No visual clutter blocking gameplay
 Verify: Map is aesthetically pleasing and clear

⚠️ Performance issues? → Section 6.3 has asset optimization notes
⚠️ Layout unclear? → Section 7.3 discusses level design principles

HOUR 6-7: TESTING + BUG FIXES
[6.1] Full Playthrough Testing
👤 Role: ALL TEAM | ⏱️ 30min
📚 Doc: Section 10.1 - Testing Responsibilities, Section 8 - Integration Checkpoints | 🔍 "QA testing", "user flows", "edge cases"
Goal: Complete all 3 quests without bugs
Test Checklist:

 Can start game
 Player movement smooth
 Can talk to all NPCs
 All dialogs work
 Can start all 3 quests
 All lessons display correctly
 All quizzes work and validate
 Quest progress saves
 Can reload and continue
 HUD updates correctly
 No console errors
 No crashes

⚠️ Found bugs? → Document and prioritize using Section 10.1 guidelines

[6.2] Bug Triage + Fixes
👤 Role: Developer | ⏱️ 40min
📚 Doc: Section 10.1 - Testing Responsibilities, Section 8 - Phase 4 Bug Fixes | 🔍 "bug priority", "critical fixes", "regression testing"
Goal: Fix all P0/P1 bugs
Process:

 List all bugs found in [6.1]
 Prioritize: P0 (breaks game), P1 (major issue), P2 (minor)
 Fix P0 bugs first
 Fix P1 bugs if time allows
 Regression test after each fix
 Verify: Re-run [6.1] test checklist after fixes

⚠️ Can't find bug cause? → Use Section 10.1 debugging strategies
⚠️ Fix breaks something else? → Check integration points in Section 9

[6.3] Performance Check
👤 Role: Developer | ⏱️ 20min
📚 Doc: Section 10.2 - Performance Metrics, Section 8 - Phase 4 Optimization | 🔍 "frame rate", "memory usage", "load times"
Goal: Game runs smoothly
Metrics to Check:

 Frame rate: 60fps stable (Section 10.2 target)
 Load time: < 3 seconds initial load
 No memory leaks over 5 minutes play
 Smooth transitions between scenes
 Quiz/lesson load instantly

Tools:

Chrome DevTools Performance tab
Check FPS in Phaser debug mode
Memory profiler for leaks

⚠️ Performance issues? → Section 10.2 has optimization strategies
⚠️ Memory leaks? → Check event listener cleanup in Section 4.3

HOUR 7-8: DEPLOYMENT + DOCUMENTATION
[7.1] Build Optimization
👤 Role: Developer | ⏱️ 20min
📚 Doc: Section 12.1 - Phase 1-2 Deployment, Section 3.3 - Build Tools | 🔍 "production build", "bundle optimization", "Vite config"
Goal: Optimized production build
Done When:

 Run npm run build
 Build completes without errors
 Bundle size reasonable (< 5MB per Section 10.2)
 Test build with npm run preview
 Preview version works identically to dev

⚠️ Build errors? → Check Section 12.1 for common build issues
⚠️ Bundle too large? → Section 6.3 has asset optimization strategies

[7.2] Deploy to Hosting
👤 Role: Developer | ⏱️ 25min
📚 Doc: Section 12.1 - Static Hosting Deployment | 🔍 "Vercel", "Netlify", "deployment pipeline"
Goal: Game live on public URL
Done When:

 Choose platform (Vercel/Netlify recommended in Section 12.1)
 Connect GitHub repo (if using)
 Configure build settings (build command: npm run build, output: dist)
 Deploy completes successfully
 Test live URL - all features work
 Share URL with team for final test

⚠️ Deploy failing? → Section 12.1 has deployment troubleshooting
⚠️ Assets not loading? → Check public folder paths and Section 6.3

[7.3] Write Basic README
👤 Role: Developer + Content Creator | ⏱️ 20min
📚 Doc: Section 13 - Expansion Points (Documentation section) | 🔍 "user guide", "game instructions", "README"
Goal: Players know how to play
README Must Have:

 Game title and description
 How to play (controls: arrow keys, E to interact)
 Learning objectives (what topics covered)
 Credits (team members, asset sources)
 Link to live game
 (Optional) Development setup instructions

Template location: See Section 13 documentation patterns
⚠️ Need structure? → Section 13 has documentation templates

[7.4] Final Team Playthrough
👤 Role: ALL TEAM | ⏱️ 15min
📚 Doc: Section 8 - Launch Checklist | 🔍 "final testing", "launch preparation", "smoke test"
Goal: Confirm everything works in production
Final Checks:

 Load live URL on different browsers (Chrome, Firefox, Safari)
 Complete one full quest from start to finish
 Save and reload works
 No console errors
 Mobile check (if accessible - does it load?)
 All team members approve quality

Launch Decision:

 All P0 bugs fixed
 Core gameplay loop works
 Educational content accurate
 🚀 READY TO LAUNCH

⚠️ Last-minute issues? → Decide: fix now or document as known issue

🎉 POST-LAUNCH (After 8 hours)
[8.1] Gather Feedback
📚 Doc: Section 15 - Post-Launch Iteration

 Share with test users
 Collect feedback on difficulty, bugs, UX
 Document requested features
 Plan next iteration

[8.2] Retrospective
📚 Doc: Section 12 - Iteration Retrospective Template

 What went well?
 What was challenging?
 What to improve next time?
 Update task estimates for future


🆘 EMERGENCY REFERENCE GUIDE
If completely blocked, refer to these key sections:

Game won't run: Section 3.1 (Tech Stack), Section 8 Phase 1 Iteration 1.1
Assets not loading: Section 6.2 (Specs), Section 6.3 (Loading Strategy)
Map issues: Section 9.3 (Tiled Integration), Section 5.2 (World Data)
Events not working: Section 4.3 (Event Bus), Section 4.3.1 (Core Events)
UI not showing: Section 9.1 (Phaser↔React), Section 4.2 (React Module)
Quests broken: Section 5.1 (Quest Model), Section 4.1.3 (Quest Manager)
Save/Load failing: Section 5.3 (Save Data Model), Section 4.1.3 (Save Manager
RetryDContinue)
8. Performance issues: Section 10.2 (Performance Metrics), Section 8 Phase 4 Optimization

📊 PROGRESS TRACKER
Use this to check off completed hours:
[ ] HOUR 0-1: Foundation Setup (4 tasks)
[ ] HOUR 1-2: Core Game Loop (4 tasks)
[ ] HOUR 2-3: Event System + UI (4 tasks)
[ ] HOUR 3-4: Quest System (4 tasks)
[ ] HOUR 4-5: Persistence + Polish (4 tasks)
[ ] HOUR 5-6: Content Expansion (4 tasks)
[ ] HOUR 6-7: Testing + Bug Fixes (3 tasks)
[ ] HOUR 7-8: Deployment + Docs (4 tasks)
Total Tasks: 31
All references point back to coderquest.md architecture document