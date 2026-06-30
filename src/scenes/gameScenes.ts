import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/deployment';
import { sessionStore } from '../state/sessionStore';
import { getRatingDisplay } from '../systems/rating';
import { drawSpeechBubble, generatePlaceholderTextures } from '../utils/sprites';

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

    this.player = this.physics.add.sprite(195, 620, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.4);

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

    import('../data/kitchenLayout').then(({ KITCHEN_STATIONS }) => {
      if (!this.scene.isActive(this.scene.key)) return;
      for (const station of KITCHEN_STATIONS) {
        const c = this.add.container(station.x + station.width / 2, station.y + station.height / 2);
        const img = this.add.image(0, 0, 'station');
        const label = this.add
          .text(0, 16, station.label, { fontSize: '8px', color: '#2b2118' })
          .setOrigin(0.5);
        c.add([img, label]);
        c.setSize(station.width, station.height);
        c.setData('station', station);
        this.stationSprites.push(c);
      }
    });

    this.timerText = this.add.text(10, 10, '', { fontSize: '14px', color: '#fff8dc' });
    this.fictionalText = this.add.text(10, 28, '', { fontSize: '11px', color: '#ffd699' });
    this.updateTimerDisplay();

    const pauseBtn = this.add
      .text(GAME_WIDTH - 10, 10, 'Pause', { fontSize: '14px', color: '#fff' })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.game.events.emit('open-pause'));

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.handsUp || this.paused) return;
      const worldX = pointer.x;
      const worldY = pointer.y;
      let hitStation = false;
      for (const s of this.stationSprites) {
        if (s.getBounds().contains(worldX, worldY)) {
          hitStation = true;
          this.game.events.emit('interact-station', s.getData('station'));
          break;
        }
      }
      if (!hitStation) this.target = new Phaser.Math.Vector2(worldX, worldY);
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
  }

  private updateTimerDisplay(): void {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = Math.floor(this.remainingSeconds % 60);
    this.timerText.setText(`Time: ${m}:${s.toString().padStart(2, '0')}`);
    this.fictionalText.setText(`Challenge clock: ${this.fictionalMinutes} min left`);
  }

  private drawKitchen(): void {
    this.cameras.main.setBackgroundColor('#c4956a');
    for (let y = 60; y < 640; y += 32) {
      for (let x = 20; x < GAME_WIDTH - 20; x += 32) {
        this.add.image(x, y, 'floor').setOrigin(0);
      }
    }
  }
}
