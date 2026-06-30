import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/deployment';
import { sessionStore } from '../state/sessionStore';
import { getRatingDisplay } from '../systems/rating';
import { drawSpeechBubble, generatePlaceholderTextures } from '../utils/sprites';
import type { KitchenStation, KitchenStationType } from '../types';

const DOORS = [
  { id: 'normal', label: 'Normal Mode', x: 80, y: 420 },
  { id: 'hard', label: 'Hard Mode', x: 195, y: 420 },
  { id: 'free', label: 'Free Cook', x: 310, y: 420 },
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    generatePlaceholderTextures(this);
    this.scene.start('HomeRoomScene');
  }
}

export class HomeRoomScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private target: Phaser.Math.Vector2 | null = null;
  private doors: Phaser.GameObjects.Container[] = [];
  private ratingText!: Phaser.GameObjects.Text;
  private modeTransitioning = false;

  constructor() {
    super('HomeRoomScene');
  }

  create(): void {
    this.doors = [];
    this.target = null;
    this.modeTransitioning = false;
    this.drawRoom();
    const profile = sessionStore.getProfile();

    this.player = this.physics.add.sprite(GAME_WIDTH / 2, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.5);

    this.cursors = this.input.keyboard!.createCursorKeys();
    const kc = profile.keyboardControls;
    this.keys = {
      up: this.input.keyboard!.addKey(kc.up),
      down: this.input.keyboard!.addKey(kc.down),
      left: this.input.keyboard!.addKey(kc.left),
      right: this.input.keyboard!.addKey(kc.right),
      w: this.input.keyboard!.addKey('W'),
      a: this.input.keyboard!.addKey('A'),
      s: this.input.keyboard!.addKey('S'),
      d: this.input.keyboard!.addKey('D'),
    };

    for (const door of DOORS) {
      const container = this.add.container(door.x, door.y);
      const sprite = this.add.image(0, 0, 'door');
      const label = this.add
        .text(0, 28, door.label, { fontSize: '10px', color: '#fff', align: 'center' })
        .setOrigin(0.5);
      container.add([sprite, label]);
      container.setSize(28, 36);
      container.setData('doorId', door.id);
      this.doors.push(container);
    }

    this.add
      .text(GAME_WIDTH / 2, 40, `Welcome, ${profile.name}!`, {
        fontSize: '16px',
        color: '#fff8dc',
      })
      .setOrigin(0.5);

    this.ratingText = this.add
      .text(GAME_WIDTH / 2, 64, getRatingDisplay(profile), {
        fontSize: '12px',
        color: '#ffd699',
      })
      .setOrigin(0.5);

    const menuBtn = this.add
      .text(GAME_WIDTH - 20, 20, 'Menu', { fontSize: '14px', color: '#fff' })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.game.events.emit('open-home-menu'));

    drawSpeechBubble(this, GAME_WIDTH / 2, 120, 'Walk to a door to choose your mode.', 'Tip');

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > 80 && pointer.y < 650) this.target = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });

    const refreshHome = () => {
      this.ratingText.setText(getRatingDisplay(sessionStore.getProfile()));
    };
    this.game.events.off('refresh-home');
    this.game.events.on('refresh-home', refreshHome);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('refresh-home', refreshHome);
    });
  }

  update(): void {
    const speed = 140;
    let vx = 0;
    let vy = 0;

    if (this.keys.up.isDown || this.keys.w.isDown || this.cursors.up.isDown) vy = -speed;
    if (this.keys.down.isDown || this.keys.s.isDown || this.cursors.down.isDown) vy = speed;
    if (this.keys.left.isDown || this.keys.a.isDown || this.cursors.left.isDown) vx = -speed;
    if (this.keys.right.isDown || this.keys.d.isDown || this.cursors.right.isDown) vx = speed;

    if (this.target && vx === 0 && vy === 0) {
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) {
        this.target = null;
      } else {
        vx = (dx / dist) * speed;
        vy = (dy / dist) * speed;
      }
    }

    this.player.setVelocity(vx, vy);

    for (const door of this.doors) {
      const bounds = door.getBounds();
      if (!this.modeTransitioning && Phaser.Geom.Rectangle.Contains(bounds, this.player.x, this.player.y)) {
        this.modeTransitioning = true;
        const id = door.getData('doorId') as string;
        this.game.events.emit('enter-mode', id);
        this.target = null;
        this.player.setVelocity(0, 0);
      }
    }
  }

  private drawRoom(): void {
    for (let y = 60; y < GAME_HEIGHT - 60; y += 32) {
      for (let x = 20; x < GAME_WIDTH - 20; x += 32) {
        this.add.image(x, y, 'floor').setOrigin(0);
      }
    }
    this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 60, 0x5c4a1f);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH, 80, 0x5c4a1f);
  }
}

