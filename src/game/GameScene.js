import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#DCE8DF");

    // ==================================
    // UKURAN LAYAR DAN SKALA
    // ==================================

    this.baseWidth = 960;
    this.baseHeight = 540;

    this.updateDimensions();

    // ==================================
    // PENGATURAN PERMAINAN
    // ==================================

    this.isJumping = false;
    this.gameOver = false;
    this.isPaused = false;

    this.gameSpeed = 240;

    // ==================================
    // SCORE DAN COIN
    // ==================================

    this.score = 0;
    this.scoreTimer = 0;

    this.bestScore = Number(
      localStorage.getItem("neonRushBestScore") || 0
    );

    this.lastScore = Number(
      localStorage.getItem("neonRushLastScore") || 0
    );

    this.coinsCollected = 0;
    this.coins = [];

    // ==================================
    // OBSTACLE
    // ==================================

    this.obstacles = [];

    // ==================================
    // SISTEM SPAWN
    // ==================================

    this.spawnTimer = 0;
    this.nextSpawnType = "coin";
    this.nextSpawnIn = 1800;

    // ==================================
    // LINGKUNGAN
    // ==================================

    this.environmentTypes = [
      "residential",
      "downtown",
      "park",
      "outskirts"
    ];

    this.nextEnvironment = 0;

    this.createBackground();
    this.createRoad();
    this.createHUD();
    this.createPlayer();
    this.createControls();

    // ==================================
    // RESPONSIVE RESIZE
    // ==================================

    this.scale.on("resize", this.handleResize, this);

    this.events.once("shutdown", () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  // ==================================
  // MENGHITUNG UKURAN LAYAR
  // ==================================

  updateDimensions() {
    this.width = this.scale.width;
    this.height = this.scale.height;

    this.sx = this.width / this.baseWidth;
    this.sy = this.height / this.baseHeight;

    this.unitScale = Math.min(this.sx, this.sy);

    this.groundY = this.height - 125 * this.sy;
    this.segmentWidth = this.width;
  }

  // ==================================
  // MEMBUAT BACKGROUND
  // ==================================

  createBackground() {
    this.farSegments = [];
    this.environmentSegments = [];

    // Matahari
    this.sun = this.add.circle(
      this.width * 0.82,
      this.height * 0.18,
      38 * this.unitScale,
      0xF1D6A7
    );

    this.sun.setDepth(-20);

    // Lapisan pegunungan
    for (let i = 0; i < 4; i++) {
      const segment = this.add.container(
        i * this.width,
        0
      );

      segment.setScale(this.sx, this.sy);
      segment.setDepth(-15);

      this.drawFarEnvironment(segment, i);

      this.farSegments.push(segment);
    }

    // Lapisan lingkungan utama
    for (let i = 0; i < 4; i++) {
      const segment = this.add.container(
        i * this.width,
        0
      );

      segment.setScale(this.sx, this.sy);
      segment.setDepth(-10);

      this.drawEnvironment(
        segment,
        this.environmentTypes[i]
      );

      this.environmentSegments.push(segment);
    }
  }

  // ==================================
  // BACKGROUND PEGUNUNGAN DAN AWAN
  // ==================================

  drawFarEnvironment(container, variant) {
    const graphics = this.add.graphics();

    const colors = [
      0xB7C9B8,
      0xAFC3B4,
      0xC0CEBC,
      0xA8BEAD
    ];

    graphics.fillStyle(
      colors[variant % colors.length],
      1
    );

    graphics.fillTriangle(
      0, 390,
      260, 180 + (variant % 2) * 35,
      520, 390
    );

    graphics.fillTriangle(
      400, 390,
      700, 210 + (variant % 3) * 20,
      960, 390
    );

    graphics.fillStyle(0xF5F4E9, 0.85);

    const cloudX = 150 + (variant * 170) % 650;
    const cloudY = 130 + (variant % 2) * 45;

    graphics.fillCircle(cloudX, cloudY, 20);
    graphics.fillCircle(cloudX + 25, cloudY - 10, 25);
    graphics.fillCircle(cloudX + 50, cloudY, 19);

    container.add(graphics);
  }

  // ==================================
  // LINGKUNGAN UTAMA
  // ==================================

  drawEnvironment(container, type) {
    const graphics = this.add.graphics();

    graphics.fillStyle(0xA9BE99, 1);
    graphics.fillRect(0, 400, 960, 20);

    graphics.fillStyle(0x829875, 1);
    graphics.fillRect(0, 400, 960, 3);

    if (type === "residential") {
      this.drawResidential(graphics);
    }

    if (type === "downtown") {
      this.drawDowntown(graphics);
    }

    if (type === "park") {
      this.drawPark(graphics);
    }

    if (type === "outskirts") {
      this.drawOutskirts(graphics);
    }

    container.add(graphics);
  }

  // ==================================
  // PERUMAHAN
  // ==================================

  drawResidential(g) {
    g.fillStyle(0xD9C7A8, 1);
    g.fillRect(70, 240, 180, 160);

    g.fillStyle(0xA96F5B, 1);
    g.fillTriangle(50, 240, 160, 145, 270, 240);

    g.fillStyle(0xE8D8BD, 1);
    g.fillRect(350, 210, 210, 190);

    g.fillStyle(0x718C78, 1);
    g.fillTriangle(330, 210, 455, 115, 580, 210);

    g.fillStyle(0xA8C4C2, 1);

    g.fillRect(95, 275, 40, 45);
    g.fillRect(185, 275, 40, 45);
    g.fillRect(390, 250, 45, 50);
    g.fillRect(475, 250, 45, 50);

    g.fillStyle(0x765644, 1);

    g.fillRect(145, 315, 35, 85);
    g.fillRect(440, 315, 40, 85);

    g.fillStyle(0xEEE5D4, 1);
    g.fillRect(0, 365, 620, 10);

    for (let x = 0; x < 620; x += 35) {
      g.fillRect(x, 365, 8, 35);
    }

    this.drawTree(g, 700, 400, 1);
    this.drawTree(g, 850, 400, 0.8);
  }

  // ==================================
  // DOWNTOWN
  // ==================================

  drawDowntown(g) {
    g.fillStyle(0xD7BFA3, 1);
    g.fillRect(40, 220, 180, 180);

    g.fillStyle(0xA56F5A, 1);
    g.fillRect(40, 205, 180, 18);

    g.fillStyle(0x718C78, 1);
    g.fillRect(75, 240, 110, 30);

    g.fillStyle(0xA7C7CA, 1);
    g.fillRect(65, 290, 130, 65);

    g.fillStyle(0xB6C4B9, 1);
    g.fillRect(300, 110, 210, 290);

    g.fillStyle(0xE8E3D5, 1);

    for (let x = 325; x < 490; x += 55) {
      for (let y = 140; y < 340; y += 65) {
        g.fillRect(x, y, 30, 35);
      }
    }

    g.fillStyle(0x6D8275, 1);

    g.fillRect(620, 270, 130, 8);
    g.fillRect(630, 278, 6, 95);
    g.fillRect(735, 278, 6, 95);

    g.fillStyle(0xA7C7CA, 0.8);
    g.fillRect(635, 280, 100, 65);

    this.drawStreetLight(g, 830, 400);
  }

  // ==================================
  // TAMAN
  // ==================================

  drawPark(g) {
    g.fillStyle(0xA9BE99, 1);
    g.fillRect(0, 320, 960, 80);

    this.drawTree(g, 120, 400, 1.4);
    this.drawTree(g, 350, 400, 1.1);
    this.drawTree(g, 790, 400, 1.3);

    g.fillStyle(0x8C6348, 1);

    g.fillRect(500, 345, 90, 12);
    g.fillRect(505, 315, 80, 12);
    g.fillRect(510, 357, 7, 43);
    g.fillRect(575, 357, 7, 43);

    const flowerColors = [
      0xE5A3A0,
      0xF0D58C,
      0xA9A6CC
    ];

    for (let i = 0; i < 12; i++) {
      g.fillStyle(
        flowerColors[i % flowerColors.length],
        1
      );

      g.fillCircle(30 + i * 75, 385, 5);
    }

    g.fillStyle(0x718F6A, 1);

    g.fillCircle(650, 375, 30);
    g.fillCircle(680, 375, 25);
  }

  // ==================================
  // PINGGIR KOTA
  // ==================================

  drawOutskirts(g) {
    g.fillStyle(0xA9BE99, 1);

    g.fillTriangle(0, 400, 250, 230, 500, 400);
    g.fillTriangle(400, 400, 700, 250, 960, 400);

    g.fillStyle(0xE4D5B9, 1);
    g.fillRect(110, 260, 150, 140);

    g.fillStyle(0xA66E58, 1);
    g.fillTriangle(90, 260, 185, 180, 280, 260);

    g.fillStyle(0xA7C7CA, 1);

    g.fillRect(135, 290, 35, 35);
    g.fillRect(200, 290, 35, 35);

    this.drawTree(g, 390, 400, 0.8);
    this.drawTree(g, 650, 400, 1.2);
    this.drawTree(g, 850, 400, 0.9);

    g.fillStyle(0x718F6A, 1);

    g.fillCircle(510, 385, 25);
    g.fillCircle(540, 385, 20);
  }

  // ==================================
  // POHON DAN LAMPU JALAN
  // ==================================

  drawTree(g, x, y, scale = 1) {
    g.fillStyle(0x886247, 1);

    g.fillRect(
      x - 8 * scale,
      y - 65 * scale,
      16 * scale,
      65 * scale
    );

    g.fillStyle(0x718F6A, 1);

    g.fillCircle(x, y - 85 * scale, 30 * scale);
    g.fillCircle(x - 22 * scale, y - 68 * scale, 23 * scale);
    g.fillCircle(x + 22 * scale, y - 68 * scale, 23 * scale);
  }

  drawStreetLight(g, x, y) {
    g.fillStyle(0x59675E, 1);

    g.fillRect(x, y - 95, 7, 95);
    g.fillRect(x - 20, y - 98, 27, 6);

    g.fillStyle(0xF1D6A7, 1);
    g.fillCircle(x - 18, y - 95, 9);
  }

  // ==================================
  // JALAN DAN TROTOAR
  // ==================================

  createRoad() {
    this.roadElements = this.add.container(0, 0);
    this.roadElements.setDepth(2);

    this.roadElements.add([
      this.add.rectangle(
        this.width / 2,
        this.height - 90 * this.sy,
        this.width,
        60 * this.sy,
        0xC5BBA9
      ),

      this.add.rectangle(
        this.width / 2,
        this.height - 30 * this.sy,
        this.width,
        60 * this.sy,
        0x626C68
      )
    ]);

    this.roadLines = [];

    for (
      let x = 0;
      x <= this.width + 100 * this.unitScale;
      x += 100 * this.unitScale
    ) {
      const line = this.add.rectangle(
        x,
        this.height - 30 * this.sy,
        45 * this.unitScale,
        3 * this.unitScale,
        0xE9E5D9
      );

      line.setDepth(3);
      this.roadLines.push(line);
    }
  }

  // ==================================
  // HUD DAN TOMBOL PAUSE
  // ==================================

  createHUD() {
    const fontSize = Math.max(
      14,
      22 * this.unitScale
    );

    // Score
    this.scoreText = this.add.text(
      25 * this.unitScale,
      18 * this.unitScale,
      "SCORE: 0",
      {
        fontSize: `${fontSize}px`,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#34443B"
      }
    )
      .setScrollFactor(0)
      .setDepth(50);

    // Coin
    this.coinText = this.add.text(
      this.width - 105 * this.unitScale,
      18 * this.unitScale,
      "COIN: 0",
      {
        fontSize: `${fontSize}px`,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#B87932"
      }
    )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(50);

    // Tombol PAUSE
    this.pauseButton = this.add.rectangle(
      this.width - 45 * this.unitScale,
      30 * this.unitScale,
      65 * this.unitScale,
      34 * this.unitScale,
      0x718F6A
    )
      .setInteractive({ useHandCursor: true })
      .setDepth(50);

    this.pauseLabel = this.add.text(
      this.width - 45 * this.unitScale,
      30 * this.unitScale,
      "PAUSE",
      {
        fontSize: `${Math.max(10, 12 * this.unitScale)}px`,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#FFFFFF"
      }
    )
      .setOrigin(0.5)
      .setDepth(51);

    this.pauseButton.on("pointerdown", () => {
      this.pauseGame();
    });
  }

  // ==================================
  // KARAKTER
  // ==================================

  createPlayer() {
    const selectedAnimal =
      this.registry.get("selectedAnimal") || "Cat";

    this.player = this.createAnimal(
      selectedAnimal,
      this.width * 0.1875,
      this.groundY
    );

    this.player.setDepth(10);
  }

  createAnimal(animal, x, y) {
    const container = this.add.container(x, y);

    container.setScale(this.unitScale);

    const colors = {
      Cat: 0xD99B62,
      Dog: 0xA97950,
      Rabbit: 0xE8DCD0,
      Fox: 0xD96D3F
    };

    const color = colors[animal] || colors.Cat;

    const leg1 = this.add.ellipse(-12, 15, 13, 22, color);
    const leg2 = this.add.ellipse(15, 15, 13, 22, color);

    const g = this.add.graphics();

    g.fillStyle(color, 1);

    g.fillEllipse(-32, -2, 24, 15);
    g.fillEllipse(0, 0, 65, 42);
    g.fillCircle(27, -20, 23);

    if (animal === "Cat") {
      g.fillTriangle(10, -34, 13, -58, 28, -39);
      g.fillTriangle(29, -39, 45, -58, 48, -29);
    }

    if (animal === "Dog") {
      g.fillEllipse(9, -24, 17, 30);
      g.fillEllipse(46, -24, 17, 30);
    }

    if (animal === "Rabbit") {
      g.fillEllipse(16, -59, 13, 40);
      g.fillEllipse(37, -59, 13, 40);
    }

    if (animal === "Fox") {
      g.fillTriangle(10, -35, 10, -62, 29, -38);
      g.fillTriangle(29, -38, 48, -62, 47, -32);
    }

    g.fillStyle(0x26332D, 1);
    g.fillCircle(35, -23, 3);

    g.fillStyle(0x4B3932, 1);
    g.fillCircle(47, -15, 3);

    container.add([leg1, leg2, g]);

    const nameText = this.add.text(
      0,
      45,
      animal,
      {
        fontSize: "14px",
        color: "#34443B",
        fontStyle: "bold"
      }
    ).setOrigin(0.5);

    container.add(nameText);

    // Animasi kaki
    this.tweens.add({
      targets: leg1,
      angle: 25,
      duration: 180,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: leg2,
      angle: -25,
      duration: 180,
      yoyo: true,
      repeat: -1
    });

    return container;
  }

  // ==================================
  // KONTROL
  // ==================================

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // ESC untuk pause / resume
    this.input.keyboard.on(
      "keydown-ESC",
      this.togglePause,
      this
    );

    // Klik area kosong untuk melompat
    // Klik tombol tidak membuat karakter ikut melompat
    this.input.on("pointerdown", (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.length > 0) {
        return;
      }

      this.jump();
    });
  }

  // ==================================
  // LOMPAT
  // ==================================

  jump() {
    if (
      this.isJumping ||
      !this.player ||
      this.gameOver ||
      this.isPaused
    ) {
      return;
    }

    this.isJumping = true;

    this.tweens.add({
      targets: this.player,
      y: this.groundY - 175 * this.sy,
      duration: 450,
      yoyo: true,
      ease: "Quad.easeOut",

      onComplete: () => {
        if (!this.gameOver && !this.isPaused && this.player) {
          this.player.y = this.groundY;
          this.isJumping = false;
        }
      }
    });
  }

  // ==================================
  // SPAWN OBSTACLE
  // ==================================

  spawnObstacle() {
    const obstacle = this.add.container(
      this.width + 80 * this.unitScale,
      this.groundY
    );

    obstacle.setScale(this.unitScale);
    obstacle.setDepth(15);

    const types = ["cone", "box", "barrier"];
    const type = Phaser.Utils.Array.GetRandom(types);

    obstacle.obstacleType = type;

    const g = this.add.graphics();

    g.fillStyle(0x26332D, 0.15);
    g.fillEllipse(0, 17, 55, 10);

    if (type === "cone") {
      g.fillStyle(0xE58B55, 1);
      g.fillTriangle(-21, 14, 21, 14, 0, -45);

      g.fillStyle(0xF5E9D5, 1);
      g.fillRect(-12, -9, 24, 7);

      g.fillStyle(0xE58B55, 1);
      g.fillRect(-24, 12, 48, 7);
    }

    if (type === "box") {
      g.fillStyle(0xA97950, 1);
      g.fillRoundedRect(-25, -38, 50, 52, 5);

      g.lineStyle(3, 0x765239, 1);
      g.strokeRect(-20, -33, 40, 42);

      g.lineBetween(-20, -33, 20, 9);
      g.lineBetween(20, -33, -20, 9);
    }

    if (type === "barrier") {
      g.fillStyle(0xE8D7B8, 1);
      g.fillRoundedRect(-38, -32, 76, 35, 5);

      g.fillStyle(0xD77C57, 1);

      g.fillRect(-28, -29, 12, 29);
      g.fillRect(-3, -29, 12, 29);
      g.fillRect(22, -29, 12, 29);

      g.fillStyle(0x765239, 1);

      g.fillRect(-31, 3, 8, 14);
      g.fillRect(23, 3, 8, 14);
    }

    obstacle.add(g);

    this.obstacles.push(obstacle);
  }

  // ==================================
  // SISTEM KOIN
  // ==================================

  spawnCoinTrail() {
    const patterns = ["straight", "low", "arc"];

    const pattern = Phaser.Utils.Array.GetRandom(patterns);

    const count = Phaser.Math.Between(4, 5);

    const startX = this.width + 80 * this.unitScale;
    const spacing = 48 * this.unitScale;

    for (let i = 0; i < count; i++) {
      let coinY = this.groundY - 35 * this.sy;

      if (pattern === "low") {
        coinY = this.groundY - 25 * this.sy;
      }

      if (pattern === "straight") {
        coinY = this.groundY - 45 * this.sy;
      }

      if (pattern === "arc") {
        const progress = i / (count - 1);

        const arcHeight =
          Math.sin(progress * Math.PI) * 55 * this.sy;

        coinY = this.groundY - 35 * this.sy - arcHeight;
      }

      this.createCoin(
        startX + i * spacing,
        coinY
      );
    }
  }

  createCoin(x, y) {
    const coin = this.add.container(x, y);

    coin.setScale(this.unitScale);
    coin.setDepth(20);

    const g = this.add.graphics();

    g.fillStyle(0xE5A93D, 1);
    g.fillCircle(0, 0, 17);

    g.fillStyle(0xF7D779, 1);
    g.fillCircle(0, 0, 12);

    g.fillStyle(0xD99A32, 1);
    g.fillCircle(0, 0, 5);

    g.fillStyle(0xFFFFFF, 0.8);
    g.fillCircle(-5, -6, 3);

    coin.add(g);

    this.tweens.add({
      targets: coin,
      scaleX: this.unitScale * 0.65,
      duration: 450,
      yoyo: true,
      repeat: -1
    });

    this.coins.push(coin);
  }

  // ==================================
  // COLLISION KOIN
  // ==================================

  checkCoinCollision(coin) {
    const s = this.unitScale;

    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - 22 * s,
      this.player.y - 38 * s,
      60 * s,
      58 * s
    );

    const coinBounds = new Phaser.Geom.Rectangle(
      coin.x - 15 * s,
      coin.y - 15 * s,
      30 * s,
      30 * s
    );

    return Phaser.Geom.Intersects.RectangleToRectangle(
      playerBounds,
      coinBounds
    );
  }

  collectCoin(coin, index) {
    this.coinsCollected++;

    this.coinText.setText(
      "COIN: " + this.coinsCollected
    );

    this.tweens.killTweensOf(coin);

    this.tweens.add({
      targets: coin,
      y: coin.y - 35 * this.sy,
      alpha: 0,
      scale: this.unitScale * 1.5,
      duration: 180,
      onComplete: () => coin.destroy()
    });

    this.coins.splice(index, 1);
  }

  // ==================================
  // COLLISION OBSTACLE
  // ==================================

  checkCollision(obstacle) {
    const s = this.unitScale;

    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - 22 * s,
      this.player.y - 38 * s,
      60 * s,
      58 * s
    );

    let obstacleWidth = 44;
    let obstacleHeight = 45;

    if (obstacle.obstacleType === "barrier") {
      obstacleWidth = 65;
      obstacleHeight = 42;
    }

    const obstacleBounds = new Phaser.Geom.Rectangle(
      obstacle.x - obstacleWidth * s / 2,
      obstacle.y - obstacleHeight * s,
      obstacleWidth * s,
      obstacleHeight * s
    );

    return Phaser.Geom.Intersects.RectangleToRectangle(
      playerBounds,
      obstacleBounds
    );
  }

  // ==================================
  // SIMPAN SCORE
  // ==================================

  saveScore() {
    const finalScore = Math.floor(this.score);

    this.lastScore = finalScore;

    localStorage.setItem(
      "neonRushLastScore",
      String(finalScore)
    );

    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;

      localStorage.setItem(
        "neonRushBestScore",
        String(this.bestScore)
      );
    }
  }

  // ==================================
  // PAUSE GAME
  // ==================================

  pauseGame() {
    if (this.gameOver || this.isPaused) return;

    this.isPaused = true;

    // Hentikan seluruh animasi sementara
    this.tweens.pauseAll();

    this.createPauseMenu();
  }

  // ==================================
  // RESUME GAME
  // ==================================

  resumeGame() {
    if (!this.isPaused) return;

    this.isPaused = false;

    if (this.pauseElements) {
      this.pauseElements.destroy();
      this.pauseElements = null;
    }

    // Lanjutkan animasi
    this.tweens.resumeAll();
  }

  // ==================================
  // TOGGLE PAUSE
  // ==================================

  togglePause() {
    if (this.gameOver) return;

    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  // ==================================
  // MEMBUAT PAUSE MENU
  // ==================================

  createPauseMenu() {
    const width = this.width;
    const height = this.height;
    const s = this.unitScale;

    this.pauseElements = this.add.container(0, 0);

    // Background gelap
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x26332D,
      0.82
    );

    // Judul
    const title = this.add.text(
      width / 2,
      height * 0.23,
      "GAME PAUSED",
      {
        fontSize: `${40 * s}px`,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#FFFFFF"
      }
    ).setOrigin(0.5);

    // Deskripsi
    const subtitle = this.add.text(
      width / 2,
      height * 0.34,
      "Permainan sedang dijeda",
      {
        fontSize: `${16 * s}px`,
        fontFamily: "Arial",
        color: "#E8E3D5"
      }
    ).setOrigin(0.5);

    this.pauseElements.add([
      overlay,
      title,
      subtitle
    ]);

    // Fungsi untuk membuat tombol
    const createButton = (y, label, color, callback) => {
      const button = this.add.rectangle(
        width / 2,
        y,
        210 * s,
        48 * s,
        color
      ).setInteractive({ useHandCursor: true });

      const text = this.add.text(
        width / 2,
        y,
        label,
        {
          fontSize: `${17 * s}px`,
          fontFamily: "Arial",
          fontStyle: "bold",
          color: "#FFFFFF"
        }
      ).setOrigin(0.5);

      button.on("pointerdown", callback);

      this.pauseElements.add([
        button,
        text
      ]);
    };

    // Resume
    createButton(
      height * 0.49,
      "RESUME",
      0x718F6A,
      () => this.resumeGame()
    );

    // Restart
    createButton(
      height * 0.62,
      "RESTART",
      0xB87932,
      () => this.scene.restart()
    );

    // Main Menu
    createButton(
      height * 0.75,
      "MAIN MENU",
      0xA96F5B,
      () => {
        this.scene.start("MenuScene");
      }
    );

    this.pauseElements.setDepth(100);
  }

  // ==================================
  // GAME OVER
  // ==================================

  endGame() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.isPaused = false;
    this.isJumping = false;

    // Simpan skor ketika Game Over
    this.saveScore();

    this.tweens.killTweensOf(this.player);

    this.coins.forEach(coin => {
      this.tweens.killTweensOf(coin);
    });

    const width = this.width;
    const height = this.height;
    const s = this.unitScale;

    this.gameOverElements = this.add.container(0, 0);

    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x26332D,
      0.75
    );

    const title = this.add.text(
      width / 2,
      height * 0.32,
      "GAME OVER",
      {
        fontSize: `${42 * s}px`,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#FFFFFF"
      }
    ).setOrigin(0.5);

    const subtitle = this.add.text(
      width / 2,
      height * 0.43,
      "Oops! Kamu menabrak rintangan.",
      {
        fontSize: `${18 * s}px`,
        fontFamily: "Arial",
        color: "#E8E3D5"
      }
    ).setOrigin(0.5);

    const finalScore = this.add.text(
      width / 2,
      height * 0.55,
      `FINAL SCORE: ${this.score}
TOTAL COINS: ${this.coinsCollected}
BEST SCORE: ${this.bestScore}`,
      {
        fontSize: `${20 * s}px`,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#F7D779",
        align: "center",
        lineSpacing: 8 * s
      }
    ).setOrigin(0.5);

    const restartButton = this.add.rectangle(
      width / 2,
      height * 0.75,
      190 * s,
      55 * s,
      0x718F6A
    ).setInteractive({ useHandCursor: true });

    const restartText = this.add.text(
      width / 2,
      height * 0.75,
      "RESTART",
      {
        fontSize: `${20 * s}px`,
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#FFFFFF"
      }
    ).setOrigin(0.5);

    restartButton.on("pointerdown", () => {
      this.scene.restart();
    });

    this.gameOverElements.add([
      overlay,
      title,
      subtitle,
      finalScore,
      restartButton,
      restartText
    ]);

    this.gameOverElements.setDepth(100);
  }

  // ==================================
  // RESPONSIVE SAAT UKURAN LAYAR BERUBAH
  // ==================================

  handleResize() {
    if (!this.scene.isActive()) return;

    const oldWidth = this.width;
    const oldHeight = this.height;

    this.updateDimensions();

    const ratioX = this.width / oldWidth;
    const ratioY = this.height / oldHeight;

    // ==================================
    // POSISI KARAKTER
    // ==================================

    if (this.player) {
      this.tweens.killTweensOf(this.player);

      this.player.x = this.width * 0.1875;

      this.player.y = this.isJumping
        ? this.groundY - 175 * this.sy
        : this.groundY;

      this.player.setScale(this.unitScale);

      // Lanjutkan animasi lompat setelah resize
      if (this.isJumping && !this.gameOver) {
        this.tweens.add({
          targets: this.player,
          y: this.groundY,
          duration: 250,
          ease: "Quad.easeIn",

          onComplete: () => {
            if (!this.gameOver && !this.isPaused) {
              this.player.y = this.groundY;
              this.isJumping = false;
            }
          }
        });
      }
    }

    // ==================================
    // BACKGROUND
    // ==================================

    if (this.sun) {
      this.sun.destroy();
    }

    this.farSegments.forEach(segment => {
      segment.destroy();
    });

    this.environmentSegments.forEach(segment => {
      segment.destroy();
    });

    this.createBackground();

    // ==================================
    // JALAN
    // ==================================

    if (this.roadElements) {
      this.roadElements.destroy();
    }

    this.roadLines.forEach(line => {
      line.destroy();
    });

    this.createRoad();

    // ==================================
    // OBSTACLE
    // ==================================

    this.obstacles.forEach(obstacle => {
      obstacle.x *= ratioX;
      obstacle.y = this.groundY;
      obstacle.setScale(this.unitScale);
    });

    // ==================================
    // KOIN
    // ==================================

    this.coins.forEach(coin => {
      this.tweens.killTweensOf(coin);

      coin.x *= ratioX;
      coin.y *= ratioY;

      coin.setScale(this.unitScale);

      this.tweens.add({
        targets: coin,
        scaleX: this.unitScale * 0.65,
        duration: 450,
        yoyo: true,
        repeat: -1
      });
    });

    // ==================================
    // HUD SCORE
    // ==================================

    if (this.scoreText) {
      this.scoreText.setPosition(
        25 * this.unitScale,
        18 * this.unitScale
      );

      this.scoreText.setFontSize(
        `${Math.max(14, 22 * this.unitScale)}px`
      );
    }

    // ==================================
    // HUD COIN
    // ==================================

    if (this.coinText) {
      this.coinText.setPosition(
        this.width - 105 * this.unitScale,
        18 * this.unitScale
      );

      this.coinText.setFontSize(
        `${Math.max(14, 22 * this.unitScale)}px`
      );
    }

    // ==================================
    // TOMBOL PAUSE
    // ==================================

    if (this.pauseButton && this.pauseLabel) {
      this.pauseButton.setPosition(
        this.width - 45 * this.unitScale,
        30 * this.unitScale
      );

      this.pauseButton.setSize(
        65 * this.unitScale,
        34 * this.unitScale
      );

      this.pauseLabel.setPosition(
        this.width - 45 * this.unitScale,
        30 * this.unitScale
      );

      this.pauseLabel.setFontSize(
        `${Math.max(10, 12 * this.unitScale)}px`
      );
    }

    // ==================================
    // PERBARUI OVERLAY
    // ==================================

    if (this.gameOver && this.gameOverElements) {
      this.gameOverElements.destroy();
      this.gameOverElements = null;

      this.gameOver = false;
      this.endGame();
    } else if (this.isPaused && this.pauseElements) {
      this.pauseElements.destroy();
      this.pauseElements = null;

      this.createPauseMenu();
    }

    // Jika masih pause, jeda juga tween baru setelah resize
    if (this.isPaused) {
      this.tweens.pauseAll();
    }
  }

  // ==================================
  // UPDATE GAME
  // ==================================

  update(time, delta) {
    // Berhenti ketika Game Over atau Pause
    if (this.gameOver || this.isPaused) return;

    const movement = this.gameSpeed * (delta / 1000);

    // ==================================
    // SCORE
    // ==================================

    this.scoreTimer += delta;

    while (this.scoreTimer >= 1000) {
      this.score++;
      this.scoreTimer -= 1000;

      this.scoreText.setText(
        "SCORE: " + this.score
      );
    }

    // ==================================
    // BACKGROUND JAUH
    // ==================================

    this.farSegments.forEach(segment => {
      segment.x -= movement * 0.15;

      if (segment.x <= -this.segmentWidth) {
        const rightmost = Math.max(
          ...this.farSegments.map(item => item.x)
        );

        segment.x = rightmost + this.segmentWidth;

        segment.removeAll(true);

        this.drawFarEnvironment(
          segment,
          Phaser.Math.Between(0, 3)
        );
      }
    });

    // ==================================
    // LINGKUNGAN UTAMA
    // ==================================

    this.environmentSegments.forEach(segment => {
      segment.x -= movement * 0.65;

      if (segment.x <= -this.segmentWidth) {
        const rightmost = Math.max(
          ...this.environmentSegments.map(item => item.x)
        );

        segment.x = rightmost + this.segmentWidth;

        segment.removeAll(true);

        const type = this.environmentTypes[
          this.nextEnvironment
        ];

        this.drawEnvironment(segment, type);

        this.nextEnvironment =
          (this.nextEnvironment + 1) %
          this.environmentTypes.length;
      }
    });

    // ==================================
    // GARIS JALAN
    // ==================================

    this.roadLines.forEach(line => {
      line.x -= movement;

      if (line.x < -50 * this.unitScale) {
        line.x += this.width + 100 * this.unitScale;
      }
    });

    // ==================================
    // SPAWN BERGANTIAN
    // ==================================

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.nextSpawnIn) {
      if (this.nextSpawnType === "coin") {
        this.spawnCoinTrail();

        this.nextSpawnType = "obstacle";
        this.nextSpawnIn = 4800;
      } else {
        this.spawnObstacle();

        this.nextSpawnType = "coin";
        this.nextSpawnIn = 4200;
      }

      this.spawnTimer = 0;
    }

    // ==================================
    // OBSTACLE
    // ==================================

    for (
      let i = this.obstacles.length - 1;
      i >= 0;
      i--
    ) {
      const obstacle = this.obstacles[i];

      obstacle.x -= movement;

      if (this.checkCollision(obstacle)) {
        this.endGame();
        return;
      }

      if (obstacle.x < -100 * this.unitScale) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }

    // ==================================
    // COIN
    // ==================================

    for (
      let i = this.coins.length - 1;
      i >= 0;
      i--
    ) {
      const coin = this.coins[i];

      coin.x -= movement;

      if (this.checkCoinCollision(coin)) {
        this.collectCoin(coin, i);
        continue;
      }

      if (coin.x < -50 * this.unitScale) {
        this.tweens.killTweensOf(coin);
        coin.destroy();

        this.coins.splice(i, 1);
      }
    }

    // ==================================
    // KEYBOARD UNTUK LOMPAT
    // ==================================

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE)
    ) {
      this.jump();
    }
  }
}