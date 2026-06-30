import Phaser from 'phaser';
import type { CharacterAppearance } from '../types';

export function generatePlaceholderTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });

  g.fillStyle(0xdab98b, 1);
  g.fillRect(0, 0, 32, 32);
  g.lineStyle(1, 0xc99f6c, 1);
  g.strokeRect(0, 0, 32, 32);
  g.fillStyle(0xe4c99f, 1);
  g.fillRect(1, 1, 14, 14);
  g.fillRect(17, 17, 14, 14);
  g.generateTexture('floor', 32, 32);
  g.clear();

  g.fillStyle(0x8b6914, 1);
  g.fillRect(0, 0, 32, 32);
  g.lineStyle(2, 0x5c4a1f);
  g.strokeRect(0, 0, 32, 32);
  g.generateTexture('wall', 32, 32);
  g.clear();

  g.fillStyle(0xf1ddbd, 1);
  g.fillRoundedRect(0, 0, 48, 24, 4);
  g.fillStyle(0xb96a3a, 1);
  g.fillRect(4, 15, 40, 5);
  g.fillStyle(0x7d8f78, 1);
  g.fillCircle(12, 8, 4);
  g.fillCircle(24, 8, 4);
  g.fillCircle(36, 8, 4);
  g.lineStyle(2, 0x8a5b35);
  g.strokeRoundedRect(0, 0, 48, 24, 4);
  g.generateTexture('station', 48, 24);
  g.clear();

  g.fillStyle(0x5b3b2a, 1);
  g.fillRoundedRect(8, 0, 16, 12, 3);
  g.fillStyle(0xf5c99a, 1);
  g.fillRoundedRect(10, 10, 12, 12, 3);
  g.fillStyle(0xc45c26, 1);
  g.fillRoundedRect(8, 21, 16, 10, 2);
  g.fillStyle(0xfff8dc, 1);
  g.fillRect(14, 21, 4, 10);
  g.generateTexture('player', 32, 32);
  g.clear();

  g.fillStyle(0x425f7b, 1);
  g.fillRoundedRect(0, 0, 28, 36, 3);
  g.fillStyle(0x6f9abd, 1);
  g.fillRect(4, 4, 20, 10);
  g.fillStyle(0xffd36b, 1);
  g.fillCircle(22, 20, 2);
  g.lineStyle(2, 0x26384b);
  g.strokeRoundedRect(0, 0, 28, 36, 3);
  g.generateTexture('door', 28, 36);
  g.clear();

  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(0, 0, 120, 48, 8);
  g.lineStyle(2, 0x333333);
  g.strokeRoundedRect(0, 0, 120, 48, 8);
  g.generateTexture('bubble', 120, 48);
  g.destroy();
}

export function tintPlayerSprite(
  scene: Phaser.Scene,
  appearance: CharacterAppearance,
): Phaser.GameObjects.Sprite {
  const sprite = scene.add.sprite(0, 0, 'player');
  sprite.setTint(Phaser.Display.Color.HexStringToColor(appearance.clothingColor).color);
  return sprite;
}

export function drawSpeechBubble(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  speaker?: string,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const bg = scene.add.image(0, 0, 'bubble').setOrigin(0.5);
  bg.setScale(1.2, 1);
  const label = scene.add
    .text(0, 0, speaker ? `${speaker}: ${text}` : text, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#2b2118',
      wordWrap: { width: 130 },
      align: 'center',
    })
    .setOrigin(0.5);
  container.add([bg, label]);
  return container;
}
