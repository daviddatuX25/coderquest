# CoderQuest Architecture Review & Improvement Notes

This document outlines potential edge cases, limitations, and suggested improvements for the core systems of CoderQuest, based on a review of progress up to checklist item `[5.x]`. Items are sorted by milestone and prioritized by importance.

---

## HOUR 2-3: EVENT SYSTEM + UI INTEGRATION

### `[2.1]` Event Bus Implementation

-   **[High] Memory Leaks:** If component event listeners are not cleaned up on unmount, it will degrade performance over time.
    -   **Suggestion:** Strictly enforce the use of the `useGameEvent` hook or manual cleanup in a `useEffect` return function for all event subscriptions in React components.

-   **[Medium] Race Conditions:** Events may be missed if they are fired before a UI component has mounted and subscribed.
    -   **Suggestion:** For critical "one-time" events (like showing the initial quest), consider a simple state management solution (like Zustand or React Context) that components can read upon mounting, instead of relying solely on catching a fleeting event.

-   **[Medium] Debugging:** A simple event bus is a "fire-and-forget" system, which can be difficult to trace when issues occur.
    -   **Suggestion:** Implement an event logger that wraps `EventBus.emit()` and, in development mode, logs the event name and payload to the console for easy tracing.

### `[2.3 & 2.4]` Dialog System & NPC Interaction

-   **[High] Game State During UI Modals:** The player can currently move around while dialogs or lessons are open, which is a significant bug.
    -   **Suggestion:** Implement a `game:pause` and `game:resume` event system. The UI components (`DialogBox`, `LessonViewer`) should emit `game:pause` when they appear and `game:resume` when they disappear. The `GameScene` must listen for these and disable player input and physics updates accordingly.

-   **[Medium] Overlapping Triggers:** If the player stands between two NPCs, the interaction prompt can flicker or trigger the wrong dialog.
    -   **Suggestion:** Modify the `handleInteractions` function to calculate the distance to all nearby interactables and only select the single *closest* one as the active target.

-   **[Medium] Input Spam:** The user can press the interaction key multiple times before the UI appears, potentially causing glitches.
    -   **Suggestion:** In addition to pausing the game state, the `handleInteractions` function should have a simple debounce or check if a UI element is already in the process of opening before firing another `DIALOG_SHOW` event.

-   **[Low] Content Loading Errors:** If a `dialogId` is invalid or the associated JSON file fails to load, the UI may crash or hang.
    -   **Suggestion:** The `DialogBox` component should use `try...catch` blocks for `fetch` calls and render a user-friendly error message (e.g., "Content not available") if the data cannot be retrieved.

---

## HOUR 3-4: QUEST SYSTEM

### `[3.1 - 3.4]` Quest Manager, Lessons, and Quizzes

-   **[High] Content Security (XSS):** Rendering HTML directly from content files (`dangerouslySetInnerHTML`) is a major security risk if the content source is ever expanded beyond trusted local files.
    -   **Suggestion:** Integrate a library like `DOMPurify` to sanitize all HTML content before it is rendered in a React component. This should be a mandatory step in the content pipeline.

-   **[Medium] Quest State Logic:** The current `QuestManager` is simple and does not enforce rules.
    -   **Suggestion:** Before starting a quest, the `QuestManager` must check for prerequisites. It should also refuse to start a new quest if one is already active.

-   **[Low] Limited User Flow:** The lesson and quiz systems are linear. A user cannot go back to review a previous lesson within a quest.
    -   **Suggestion:** For a future iteration, consider adding "Back" and "Next" buttons to the `LessonViewer` and `QuizInterface` and enhancing the `QuestManager` to handle non-linear milestone navigation.

---

## HOUR 4-5: PERSISTENCE + POLISH

### `[4.1 & 4.2]` Save/Load System

-   **[High] Save Data Versioning & Corruption:** Changes to the save data structure in future updates will break old saves. Corrupted data can crash the game on load.
    -   **Suggestion:**
        1.  **Versioning:** The `SaveManager` must check the `version` field in the loaded data. If the version is old, a migration function should be called to update the save structure in-memory before passing it to the game.
        2.  **Corruption:** Wrap the entire `loadGame` logic in a `try...catch` block. On any error, log the issue, delete the corrupted save file from `localStorage`, and allow the user to start a new game seamlessly.

-   **[Medium] Incomplete State Saving:** Progress within a multi-question quiz is not saved. If the player refreshes the page mid-quiz, their answers are lost.
    -   **Suggestion:** Expand the `saveData` model to include `activeQuizState`, which would store the current answers for the active quiz. The `SaveManager` should be updated to handle this.

-   **[Low] Main Menu Flow:** The game currently loads directly into the world. It doesn't present the "New Game / Continue" choice in a clear main menu UI.
    -   **Suggestion:** Create a dedicated "MainMenu" React component that is rendered first. This component will check for save data and display the appropriate buttons. Clicking "Continue" or "New Game" will then initialize the Phaser game with the correct starting parameters.
