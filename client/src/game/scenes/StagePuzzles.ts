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

export class StagePuzzle1 extends LivingCanvasStage {
  constructor() {
    super('StagePuzzle1');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_StagePuzzle1', 'assets/io_puzzle_balance.jpg');
    this.load.image('puzzle1', 'assets/puzzle_masks/puzzle1.png');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/puzzle1.png`;
    super.preload();
  }

  create() {
    this.worldConfig.name = 'Puzzle #1';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.bgcolor = 0x448844;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StagePuzzle2';

    super.create();

    this.matter.add.rectangle(
      this.worldConfig.size.width / 2,
      this.worldConfig.size.height / 2 + 185,
      this.worldConfig.size.width * 2,
      40,
      {
        isStatic: true,
        angle: 0.5471,
        frictionStatic: Infinity,
        label: 'slope',
      }
    );

    var wall_pos = new Phaser.Math.Vector2(324, 340);
    var wall_size = new Phaser.Math.Vector2(50, 400);
    var icewall = this.add.worldobject(
      'icewall',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );
    var goal = this.matter.add.rectangle(950, 704, 128, 128, {
      isStatic: true,
      isSensor: true,
    });
    var object = this.add.worldobject('tofu', 50, 200);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });

    this.matter.world.on('collisionactive', function (event) {
      for (let i = 0; i < event.pairs.length; i++) {
        var bodyA = event.pairs[i].bodyA;
        var bodyB = event.pairs[i].bodyB;
        if (
          bodyA.gameObject == icewall &&
          WorldObject.canSetFire(bodyB.gameObject)
        ) {
          scene.updateIceMelting(bodyA.gameObject, wall_pos, wall_size);
        }
        if (
          bodyB.gameObject == icewall &&
          WorldObject.canSetFire(bodyA.gameObject)
        ) {
          scene.updateIceMelting(bodyB.gameObject, wall_pos, wall_size);
        }
      }
    });
  }
}

export class StagePuzzle2 extends LivingCanvasStage {
  constructor() {
    super('StagePuzzle2');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_StagePuzzle2', 'assets/io_puzzle_earth.jpg');
    this.load.image('puzzle2_mask', 'assets/puzzle2.png');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/puzzle2.png`;
    super.preload();
  }

  create() {
    this.worldConfig.name = 'Puzzle #2';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.bgcolor = 0x448844;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StagePuzzle3';

    super.create();

    this.matter.add.rectangle(0, 261, 820, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });
    this.matter.add.rectangle(1024, 261, 870, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });

    var goal = this.matter.add.rectangle(510, 704, 128, 128, {
      isStatic: true,
      isSensor: true,
    });
    var object = this.add.worldobject('tofu', 50, 100);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
  }
}

export class StagePuzzle3 extends LivingCanvasStage {
  constructor() {
    super('StagePuzzle3');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_StagePuzzle3', 'assets/io_puzzle_ice.jpg');
    this.load.image('puzzle3', 'assets/puzzle_masks/puzzle3.png');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/puzzle3.png`;
    super.preload();
  }

  create() {
    this.worldConfig.name = 'Puzzle #3';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.bgcolor = 0x448844;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StagePuzzle4';

    super.create();

    this.matter.add.rectangle(0, 261, 820, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });
    this.matter.add.rectangle(1024, 261, 870, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });

    var wall_pos = new Phaser.Math.Vector2(510, 261);
    var wall_size = new Phaser.Math.Vector2(400, 57);
    var icewall = this.add.worldobject(
      'icewall',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );
    var goal = this.matter.add.rectangle(510, 704, 128, 128, {
      isStatic: true,
      isSensor: true,
    });
    var object = this.add.worldobject('tofu', 510, 100);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });

    this.matter.world.on('collisionactive', function (event) {
      for (let i = 0; i < event.pairs.length; i++) {
        var bodyA = event.pairs[i].bodyA;
        var bodyB = event.pairs[i].bodyB;
        if (
          bodyA.gameObject == icewall &&
          WorldObject.canSetFire(bodyB.gameObject)
        ) {
          scene.updateIceMelting(bodyA.gameObject, wall_pos, wall_size);
        }
        if (
          bodyB.gameObject == icewall &&
          WorldObject.canSetFire(bodyA.gameObject)
        ) {
          scene.updateIceMelting(bodyB.gameObject, wall_pos, wall_size);
        }
      }
    });
  }
}

export class StagePuzzle4 extends LivingCanvasStage {
  constructor() {
    super('StagePuzzle4');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_StagePuzzle4', 'assets/io_puzzle_metal.jpg');
    this.load.image('puzzle4', 'assets/puzzle_masks/puzzle4.png');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/puzzle4.png`;
    this.load.image('bridge', 'assets/bridge.png');
    super.preload();
  }

