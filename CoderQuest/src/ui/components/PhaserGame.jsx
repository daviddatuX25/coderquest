import React, { useEffect } from 'react';
import Phaser from 'phaser';
import gameConfig from '../../game/config';

const PhaserGame = ({ onQuestManagerReady }) => {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig);
    window.game = game; // For debugging purposes

    // Wait for scene to be ready and expose quest manager
    game.events.on('ready', () => {
      const scene = game.scene.getScene('GameScene');
      if (scene && scene.questManager) {
        window.questManager = scene.questManager;
        if (onQuestManagerReady) {
          onQuestManagerReady(scene.questManager);
        }
      }
    });

    return () => {
      game.destroy(true);
    };
  }, [onQuestManagerReady]);

  return <div id="phaser-game-container" />;
};

export default PhaserGame;
