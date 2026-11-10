
import Phaser from "phaser";

export default class CharacterScene extends Phaser.Scene {
  constructor() {
    super("CharacterScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#E9EDE7");

    this.animals = [
      { name: "Cat", emoji: "🐱" },
      { name: "Dog", emoji: "🐶" },
      { name: "Rabbit", emoji: "🐰" },
      { name: "Fox", emoji: "🦊" }
    ];

    this.selectedAnimal =
      this.registry.get("selectedAnimal") || "Cat";

    this.layoutCharacter();

    this.scale.on("resize", this.layoutCharacter, this);

    this.events.once("shutdown", () => {
      this.scale.off("resize", this.layoutCharacter, this);
    });
  }

  layoutCharacter() {
    const width = this.scale.width;
    const height = this.scale.height;

    const scale = Math.min(width / 960, height / 540);

    if (this.characterElements) {
      this.characterElements.destroy();
    }

    this.characterElements = this.add.container(0, 0);

    const title = this.add.text(
      width / 2,
      height * 0.13,
      "CHOOSE YOUR CHARACTER",
      {
        fontSize: `${Math.max(20, 32 * scale)}px`,
        fontStyle: "bold",
        color: "#34443B"
      }
    ).setOrigin(0.5);

    this.characterElements.add(title);

    const cards = [];

    const cardWidth = Math.min(150, width * 0.19);
    const cardHeight = Math.min(170, height * 0.32);
    const cardY = height * 0.47;

    this.animals.forEach((animal, index) => {
      const x = width * ((index + 0.5) / 4);

      const card = this.add.rectangle(
        x,
        cardY,
        cardWidth,
        cardHeight,
        0xDCE8DF
      );

      card.setStrokeStyle(2, 0xA8B9AE);
      card.setInteractive({ useHandCursor: true });

      const emoji = this.add.text(
        x,
        cardY - cardHeight * 0.15,
        animal.emoji,
        {
          fontSize: `${Math.max(30, 55 * scale)}px`
        }
      ).setOrigin(0.5);

      const name = this.add.text(
        x,
        cardY + cardHeight * 0.23,
        animal.name,
        {
          fontSize: `${Math.max(15, 22 * scale)}px`,
          color: "#34443B"
        }
      ).setOrigin(0.5);

      card.on("pointerdown", () => {
        this.selectCharacter(animal.name);
      });

      this.characterElements.add([
        card,
        emoji,
        name
      ]);

      cards.push({
        animal,
        card
      });
    });

    this.cards = cards;

    this.selectedText = this.add.text(
      width / 2,
      height * 0.77,
      "",
      {
        fontSize: `${Math.max(16, 23 * scale)}px`,
        color: "#34443B",
        fontStyle: "bold"
      }
    ).setOrigin(0.5);

    this.characterElements.add(this.selectedText);

    const backButton = this.add.text(
      width * 0.12,
      height * 0.91,
      "← BACK",
      {
        fontSize: `${Math.max(15, 21 * scale)}px`,
        color: "#34443B",
        backgroundColor: "#C5D3C8",
        padding: {
          x: 15 * scale,
          y: 10 * scale
        }
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    const confirmButton = this.add.text(
      width * 0.88,
      height * 0.91,
      "CONFIRM",
      {
        fontSize: `${Math.max(15, 21 * scale)}px`,
        color: "#FFFFFF",
        backgroundColor: "#52665B",
        padding: {
          x: 25 * scale,
          y: 10 * scale
        }
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    confirmButton.on("pointerdown", () => {
      this.registry.set(
        "selectedAnimal",
        this.selectedAnimal
      );

      this.scene.start("MenuScene");
    });

    this.characterElements.add([
      backButton,
      confirmButton
    ]);

    this.updateSelectedCard();
  }

  selectCharacter(animalName) {
    this.selectedAnimal = animalName;

    this.registry.set(
      "selectedAnimal",
      animalName
    );

    this.updateSelectedCard();
  }

  updateSelectedCard() {
    if (!this.cards || !this.selectedText) return;

    this.cards.forEach(({ animal, card }) => {
      if (animal.name === this.selectedAnimal) {
        card.setFillStyle(0xC5D8C8);
        card.setStrokeStyle(4, 0x52665B);
      } else {
        card.setFillStyle(0xDCE8DF);
        card.setStrokeStyle(2, 0xA8B9AE);
      }
    });

    const selected = this.animals.find(
      animal => animal.name === this.selectedAnimal
    );

    if (selected) {
      this.selectedText.setText(
        `${selected.emoji} ${selected.name} selected!`
      );
    }
  }
}
