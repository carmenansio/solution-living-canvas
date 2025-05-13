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

import { WorldObject } from '../objects/WorldObject';
import { LivingCanvasStage } from '../LivingCanvas.ts';

export class IOPuzzle_Fire extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Fire');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';

    this.load.image('fallback_bg_IOPuzzle_Fire', 'assets/io_puzzle_fire.jpg');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_fire.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Slope with ice wall';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'IOPuzzle_Windy';

    super.create();

    const xOffset = 0;
    const yOffset = -30;

    // Walls on either edge
    this.matter.add.rectangle(
      0 + xOffset,
      this.worldConfig.size.height / 2 + yOffset,
      40,
      this.worldConfig.size.height,
      { isStatic: true, frictionStatic: Infinity, label: 'cliff' }
    );
    this.matter.add.rectangle(
      this.worldConfig.size.width + xOffset,
      this.worldConfig.size.height / 2 + yOffset,
      40,
      this.worldConfig.size.height,
      { isStatic: true, frictionStatic: Infinity, label: 'cliff' }
    );

    // Floor
    this.matter.add.rectangle(252 + xOffset, 424 + yOffset, 464, 40, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'floor',
    });
    this.matter.add.rectangle(1033 + xOffset, 424 + yOffset, 464, 40, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'floor',
    });

    // Pit
    this.matter.add.rectangle(463 + xOffset, 480 + yOffset, 40, 140, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'pit',
    });
    this.matter.add.rectangle(823 + xOffset, 480 + yOffset, 40, 140, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'pit',
    });
    this.matter.add.rectangle(640 + xOffset, 670 + yOffset, 200, 40, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'pit',
    });
    this.matter.add.rectangle(510 + xOffset, 612 + yOffset, 140, 40, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'pit',
      angle: 45,
    });
    this.matter.add.rectangle(775, 580, 140, 40, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'pit',
      angle: -45,
    });

    // Ice block
    var wall_pos = new Phaser.Math.Vector2(644, 446);
    var wall_size = new Phaser.Math.Vector2(316, 100);
    var icewall = this.add.worldobject(
      'icewall',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );

    // Goal
    var goal_sprite = this.add.sprite(640, 590, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );

    // Key
    var object = this.add.worldobject('key', 640, 360);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
    this.matter.world.on('collisionactive', function (event) {
      scene.checkIceMelting(event, icewall, wall_pos, wall_size);
    });
  }
}

export class IOPuzzle_Windy extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Windy');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_IOPuzzle_Windy', 'assets/io_puzzle_windy.jpg');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_windy.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Cliff';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'IOPuzzle_Ice';

    super.create();

    this.matter.add.rectangle(75, 125, 150, 250, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(345, 450, 700, 420, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(
      this.worldConfig.size.width / 2,
      690,
      this.worldConfig.size.width,
      100,
      { isStatic: true, frictionStatic: Infinity, label: 'cliff' }
    );
    this.matter.add.rectangle(1205, 320, 150, 640, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });

    var goal_sprite = this.add.sprite(950, 610, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );
    var object = this.add.worldobject('key', 450, 50);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
  }
}