  create() {
    this.worldConfig.name = 'Puzzle #4';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.bgcolor = 0x448844;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StagePuzzle5';

    super.create();

    this.matter.add.rectangle(0, 261, 820, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });
    this.matter.add.rectangle(1024, 261, 870, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });

    var wall_pos = new Phaser.Math.Vector2(510, 250);
    var wall_size = new Phaser.Math.Vector2(224, 89);
    var bridge = this.add.worldobject(
      'bridge',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );
    bridge.prop.wooden = true;
    var goal = this.matter.add.rectangle(510, 704, 128, 128, {
      isStatic: true,
      isSensor: true,
    });
    var object = this.add.worldobject('tofu', 510, 100);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });

    this.matter.world.on('collisionend', function (event) {
      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;
        if (bodyA.gameObject == bridge) {
          scene.explodeTogether(bodyA.gameObject, bodyB.gameObject);
        }
        if (bodyB.gameObject == bridge) {
          scene.explodeTogether(bodyB.gameObject, bodyA.gameObject);
        }
      }
    });
  }
}

export class StagePuzzle5 extends LivingCanvasStage {
  constructor() {
    super('StagePuzzle5');
  }

  preload() {
    const visualStyle = this.gameSettings?.visualStyle || 'realistic';
    this.load.image('fallback_bg_StagePuzzle5', 'assets/io_puzzle_fire.jpg');
    this.worldConfig.bgImage = `assets/generated/${visualStyle}/puzzle5.png`;
    super.preload();
  }

  create() {
    this.worldConfig.name = 'Puzzle #5';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.bgcolor = 0x448844;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StagePuzzle6';

    super.create();

    this.matter.add.rectangle(0, 261, 820, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });
    this.matter.add.rectangle(1024, 261, 870, 57, {
      isStatic: true,
      frictionStatic: Infinity,
    });

    var goal = this.matter.add.rectangle(510, 704, 128, 128, {
      isStatic: true,
      isSensor: true,
    });
    var object = this.add.worldobject('metal', 350, 100);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });
  }
}

export class StagePuzzle6 extends LivingCanvasStage {
  constructor() {
    super('StagePuzzle6');
  }

