import EventBus from '../../shared/EventBus';
import { EVENTS } from '../../shared/events';

class QuestManager {
    constructor(scene) {
        this.scene = scene;
        this.quests = {};
        this.activeQuest = null;
        this.currentMilestoneIndex = 0;
    }

    loadQuests(questIds) {
        questIds.forEach(id => {
            this.scene.load.json(`quest_${id}`, `content/${id}.json`);
        });
    }

    startQuest(questId) {
        if (!this.quests[questId]) {
            this.quests[questId] = this.scene.cache.json.get(`quest_${questId}`);
        }
        
        const quest = this.quests[questId];
        if (!quest) {
            console.error(`Quest with id ${questId} not found or not loaded.`);
            return;
        }

        this.activeQuest = quest;
        this.currentMilestoneIndex = 0;
        
        EventBus.emit(EVENTS.QUEST_START, { quest: this.activeQuest });
        
        // Emit quest:show-lesson with the full quest data to trigger LessonMode
        if (quest.segments && quest.segments.length > 0) {
            EventBus.emit('quest:show-lesson', { questId });
        } else {
            this.showCurrentMilestone();
        }
    }

    showCurrentMilestone() {
        if (!this.activeQuest) return;

        const milestones = this.activeQuest.milestones || [];
        const milestone = milestones[this.currentMilestoneIndex];
        if (!milestone) {
            this.completeQuest();
            return;
        }

        const event = milestone.type === 'lesson' ? EVENTS.LESSON_SHOW : EVENTS.QUIZ_SHOW;
        EventBus.emit(event, { milestone });
    }

    completeMilestone() {
        if (!this.activeQuest) return;

        this.currentMilestoneIndex++;
        if (this.currentMilestoneIndex >= this.activeQuest.milestones.length) {
            this.completeQuest();
        } else {
            this.showCurrentMilestone();
        }
    }

    completeQuest() {
        if (!this.activeQuest) return;

        console.log(`Quest ${this.activeQuest.title} completed!`);
        EventBus.emit(EVENTS.QUEST_COMPLETE, { questId: this.activeQuest.questId });
        
        this.activeQuest = null;
        this.currentMilestoneIndex = 0;
    }
}

export default QuestManager;