export class KitchenScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private target: Phaser.Math.Vector2 | null = null;
  private stationSprites: Phaser.GameObjects.Container[] = [];
  private timerText!: Phaser.GameObjects.Text;
  private fictionalText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private actionKeys!: Phaser.Input.Keyboard.Key[];
  private remainingSeconds = 180;
  private fictionalMinutes = 60;
  private paused = false;
  private handsUp = false;

  constructor() {
    super('KitchenScene');
  }

  create(): void {
    this.stationSprites = [];
    this.target = null;
    this.drawKitchen();
    const profile = sessionStore.getProfile();
    this.remainingSeconds = 180;
    this.fictionalMinutes = 60;
    this.paused = false;
    this.handsUp = false;

    this.physics.world.setBounds(0, 0, 980, 1370);
    this.cameras.main.setBounds(0, 0, 980, 1370);
    this.cameras.main.setZoom(1.45);

    this.player = this.physics.add.sprite(490, 1240, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.8);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      up: this.input.keyboard!.addKey(profile.keyboardControls.up),
      down: this.input.keyboard!.addKey(profile.keyboardControls.down),
      left: this.input.keyboard!.addKey(profile.keyboardControls.left),
      right: this.input.keyboard!.addKey(profile.keyboardControls.right),
      w: this.input.keyboard!.addKey('W'),
      a: this.input.keyboard!.addKey('A'),
      s: this.input.keyboard!.addKey('S'),
      d: this.input.keyboard!.addKey('D'),
    };
    this.actionKeys = [
      this.input.keyboard!.addKey('SPACE'),
      this.input.keyboard!.addKey('ENTER'),
      this.input.keyboard!.addKey('E'),
    ];

    import('../data/kitchenLayout').then(({ KITCHEN_STATIONS }) => {
      if (!this.scene.isActive(this.scene.key)) return;
      for (const station of KITCHEN_STATIONS) {
        const c = this.add.container(station.x + station.width / 2, station.y + station.height / 2);
        c.add(this.createStationArt(station));
        const label = this.add
          .text(0, station.height / 2 + 12, station.label, { fontSize: '16px', color: '#fff8dc', stroke: '#2b2118', strokeThickness: 3 })
          .setOrigin(0.5);
        c.add(label);
        c.setSize(station.width, station.height);
        c.setData('station', station);
        this.stationSprites.push(c);
      }
    });

    this.timerText = this.add.text(10, 10, '', { fontSize: '14px', color: '#fff8dc', stroke: '#2b2118', strokeThickness: 2 }).setScrollFactor(0);
    this.fictionalText = this.add.text(10, 28, '', { fontSize: '11px', color: '#ffd699', stroke: '#2b2118', strokeThickness: 2 }).setScrollFactor(0);
    this.promptText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 76, '', {
        fontSize: '12px',
        color: '#fff8dc',
        backgroundColor: '#2b2118',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.updateTimerDisplay();

    const pauseBtn = this.add
      .text(GAME_WIDTH - 10, 10, 'Pause', { fontSize: '14px', color: '#fff' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.game.events.emit('open-pause'));

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.handsUp || this.paused) return;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.target = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);
    });

    const setKitchenPaused = (v: boolean) => {
      this.paused = v;
    };
    const markHandsUp = () => {
      this.handsUp = true;
      this.player.setVelocity(0, 0);
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'HANDS UP!', {
          fontSize: '32px',
          color: '#ff6b6b',
          backgroundColor: '#2b2118',
        })
        .setOrigin(0.5);
      this.game.events.emit('hands-up');
    };
    this.game.events.off('kitchen-pause');
    this.game.events.off('kitchen-hands-up');
    this.game.events.on('kitchen-pause', setKitchenPaused);
    this.game.events.on('kitchen-hands-up', markHandsUp);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('kitchen-pause', setKitchenPaused);
      this.game.events.off('kitchen-hands-up', markHandsUp);
    });
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.handsUp) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.remainingSeconds -= delta / 1000;
    this.fictionalMinutes = Math.max(0, Math.round((this.remainingSeconds / 180) * 60));
    this.updateTimerDisplay();

    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = 0;
      this.game.events.emit('kitchen-hands-up');
      return;
    }

    const speed = 130;
    let vx = 0;
    let vy = 0;
    if (this.keys.up.isDown || this.keys.w.isDown || this.cursors.up.isDown) vy = -speed;
    if (this.keys.down.isDown || this.keys.s.isDown || this.cursors.down.isDown) vy = speed;
    if (this.keys.left.isDown || this.keys.a.isDown || this.cursors.left.isDown) vx = -speed;
    if (this.keys.right.isDown || this.keys.d.isDown || this.cursors.right.isDown) vx = speed;

    if (this.target && vx === 0 && vy === 0) {
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) this.target = null;
      else {
        vx = (dx / dist) * speed;
        vy = (dy / dist) * speed;
      }
    }
    this.player.setVelocity(vx, vy);

    const nearby = this.getNearbyStation();
    this.promptText.setText(nearby ? `Press Space/Enter: ${nearby.label}` : '');
    if (nearby && this.actionKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      this.target = null;
      this.player.setVelocity(0, 0);
      this.game.events.emit('interact-station', nearby);
    }
  }

  private updateTimerDisplay(): void {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = Math.floor(this.remainingSeconds % 60);
    this.timerText.setText(`Time: ${m}:${s.toString().padStart(2, '0')}`);
    this.fictionalText.setText(`Challenge clock: ${this.fictionalMinutes} min left`);
  }

  private drawKitchen(): void {
    this.cameras.main.setBackgroundColor('#6d4b2d');
    for (let y = 70; y < 1250; y += 32) {
      for (let x = 30; x < 950; x += 32) {
        this.add.image(x, y, 'floor').setOrigin(0);
      }
    }
    this.add.rectangle(490, 35, 980, 70, 0x4d3325);
    this.add.rectangle(490, 1310, 980, 120, 0x4d3325);
    this.add.rectangle(15, 685, 30, 1370, 0x4d3325);
    this.add.rectangle(965, 685, 30, 1370, 0x4d3325);
  }

  private getNearbyStation(): KitchenStation | null {
    let closest: KitchenStation | null = null;
    let closestDistance = 999;
    for (const sprite of this.stationSprites) {
      const station = sprite.getData('station') as KitchenStation;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
      if (distance < 105 && distance < closestDistance) {
        closest = station;
        closestDistance = distance;
      }
    }
    return closest;
  }

  private createStationArt(station: KitchenStation): Phaser.GameObjects.GameObject[] {
    const w = station.width;
    const h = station.height;
    const objects: Phaser.GameObjects.GameObject[] = [];
    const addBody = (color: number, stroke = 0x37251b) => {
      const body = this.add.rectangle(0, 0, w, h, color).setStrokeStyle(4, stroke);
      objects.push(body);
      return body;
    };
    const type = station.type;
    const body = addBody(this.stationColor(type));

    if (type === 'pantry') {
      objects.push(this.add.rectangle(0, -16, w - 18, 12, 0xd7a94f), this.add.rectangle(0, 12, w - 18, 12, 0xd7a94f));
      objects.push(this.add.circle(-26, -16, 7, 0xf1ddbd), this.add.circle(14, 12, 7, 0x8f5a2d));
    } else if (type === 'refrigerator' || type === 'freezer') {
      objects.push(this.add.rectangle(0, -h * 0.18, w - 16, 3, 0xdcefff), this.add.rectangle(-w * 0.34, 0, 5, h - 16, 0xdcefff));
      objects.push(this.add.circle(w * 0.25, type === 'freezer' ? -8 : 12, 6, 0x6fb7e8));
    } else if (type === 'sink') {
      objects.push(this.add.ellipse(0, 2, w - 26, h - 26, 0xcfe6ef), this.add.rectangle(0, -h * 0.35, 24, 12, 0xa8b8c0));
    } else if (type === 'prep_counter') {
      objects.push(this.add.ellipse(-24, 4, 38, 24, 0xf6ead7).setStrokeStyle(3, 0x7f6040), this.add.ellipse(24, 4, 38, 24, 0xf6ead7).setStrokeStyle(3, 0x7f6040));
    } else if (type === 'measuring') {
      objects.push(this.add.rectangle(-18, 0, 22, 36, 0xffffff).setStrokeStyle(3, 0x6b4226), this.add.text(13, -8, '1c', { fontSize: '13px', color: '#2b2118' }).setOrigin(0.5));
    } else if (type === 'cutting') {
      objects.push(this.add.rectangle(-8, 2, 54, 30, 0xf1ddbd).setStrokeStyle(3, 0x8a5b35), this.add.rectangle(18, -6, 38, 6, 0xdce6ef).setAngle(-25));
    } else if (type === 'electric_mixer') {
      objects.push(this.add.circle(0, 14, 25, 0xf2c9a5), this.add.rectangle(0, -14, 54, 34, 0xd55f3a).setStrokeStyle(3, 0x74331d));
    } else if (type === 'blender') {
      objects.push(this.add.triangle(0, 4, -22, 28, 22, 28, 12, -28, 0xcdebf4).setStrokeStyle(3, 0x355467), this.add.rectangle(0, 28, 48, 12, 0x6a7d86));
    } else if (type === 'food_processor') {
      objects.push(this.add.rectangle(0, 8, 58, 38, 0xcdebf4).setStrokeStyle(3, 0x355467), this.add.circle(0, -20, 12, 0x7d8f78));
    } else if (type === 'stove') {
      objects.push(this.add.circle(-24, -12, 12, 0x1d2328), this.add.circle(24, -12, 12, 0x1d2328), this.add.circle(-24, 18, 12, 0x1d2328), this.add.circle(24, 18, 12, 0x1d2328));
    } else if (type === 'oven') {
      objects.push(this.add.rectangle(0, 10, w - 26, h - 42, 0x1d2328).setStrokeStyle(4, 0x9ba7ad), this.add.rectangle(0, -34, w - 18, 14, 0xb94f2b));
    } else if (type === 'microwave') {
      objects.push(this.add.rectangle(-12, 0, 54, 42, 0xdcefff).setStrokeStyle(3, 0x355467), this.add.rectangle(34, 0, 18, 42, 0x2b2118));
    } else if (type === 'proofing') {
      objects.push(this.add.rectangle(0, 8, 60, 34, 0xf4d789).setStrokeStyle(3, 0x8a5b35), this.add.text(0, -18, 'rise', { fontSize: '14px', color: '#fff8dc' }).setOrigin(0.5));
    } else if (type === 'cooling') {
      objects.push(this.add.rectangle(0, 0, 70, 6, 0xdce6ef), this.add.rectangle(0, 18, 70, 6, 0xdce6ef), this.add.text(0, -18, 'cool', { fontSize: '14px', color: '#fff8dc' }).setOrigin(0.5));
    } else if (type === 'decorating') {
      objects.push(this.add.rectangle(0, 10, 68, 28, 0xf6d7d7).setStrokeStyle(3, 0x8f3f25), this.add.rectangle(-22, -18, 14, 34, 0xfff7f1), this.add.rectangle(20, -18, 14, 34, 0xf4c542));
    } else if (type === 'plating') {
      objects.push(this.add.ellipse(0, 4, 70, 44, 0xfffdf7).setStrokeStyle(4, 0x9f7246));
    } else if (type === 'trash') {
      objects.push(this.add.rectangle(0, 8, 42, 52, 0x5f6a56).setStrokeStyle(3, 0x2f382c), this.add.rectangle(0, -24, 54, 10, 0x2f382c));
    } else if (type === 'judging') {
      objects.push(this.add.rectangle(0, 12, 88, 28, 0x8f5a2d).setStrokeStyle(3, 0x4f301a), this.add.text(0, -14, 'JUDGE', { fontSize: '16px', color: '#fff8dc' }).setOrigin(0.5));
    }

    body.setDepth(-1);
    return objects;
  }

  private stationColor(type: KitchenStationType): number {
    const colors: Partial<Record<KitchenStationType, number>> = {
      pantry: 0x8a5b35,
      refrigerator: 0x8fc7e8,
      freezer: 0x6fb7e8,
      sink: 0x9ba7ad,
      prep_counter: 0xb9875c,
      measuring: 0xd7a94f,
      cutting: 0x7d8f78,
      electric_mixer: 0xb94f2b,
      blender: 0x6a9fb5,
      food_processor: 0x6a9fb5,
      stove: 0x2f3438,
      oven: 0x5f4b42,
      microwave: 0x8c9aa3,
      proofing: 0xaa7b42,
      cooling: 0x6e8f98,
      decorating: 0xd6849b,
      plating: 0xc9b48d,
      trash: 0x4f6748,
      judging: 0x5c4a1f,
    };
    return colors[type] ?? 0xb9875c;
  }
}
