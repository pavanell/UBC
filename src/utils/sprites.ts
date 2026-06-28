import Phaser from 'phaser';
import type { CharacterAppearance } from '../types';

export function generatePlaceholderTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });

  g.fillStyle(0xc4956a, 1);
  g.fillRect(0, 0, 32, 32);
  g.generateTexture('floor', 32, 32);
  g.clear();

  g.fillStyle(0x8b6914, 1);
  g.fillRect(0, 0, 32, 32);
  g.lineStyle(2, 0x5c4a1f);
  g.strokeRect(0, 0, 32, 32);
  g.generateTexture('wall', 32, 32);
  g.clear();

  g.fillStyle(0xd4a574, 1);
  g.fillRoundedRect(0, 0, 48, 24, 4);
  g.generateTexture('station', 48, 24);
  g.clear();

  g.fillStyle(0x6b4226, 1);
  g.fillRect(8, 0, 16, 12);
  g.fillStyle(0xf5c99a, 1);
  g.fillRect(10, 12, 12, 14);
  g.fillStyle(0xc45c26, 1);
  g.fillRect(8, 22, 16, 10);
  g.generateTexture('player', 32, 32);
  g.clear();

  g.fillStyle(0x5b7c99, 1);
  g.fillRect(0, 0, 28, 36);
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
