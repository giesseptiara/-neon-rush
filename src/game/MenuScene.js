
import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#DCE8DF");

    if (!this.registry.get("selectedAnimal")) {
      this.registry.set("selectedAnimal", "Cat");
    }

    this.layoutMenu();

    this.scale.on("resize", this.layoutMenu, this);

    this.events.once("shutdown", () => {
      this.scale.off("resize", this.layoutMenu, this);
    });
  }

  layoutMenu() {
    const width = this.scale.width;
    const height = this.scale.height;

    const scale = Math.min(width / 960, height / 540);

    if (this.menuElements) {
      this.menuElements.destroy();
    }

    this.menuElements = this.add.container(0, 0);

    const animalEmojis = {
      Cat: "🐱",
      Dog: "🐶",
      Rabbit: "🐰",
      Fox: "🦊"
    };

    const selectedAnimal =
      this.registry.get("selectedAnimal") || "Cat";

    const selectedEmoji = animalEmojis[selectedAnimal];

    const title = this.add.text(
      width / 2,
      height * 0.23,
      "NEON RUSH",
      {
        fontSize: `${Math.max(28, 48 * scale)}px`,
        fontStyle: "bold",
        color: "#34443B"
      }
    ).setOrigin(0.5);

    const subtitle = this.add.text(
      width / 2,
      height * 0.34,
      "An endless adventure",
      {
        fontSize: `${Math.max(14, 20 * scale)}px`,
        color: "#56665B"
      }
    ).setOrigin(0.5);

    const character = this.add.text(
      width / 2,
      height * 0.45,
      `Your character: ${selectedEmoji} ${selectedAnimal}`,
      {
        fontSize: `${Math.max(15, 22 * scale)}px`,
        color: "#52665B"
      }
    ).setOrigin(0.5);

    const playButton = this.add.text(
      width / 2,
      height * 0.60,
      "PLAY",
      {
        fontSize: `${Math.max(20, 28 * scale)}px`,
        color: "#FFFFFF",
        backgroundColor: "#52665B",
        padding: {
          x: 45 * scale,
          y: 15 * scale
        }
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    playButton.on("pointerover", () => {
      playButton.setAlpha(0.8);
    });

    playButton.on("pointerout", () => {
      playButton.setAlpha(1);
    });

    playButton.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    const characterButton = this.add.text(
      width / 2,
      height * 0.76,
      "CHOOSE CHARACTER",
      {
        fontSize: `${Math.max(14, 20 * scale)}px`,
        color: "#34443B",
        backgroundColor: "#C5D3C8",
        padding: {
          x: 25 * scale,
          y: 12 * scale
        }
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    characterButton.on("pointerdown", () => {
      this.scene.start("CharacterScene");
    });

    this.menuElements.add([
      title,
      subtitle,
      character,
      playButton,
      characterButton
    ]);
  }
}
