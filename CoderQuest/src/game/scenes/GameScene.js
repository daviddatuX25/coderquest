import Phaser from 'phaser';
import EventBus from '../../shared/EventBus';
import { EVENTS } from '../../shared/events';
import QuestManager from '../managers/QuestManager';
import SaveManager from '../managers/SaveManager';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.playerSpeed = 150;
        this.npcs = null;
        this.portals = null;
        this.interactionKey = null;
        this.interactionPrompt = null;
        this.activeNPC = null;
        this.activePortal = null;
        this.questManager = null;
        this.saveManager = null;
    }

    preload() {
        this.questManager = new QuestManager(this);
        this.questManager.loadQuests(['quest_01']);

        this.load.image('tiles', 'assets/tilesets/tiles.png');
        this.load.tilemapTiledJSON('world_01', 'maps/world_01.json');
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('npc', 'assets/sprites/npc.png');
        this.load.image('portal', 'assets/sprites/portal.png');
    }

    create() {
        const map = this.make.tilemap({ key: 'world_01' });
        const tileset = map.addTilesetImage('tiles', 'tiles'); 

        const groundLayer = map.createLayer('Ground', tileset, 0, 0);
        const wallsLayer = map.createLayer('Walls', tileset, 0, 0);

        wallsLayer.setCollisionByProperty({ collides: true });

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        
        this.saveManager = new SaveManager();
        const saveData = this.saveManager.loadGame();

        let initialPlayerPos;
        if (saveData) {
            initialPlayerPos = { x: saveData.player.x, y: saveData.player.y };
        } else {
            const spawnPoint = map.findObject('Objects', obj => obj.name === 'spawn');
            initialPlayerPos = { x: spawnPoint.x, y: spawnPoint.y };
        }

        this.player = this.physics.add.sprite(initialPlayerPos.x, initialPlayerPos.y, 'player');
        this.player.setCollideWorldBounds(true);

        if (saveData && saveData.quest.activeQuestId) {
            this.questManager.startQuest(saveData.quest.activeQuestId);
            this.questManager.currentMilestoneIndex = saveData.quest.currentMilestoneIndex;
        }

        this.physics.add.collider(this.player, wallsLayer);

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setZoom(2);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.interactionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.interactionPrompt = this.add.text(0, 0, 'Press E', { fontSize: '12px', fill: '#ffffff' }).setOrigin(0.5, 1).setVisible(false);

        this.npcs = this.physics.add.group({ immovable: true });
        this.portals = this.physics.add.group({ immovable: true });

        map.getObjectLayer('Objects').objects.forEach(obj => {
            let sprite;
            if (obj.type === 'npc') {
                sprite = this.npcs.create(obj.x, obj.y, 'npc').setOrigin(0);
            } else if (obj.type === 'portal') {
                sprite = this.portals.create(obj.x, obj.y, 'portal').setOrigin(0);
            }

            if(sprite) {
                obj.properties.forEach(prop => sprite.setData(prop.name, prop.value));
            }
        });
        
        this.physics.add.collider(this.player, this.npcs);

        // Event Listeners
        EventBus.on(EVENTS.MILESTONE_COMPLETE, () => this.questManager.completeMilestone());
        EventBus.on(EVENTS.QUEST_COMPLETE, () => this.saveManager.saveGame(this.player, this.questManager));

        // Auto-save timer
        this.time.addEvent({
            delay: 30000, // 30 seconds
            callback: () => this.saveManager.saveGame(this.player, this.questManager),
            loop: true
        });
    }

    update() {
        this.handlePlayerMovement();
        this.handleInteractions();
    }

    handlePlayerMovement() {
        if (!this.player) return;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown || this.wasd.left.isDown) this.player.setVelocityX(-this.playerSpeed);
        else if (this.cursors.right.isDown || this.wasd.right.isDown) this.player.setVelocityX(this.playerSpeed);
        if (this.cursors.up.isDown || this.wasd.up.isDown) this.player.setVelocityY(-this.playerSpeed);
        else if (this.cursors.down.isDown || this.wasd.down.isDown) this.player.setVelocityY(this.playerSpeed);
        this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    handleInteractions() {
        const interactionRange = 50;
        let inRangeNPC = null;
        let inRangePortal = null;

        this.npcs.getChildren().forEach(npc => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            if (distance < interactionRange) inRangeNPC = npc;
        });

        this.portals.getChildren().forEach(portal => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, portal.x, portal.y);
            if (distance < interactionRange) inRangePortal = portal;
        });

        this.activeNPC = inRangeNPC;
        this.activePortal = inRangePortal;

        if (this.activeNPC) {
            this.interactionPrompt.setPosition(this.activeNPC.x, this.activeNPC.y - 20).setText('Press E to talk').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
                EventBus.emit(EVENTS.DIALOG_SHOW, { dialogId: this.activeNPC.getData('dialogId') });
            }
        } else if (this.activePortal) {
            this.interactionPrompt.setPosition(this.activePortal.x, this.activePortal.y - 20).setText('Press E to start quest').setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
                this.questManager.startQuest(this.activePortal.getData('questId'));
            }
        } else {
            this.interactionPrompt.setVisible(false);
        }
    }
}

export default GameScene;