export class IOPuzzle_Ice extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Ice');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_IOPuzzle_Ice', 'assets/io_puzzle_ice.jpg');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_ice.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Mind the gaps';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'IOPuzzle_Metal';

    super.create();

    this.matter.add.rectangle(100, 230, 200, 500, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(230, 610, 460, 260, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(595, 610, 120, 260, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(1015, 610, 546, 260, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(1180, 230, 200, 500, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(496, 645, 80, 196, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(696, 675, 80, 132, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });

    // var wall_pos = new Phaser.Math.Vector2(597, 350);
    // var wall_size = new Phaser.Math.Vector2(64, 250);

    var wall_pos = new Phaser.Math.Vector2(595, 402);
    var wall_size = new Phaser.Math.Vector2(120, 150);
    var icewall = this.add.worldobject(
      'icewall',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );

    var goal_sprite = this.add.sprite(1000, 450, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );
    var object = this.add.worldobject('icekey', 400, 390);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });

    this.matter.world.on('collisionactive', function (event) {
      scene.checkIceMelting(event, icewall, wall_pos, wall_size);
    });
  }
}

export class IOPuzzle_Metal extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Metal');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_IOPuzzle_Metal', 'assets/io_puzzle_metal.jpg');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_metal.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Stuck in the hole';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'IOPuzzle_Rain';

    super.create();

    const xOffset = 0;
    const yOffset = 20;

    this.matter.add.rectangle(100 + xOffset, 230 + yOffset, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(230 + xOffset, 590 + yOffset, 460, 260, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(906 + xOffset, 590 + yOffset, 748, 260, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(1180 + xOffset, 230 + yOffset, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(496 + xOffset, 622 + yOffset, 80, 196, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(500 + xOffset, 348 + yOffset, 144, 32, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });

    var goal_sprite = this.add.sprite(1000, 448, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );
    var object = this.add.worldobject('key', 496, 460);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
  }
}

export class IOPuzzle_Rain extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Rain');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_IOPuzzle_Rain', 'assets/io_puzzle_rain.jpg');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_rain.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Ice Key';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'IOPuzzle_Earth';

    super.create();

    this.matter.add.rectangle(100, 230, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(290, 590, 456, 232, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(964, 590, 505, 232, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(614, 632, 200, 170, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(1180, 230, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });

    this.add.worldobject('fire', 536, 500);
    this.add.worldobject('fire', 614, 500);
    this.add.worldobject('fire', 690, 500);

    var goal_sprite = this.add.sprite(1000, 445, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );
    var object = this.add.worldobject('icekey', 400, 390);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
  }
}

export class IOPuzzle_Earth extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Earth');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_IOPuzzle_Earth', 'assets/io_puzzle_earth.jpg');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_earth.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Boat';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'IOPuzzle_Lightning';

    super.create();

    this.matter.add.rectangle(100, 230, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(290, 600, 520, 235, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(964, 600, 565, 235, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(614, 700, 130, 40, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(1180, 230, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });

    this.matter.add.rectangle(548, 180, 64, 360, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(680, 180, 64, 360, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });

    this.add.worldobject('boat', 614, 460);

    var goal_sprite = this.add.sprite(1000, 450, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );
    var object = this.add.worldobject('key', 496, 390);

    this.water = this.add.water({
      w: this.worldConfig.size.width,
      h: this.worldConfig.size.height,
      depth: 230,
    });

    this.registerCollision(this.water);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
  }
}

export class IOPuzzle_Lightning extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Lightning');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image(
      'fallback_bg_IOPuzzle_Lightning',
      'assets/io_puzzle_lightning.jpg'
    );
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_lightning.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Lightning';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'IOPuzzle_Balance';

    super.create();

    const xOffset = 0;
    const yOffset = 20;

    this.matter.add.rectangle(100 + xOffset, 230 + yOffset, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(230 + xOffset, 590 + yOffset, 460, 260, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(906 + xOffset, 590 + yOffset, 748, 260, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(1180 + xOffset, 230 + yOffset, 200, 460, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(496 + xOffset, 622 + yOffset, 80, 196, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });
    this.matter.add.rectangle(500 + xOffset, 345 + yOffset, 144, 32, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'cliff',
    });

    this.add.worldobject('magnet', 496, 200);

    var goal_sprite = this.add.sprite(1000, 450, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );
    var object = this.add.worldobject('rustedkey', 496, 460);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
  }
}

export class IOPuzzle_Balance extends LivingCanvasStage {
  constructor() {
    super('IOPuzzle_Balance');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image(
      'fallback_bg_IOPuzzle_Balance',
      'assets/io_puzzle_balance.jpg'
    );
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_puzzle_balance.png`;
    this.load.image('goal', 'assets/goal.png');

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Rusted Key';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StageSpace';

    super.create();

    const xOffset = 0;
    const yOffset = 25;

    this.matter.add.rectangle(70 + xOffset, 360 + yOffset, 140, 720, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'wall',
    });
    this.matter.add.rectangle(1210 + xOffset, 360 + yOffset, 140, 720, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'wall',
    });

    this.matter.add.rectangle(410 + xOffset, 110 + yOffset, 820, 220, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'wall',
    });
    this.matter.add.rectangle(1122 + xOffset, 110 + yOffset, 316, 220, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'wall',
    });
    this.matter.add.rectangle(892 + xOffset, 195 + yOffset, 200, 16, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'wall',
    });

    this.matter.add.rectangle(640 + xOffset, 650 + yOffset, 1280, 140, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'wall',
    });
    this.matter.add.rectangle(892 + xOffset, 530 + yOffset, 144, 320, {
      isStatic: true,
      frictionStatic: Infinity,
      label: 'wall',
    });

    this.add.worldobject('magnet', 892, 100);

    var goal_sprite = this.add.sprite(1050, 575, 'goal');
    var goal = this.matter.add.rectangle(
      goal_sprite.x,
      goal_sprite.y,
      goal_sprite.width,
      goal_sprite.height,
      { isStatic: true, isSensor: true }
    );

    var object = this.add.worldobject('rustedkey', 280, 460);

    var wall_pos = new Phaser.Math.Vector2(380, 500);
    var wall_size = new Phaser.Math.Vector2(64, 210);
    var icewall = this.add.worldobject(
      'icewall',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });

    this.matter.world.on('collisionactive', function (event) {
      scene.checkIceMelting(event, icewall, wall_pos, wall_size);
    });
  }
}
