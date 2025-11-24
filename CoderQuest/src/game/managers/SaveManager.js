const SAVE_KEY = 'coderquest_savegame';

class SaveManager {
    constructor() {
        this.lastSaveTime = 0;
    }

    saveGame(player, questManager) {
        const saveData = {
            player: {
                x: player.x,
                y: player.y
            },
            quest: {
                activeQuestId: questManager.activeQuest ? questManager.activeQuest.questId : null,
                currentMilestoneIndex: questManager.currentMilestoneIndex,
                // A real implementation would also save completed quests, inventory, etc.
            },
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log('Game saved successfully.');
            this.lastSaveTime = Date.now();
        } catch (error) {
            console.error('Error saving game:', error);
        }
    }

    loadGame() {
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                console.log('Save game found.');
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Error loading game:', error);
        }
        return null;
    }

    hasSaveData() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }
}

export default SaveManager;
