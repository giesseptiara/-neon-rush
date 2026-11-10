
import Phaser from "phaser";

import GameScene from "./game/GameScene.js";
import MenuScene from "./game/MenuScene.js";
import CharacterScene from "./game/CharacterScene.js";

import "./styles/main.css";


const config = {
  type: Phaser.AUTO,

  parent: "game-container",

  backgroundColor: "#DCE8DF",

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [
    MenuScene,
    CharacterScene,
    GameScene
  ]
};

new Phaser.Game(config);

