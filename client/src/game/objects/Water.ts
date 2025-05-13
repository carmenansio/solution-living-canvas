// @ts-nocheck

/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Phaser from 'phaser';
import { WorldObject } from './WorldObject';

class WaterColumn {
  index: number;
  x: number;
  y: number;
  targetY: number;
  speed: number;

  constructor(x = 0, y = 0, index = 0) {
    this.index = index;
    this.x = x;
    this.y = y;
    this.targetY = y;
    this.speed = 0.5;
  }

  update(dampening, tension) {
    const y = this.targetY - this.y;
    this.speed += tension * y - this.speed * dampening;
    this.y += this.speed;
  }
}

interface WaterConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  tension: number;
  dampening: number;
  renderDepth: number;
  spread: number;
  texture: string;
}

const WaterDefaults: WaterConfig = {
  x: 0,
  y: 0,
  w: 100,
  h: 100,
  depth: 50,
  dampening: 0.1,
  renderDepth: 1,
  spread: 0.25,
  tension: 0.01,
  texture: 'waterbody',
};

export class Water extends Phaser.GameObjects.Sprite {
  debug: boolean;
  config: WaterConfig;
  columns: WaterColumn[];
  body;
  background;
  sensor;
  debugGraphic;
  emitter;
  floatingObjects: WorldObject[];

  constructor(scene, option: WaterConfig) {
    super(scene, 0, 0);

    this.config = { ...WaterDefaults, ...option };
    if (this.config.texture.length == 0) {
      throw new Error('Water requires a texture');
    }

    this.debug = false;
    this.setPosition(this.config.x, this.config.y);
    this.setSize(this.config.w, this.config.h);
    this.config.depth = Math.min(this.config.depth, this.config.h);

    const coords = [
      0,
      this.config.h - this.config.depth,
      this.config.w,
      this.config.h - this.config.depth,
    ];
    const surface = new Phaser.Geom.Line(...coords);
    const points = surface.getPoints(0, 20);
    this.columns = [
      ...points,
      {
        x: this.config.w,
        y: coords[1],
      },
    ].map(({ x, y }, i) => new WaterColumn(x, y, i));

    const data = this.columns.reduce<number[]>(
      (cache, { x, y }) => [...cache, x, y],
      []
    );
    this.body = scene.add
      .polygon(this.config.x, this.config.y, [
        coords[0],
        this.config.h,
        ...data,
        coords[2],
        this.config.h,
      ])
      .setFillStyle(0x145dd1, 0)
      .setDepth(99)
      .setOrigin(0, 0);

    if (typeof this.config.texture === 'string') {
      this.background = scene.add
        .tileSprite(
          this.config.x,
          this.config.y,
          this.config.w,
          this.config.h,
          this.config.texture
        )
        .setAlpha(0.75)
        .setDepth(this.config.renderDepth)
        .setOrigin(0, 0);

      this.background.mask = new Phaser.Display.Masks.GeometryMask(
        scene,
        this.body
      );
    }

    this.sensor = scene.matter.add.rectangle(
      this.config.x + this.config.w / 2,
      this.config.y + this.config.h - this.config.depth / 2,
      this.config.w,
      this.config.depth,
      { isSensor: true, isStatic: true }
    );

    this.debugGraphic = scene.add.graphics({
      fillStyle: {
        color: 0xffffff,
      },
    });

    this.emitter = scene.add.particles(0, 0, 'droplet', {
      tint: 0x0b5095,
      speed: { min: 100, max: 500 },
      angle: { min: 240, max: 300 },
      scale: { min: 0.1, max: 0.5 },
      gravityY: 1000,
      lifespan: 4000,
    });
    this.emitter.explode(0, 0, 0);

    this.floatingObjects = [];
  }

  preUpdate() {
    this.columns.forEach((column) =>
      column.update(this.config.dampening, this.config.tension)
    );

    if (this.body.geom == null) return;

    const data = this.columns.reduce<number[]>(
      (cache, { x, y }) => [...cache, x, y],
      []
    );
    this.body.geom.setTo([
      0,
      this.config.h,
      ...data,
      this.config.w,
      this.config.h,
    ]);
    this.body.updateData();

    this.debugGraphic.clear();
    if (this.debug) {
      this.columns.forEach(({ x, y }) =>
        this.debugGraphic.fillRect(
          this.config.x + x - 1,
          this.config.y + y - 1,
          2,
          2
        )
      );
    }

    let lDeltas = Array(this.columns.length).fill(0);
    let rDeltas = Array(this.columns.length).fill(0);

    for (let i = 0; i < 1; i++) {
      for (let j = 0; j < this.columns.length - 1; j++) {
        if (j > 0) {
          const currColumn = this.columns[j];
          const prevColumn = this.columns[j - 1];

          lDeltas[j] = this.config.spread * (currColumn.y - prevColumn.y);
          prevColumn.speed += lDeltas[j];
        }

        if (j < this.columns.length - 1) {
          const currColumn = this.columns[j];
          const nextColumn = this.columns[j + 1];

          rDeltas[j] = this.config.spread * (currColumn.y - nextColumn.y);
          nextColumn.speed += rDeltas[j];
        }
      }

      for (let j = 0; j < this.columns.length - 1; j++) {
        if (j > 0) {
          const prevColumn = this.columns[j - 1];
          prevColumn.y += lDeltas[j];
        }

        if (j < this.columns.length - 1) {
          const nextColumn = this.columns[j + 1];
          nextColumn.y += rDeltas[j];
        }
      }
    }

    for (let i = 0; i < this.floatingObjects.length; i++) {
      const target = this.floatingObjects[i].gameObject;
      const idx = this.columns.findIndex(
        (col, idx) => col.x >= target.x && idx
      );
      let column =
        this.columns[Phaser.Math.Clamp(idx, 0, this.columns.length - 1)];

      target.setPosition(
        target.x,
        this.config.y + column.y + target.prop.floatOffset
      );
      target.setAngle(0);
    }
  }

  createSplash(gameObject, newFriction) {
    const i = this.columns.findIndex(
      (col, i) => col.x >= gameObject.position.x && i
    );
    const speed = gameObject.speed * 3;
    const numDroplets = Math.ceil(gameObject.speed) * 5;

    gameObject.frictionAir = newFriction;

    let column = this.columns[Phaser.Math.Clamp(i, 0, this.columns.length - 1)];
    column.speed = speed;

    this.emitter.explode(
      numDroplets,
      this.config.x + column.x,
      this.config.y + column.y
    );
  }

  setDebug(bool) {
    this.debug = bool;

    return this;
  }

  addFloating(item) {
    if (item.gameObject instanceof WorldObject && item.gameObject.prop.floats) {
      this.floatingObjects.push(item);
    }
  }

  removeFloating(item) {
    if (item.gameObject instanceof WorldObject && item.gameObject.prop.floats) {
      this.floatingObjects.splice(this.floatingObjects.indexOf(item), 1);
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'water',
  function (this: Phaser.GameObjects.GameObjectFactory, option: WaterConfig) {
    const obj = new Water(this.scene, option);
    this.displayList.add(obj);
    this.updateList.add(obj);
    return obj;
  }
);
