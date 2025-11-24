export const EVENTS = {
    // Game -> UI Events
    QUEST_START: 'quest:start',
    LESSON_SHOW: 'lesson:show',
    QUIZ_SHOW: 'quiz:show',
    DIALOG_SHOW: 'dialog:show',
    QUEST_COMPLETE: 'quest:complete',

    // UI -> Game Events
    MILESTONE_COMPLETE: 'milestone:complete',
    LESSON_CLOSE: 'lesson:close',
    QUIZ_SUBMIT: 'quiz:submit',
    DIALOG_CLOSE: 'dialog:close',

    // System Events (from checklist, though not listed in this snippet)
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    SAVE_REQUEST: 'save:request',
    SAVE_COMPLETE: 'save:complete'
};
