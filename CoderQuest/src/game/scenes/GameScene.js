import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load assets here
    }

    create() {
        // Create game objects here
        this.add.text(20, 20, 'Hello CoderQuest!', { fontSize: '24px', fill: '#ffffff' });
    }

    update() {
        // Game logic here
    }
}

export default GameScene;