  preload() {
    this.worldConfig.bgImage = 'assets/generated/realistic/puzzle6.png';

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Puzzle #6';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.bgcolor = 0x448844;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StagePuzzle7';

    super.create();

    this.matter.add.rectangle(257, 230, 740, 40, {
      isStatic: true,
      angle: 0.2907,
      frictionStatic: Infinity,
      label: 'slope',
    });
    this.matter.add.rectangle(768, 483, 650, 40, {
      isStatic: true,
      angle: -0.2495,
      frictionStatic: Infinity,
      label: 'slope',
    });

    const wall_high = 250;
    const wall_low = 450;
    var wall_pos = new Phaser.Math.Vector2(548, wall_high);
    var wall_size = new Phaser.Math.Vector2(50, 200);
    var metalwall = this.add.worldobject(
      'metalwall',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );

    var button = this.matter.add.rectangle(925, 728, 128, 64, {
      isStatic: true,
    });

    var goal = this.matter.add.rectangle(350, 704, 128, 128, {
      isStatic: true,
      isSensor: true,
    });
    var object = this.add.worldobject('metal', 350, 100);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
    });

    this.matter.world.on('collisionactive', function (event) {
      var buttonPressed = false;
      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;
        if (bodyA == button) {
          wall_pos.y = wall_pos.y + 1;
          if (wall_pos.y > wall_low) wall_pos.y = wall_low;
          metalwall.setPosition(wall_pos.x, wall_pos.y);
          buttonPressed = true;
        }
        if (bodyB == button) {
          wall_pos.y = wall_pos.y + 1;
          if (wall_pos.y > wall_low) wall_pos.y = wall_low;
          metalwall.setPosition(wall_pos.x, wall_pos.y);
          buttonPressed = true;
        }
      }
      if (!buttonPressed) {
        wall_pos.y = wall_pos.y - 1;
        if (wall_pos.y < wall_high) wall_pos.y = wall_high;

        metalwall.setPosition(wall_pos.x, wall_pos.y);
      }
    });
  }
}

export class StagePuzzle7 extends LivingCanvasStage {
  constructor() {
    super('StagePuzzle7');
  }

  preload() {
    this.worldConfig.bgImage = 'assets/generated/realistic/puzzle7.png';

    super.preload();
  }

  create() {
    this.worldConfig.name = 'Puzzle #7';
    this.worldConfig.gameMode = 'puzzle';
    this.worldConfig.gravity.y = 9.8;
    this.worldConfig.frictionAir = 0.01;
    this.worldConfig.bgcolor = 0x448844;
    this.worldConfig.isVoidSpace = false;
    this.fireConfig = {
      speed: { min: 200, max: 300 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 500,
      alpha: { start: 1, end: 0 },
    };
    this.worldConfig.next = 'StageEarth2';

    super.create();

    this.matter.add.rectangle(133, 464, 430, 40, {
      isStatic: true,
      angle: -0.7854,
      label: 'slope',
    });
    this.matter.add.rectangle(875, 403, 400, 45, {
      isStatic: true,
      frictionStatic: Infinity,
    });
    this.matter.add.rectangle(504, 550, 80, 510, {
      isStatic: true,
      frictionStatic: Infinity,
    });

    var metalwall = this.add.worldobject('metalwall', -100, 630, 500, 80);
    metalwall.setAngle(-45);
    var wall_pos = new Phaser.Math.Vector2(504, 200);
    var wall_size = new Phaser.Math.Vector2(80, 200);
    var icewall = this.add.worldobject(
      'icewall',
      wall_pos.x,
      wall_pos.y,
      wall_size.x,
      wall_size.y
    );

    var button = this.matter.add.rectangle(112, 728, 128, 64, {
      isStatic: true,
    });

    var goal = this.matter.add.rectangle(870, 316, 128, 128, {
      isStatic: true,
      isSensor: true,
    });
    var object = this.add.worldobject('tofu', 130, 300);

    var scene = this;

    this.matter.world.on('collisionstart', function (event) {
      scene.checkGoalCondition(event, goal, object);
      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;
        if (bodyA == button) {
          object.setVelocityX(100);
        }
        if (bodyB == button) {
          object.setVelocityX(100);
        }
      }
    });

    this.matter.world.on('collisionactive', function (event) {
      for (let i = 0; i < event.pairs.length; i++) {
        var bodyA = event.pairs[i].bodyA;
        var bodyB = event.pairs[i].bodyB;
        if (
          bodyA.gameObject == icewall &&
          WorldObject.canSetFire(bodyB.gameObject)
        ) {
          scene.updateIceMelting(bodyA.gameObject, wall_pos, wall_size);
        }
        if (
          bodyB.gameObject == icewall &&
          WorldObject.canSetFire(bodyA.gameObject)
        ) {
          scene.updateIceMelting(bodyB.gameObject, wall_pos, wall_size);
        }
      }
    });
  }
}
