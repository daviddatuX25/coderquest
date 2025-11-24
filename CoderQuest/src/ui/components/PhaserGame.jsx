import React, { useEffect } from 'react';
import Phaser from 'phaser';
import gameConfig from '../../game/config';

const PhaserGame = () => {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig);
    window.game = game; // For debugging purposes

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="phaser-game-container" />;
};

export default PhaserGame;
